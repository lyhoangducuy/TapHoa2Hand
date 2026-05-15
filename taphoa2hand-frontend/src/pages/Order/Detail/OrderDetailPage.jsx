import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import classNames from 'classnames/bind';
import styles from './OrderDetailPage.module.scss';
import orderService from '../../../services/orderService';
import AdminSettlementModal, {
    canAdminOpenSettlementModal,
    isMiddlemanDeliveredHoldPassed,
} from '../../Admin/Orders/AdminSettlementModal';
import { getUserById } from '../../../services/userService';
import * as feedbackService from '../../../services/feedbackService';
import { FeedbackForm, FeedbackList } from '../../../components/Feedback';
import PostOrdersList from '../../../components/PostOrdersList/PostOrdersList';

const cx = classNames.bind(styles);

const decodeJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
};

const getMeUsername = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const d = decodeJwt(token);
    const u = d?.sub ?? d?.username;
    return typeof u === 'string' && u.trim() ? u.trim() : null;
};

const OrderDetailPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isAdminOrderRoute = location.pathname.startsWith('/admin/orders');

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [existingFeedback, setExistingFeedback] = useState(null);
    const [buyerInfo, setBuyerInfo] = useState(null);
    const [sellerInfo, setSellerInfo] = useState(null);
    const [sellerBankForm, setSellerBankForm] = useState({ bankName: '', accountName: '', accountNumber: '' });
    const [settlementOpen, setSettlementOpen] = useState(false);
    const [settlementBegin, setSettlementBegin] = useState(false);
    const [settlementConfirm, setSettlementConfirm] = useState(false);

    const meUsername = getMeUsername();

    const getUserIdFromOrder = (orderData, userIdField) => {
        if (!orderData) return null;
        if (orderData[userIdField]) return orderData[userIdField];
        const userObj = orderData[userIdField.replace('Id', '')];
        if (typeof userObj === 'string') return userObj;
        if (userObj && typeof userObj === 'object') return userObj.id;
        return null;
    };

    const fetchUserInfo = async (userId, setter) => {
        if (!userId) return;
        try {
            const res = await getUserById(userId);
            const root = res?.data;
            if (!root) return;
            const userObj = root.code === 1000 ? root.result : root.result ?? root;
            if (userObj && typeof userObj === 'object') setter(userObj);
        } catch (error) {
            console.error('Error fetching user info', userId, error);
        }
    };

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const res = await orderService.getOrderDetail(orderId);
                const responseOrder = res.data?.result || res.data || res;
                setOrder(responseOrder);

                const buyerId = getUserIdFromOrder(responseOrder, 'buyerId');
                const sellerId = getUserIdFromOrder(responseOrder, 'sellerId');
                setBuyerInfo(null);
                setSellerInfo(null);
                await Promise.all([
                    fetchUserInfo(buyerId, setBuyerInfo),
                    fetchUserInfo(sellerId, setSellerInfo),
                ]);

                if (responseOrder?.id) {
                    fetchFeedback(responseOrder.id);
                }
            } catch {
                toast.error('Không tải được đơn hàng');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    const fetchFeedback = async (oid) => {
        try {
            const res = await feedbackService.getFeedbackByOrderId(oid);
            if (res.result) setExistingFeedback(res.result);
            else setExistingFeedback(null);
        } catch {
            setExistingFeedback(null);
        }
    };

    const refreshOrder = async () => {
        const res = await orderService.getOrderDetail(orderId);
        const responseOrder = res.data?.result || res.data || res;
        setOrder(responseOrder);
        fetchFeedback(responseOrder?.id);
        const buyerId = getUserIdFromOrder(responseOrder, 'buyerId');
        const sellerId = getUserIdFromOrder(responseOrder, 'sellerId');
        setBuyerInfo(null);
        setSellerInfo(null);
        await Promise.all([
            fetchUserInfo(buyerId, setBuyerInfo),
            fetchUserInfo(sellerId, setSellerInfo),
        ]);
    };

    const handleOpenAdminSettlement = async () => {
        if (!order) return;
        setSettlementBegin(true);
        try {
            if (order.status?.name === 'DELIVERED' && isMiddlemanDeliveredHoldPassed(order)) {
                const res = await orderService.updateOrderStatus(orderId, 'SETTLING');
                const body = res?.data ?? res;
                if (body?.code !== 1000) {
                    toast.error(body?.message || 'Không chuyển được sang bước giải ngân');
                    return;
                }
                await refreshOrder();
            }
            setSettlementOpen(true);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Lỗi');
        } finally {
            setSettlementBegin(false);
        }
    };

    const handleConfirmAdminSettlement = async () => {
        try {
            setSettlementConfirm(true);
            const res = await orderService.adminEscrowPayout(orderId);
            const body = res?.data ?? res;
            if (body?.code === 1000) {
                toast.success('Đã xác nhận hoàn tất chuyển tiền cho người bán');
                setSettlementOpen(false);
                await refreshOrder();
            } else {
                toast.error(body?.message || 'Thao tác thất bại');
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Thao tác thất bại');
        } finally {
            setSettlementConfirm(false);
        }
    };

    const handleConfirm = async () => {
        if (order.paymentMethod?.name === 'MIDDLEMAN') {
            const { bankName, accountName, accountNumber } = sellerBankForm;
            if (!bankName || !accountName || !accountNumber) {
                toast.warning('Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng của bạn trước khi xác nhận.');
                return;
            }
        }

        if (!window.confirm('Xác nhận đơn?')) return;

        try {
            setActionLoading(true);
            if (order.paymentMethod?.name === 'MIDDLEMAN') {
                await orderService.updateOrderStatus(orderId, 'CONFIRMED', sellerBankForm);
            } else {
                await orderService.updateOrderStatus(orderId, 'CONFIRMED');
            }
            const isSellerActing = meUsername && sellerInfo?.username === meUsername;
            toast.success(
                isSellerActing
                    ? 'Đã chốt đơn. Các yêu cầu khác cùng tin đăng đã được hủy.'
                    : 'Đã xác nhận'
            );
            await refreshOrder();
        } catch {
            toast.error('Lỗi xác nhận');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!window.confirm('Hủy đơn?')) return;

        try {
            setActionLoading(true);
            await orderService.updateOrderStatus(orderId, 'CANCELLED');
            toast.success('Đã hủy');
            await refreshOrder();
        } catch {
            toast.error('Lỗi hủy');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSellerBankChange = (e) => {
        const { name, value } = e.target;
        setSellerBankForm((prev) => ({ ...prev, [name]: value }));
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount || 0);

    const formatEscrowHoldLabel = (unit, amount) => {
        if (amount == null || amount === '' || !unit) return null;
        return unit === 'HOURS' ? `${amount} giờ` : `${amount} ngày`;
    };

    const formatDateTime = (iso) => {
        if (!iso) return '—';
        try {
            return new Date(iso).toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return iso;
        }
    };

    const statusStyles = {
        PENDING: { bg: '#fffbeb', border: '#fcd34d', color: '#92400e' },
        CONFIRMED: { bg: '#eff6ff', border: '#93c5fd', color: '#1e40af' },
        PAID_WAITING_PICKUP: { bg: '#ecfdf5', border: '#6ee7b7', color: '#065f46' },
        SHIPPING: { bg: '#f5f3ff', border: '#c4b5fd', color: '#5b21b6' },
        DELIVERED: { bg: '#ecfdf5', border: '#34d399', color: '#065f46' },
        SETTLING: { bg: '#fff7ed', border: '#fdba74', color: '#9a3412' },
        COMPLETED: { bg: '#ecfeff', border: '#22d3ee', color: '#155e75' },
        CANCELLED: { bg: '#fef2f2', border: '#fca5a5', color: '#991b1b' },
    };

    if (loading) {
        return (
            <div className={cx('loading')}>
                <div className={cx('spinner')} />
                <p>Đang tải đơn hàng…</p>
            </div>
        );
    }

    if (!order) {
        return <div className={cx('error')}>Không tìm thấy đơn hàng</div>;
    }

    const orderStatus = order.status?.name;
    const st = statusStyles[orderStatus] || { bg: '#f3f4f6', border: '#d1d5db', color: '#374151' };
    const buyerId = getUserIdFromOrder(order, 'buyerId');
    const sellerId = getUserIdFromOrder(order, 'sellerId');

    const isBuyer =
        Boolean(meUsername) &&
        (order.buyerUsername === meUsername || buyerInfo?.username === meUsername);
    const isSeller = Boolean(meUsername) && sellerInfo?.username === meUsername;

    const paymentMethodLabel =
        order.paymentMethod?.name === 'MIDDLEMAN' ? 'Trung gian (ký quỹ)' : 'Trực tiếp';
    const paymentStatusLabel = order.paymentStatus?.displayName || '—';

    const platformFee = Number(order.platformFee) || 0;
    const totalAmount = Number(order.totalAmount) || 0;
    const goodsAmount = Math.max(0, totalAmount - platformFee);
    const lineAmount = platformFee > 0 ? goodsAmount : totalAmount;

    const renderParty = (label, info, id, isYou) => (
        <div className={cx('party')}>
            <p className={cx('partyLabel')}>{label}</p>
            <div className={cx('partyRow')}>
                <div className={cx('partyAvatar')}>
                    {info?.avatar ? <img src={info.avatar} alt="" /> : '◆'}
                </div>
                <div className={cx('partyText')}>
                    <p className={cx('partyName')}>{info?.fullName || info?.username || id || '—'}</p>
                    {info?.username ? <p className={cx('partyUser')}>@{info.username}</p> : null}
                    {info?.email ? <p className={cx('partyEmail')}>{info.email}</p> : null}
                    {id ? (
                        <Link className={cx('profileLink')} to={`/user/${id}`}>
                            Xem hồ sơ
                        </Link>
                    ) : null}
                    {isYou ? <span className={cx('youTag')}>Bạn</span> : null}
                </div>
            </div>
        </div>
    );

    const adminOrderPath = (id) => `/admin/orders/${id}`;

    return (
        <div className={cx('page')}>
            <div className={cx('inner')}>
                <div className={cx('toolbar')}>
                    <button type="button" className={cx('backLink')} onClick={() => navigate(-1)}>
                        ← Quay lại
                    </button>
                </div>

                <div className={cx('layout')}>
                <article className={cx('invoice')}>
                    <header className={cx('invoiceHeader')}>
                        <div className={cx('brandBlock')}>
                            <p className={cx('brandName')}>TapHoa2Hand</p>
                            <h1 className={cx('docTitle')}>Sales order</h1>
                        </div>
                        <div className={cx('metaGrid')}>
                            <div>
                                <dt>Trạng thái</dt>
                                <dd>
                                    <span
                                        className={cx('statusPill')}
                                        style={{
                                            background: st.bg,
                                            borderColor: st.border,
                                            color: st.color,
                                        }}
                                    >
                                        {order.status?.displayName || orderStatus}
                                    </span>
                                </dd>
                            </div>
                            <div>
                                <dt>Mã đơn hàng</dt>
                                <dd>#{order.id?.replace(/-/g, '').slice(0, 12).toUpperCase()}</dd>
                            </div>
                            <div>
                                <dt>Ngày lập</dt>
                                <dd>{formatDateTime(order.createdAt)}</dd>
                            </div>
                        </div>
                    </header>

                    <div className={cx('invoiceBody')}>
                        <div className={cx('parties')}>
                            {renderParty('Người bán', sellerInfo, sellerId, isSeller)}
                            {renderParty('Người mua', buyerInfo, buyerId, isBuyer)}
                        </div>

                        <h2 className={cx('sectionTitle')}>Chi tiết mặt hàng</h2>
                        <div className={cx('tableWrap')}>
                            <table className={cx('lineTable')}>
                                <thead>
                                    <tr>
                                        <th>Mô tả</th>
                                        <th>SL</th>
                                        <th>Đơn giá</th>
                                        <th>Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <div className={cx('lineDesc')}>
                                                {order.postImageUrl ? (
                                                    <img
                                                        className={cx('lineThumb')}
                                                        src={order.postImageUrl}
                                                        alt=""
                                                    />
                                                ) : null}
                                                <div>
                                                    <p className={cx('lineTitle')}>
                                                        {order.postTitle || 'Tin đăng / sản phẩm'}
                                                    </p>
                                                    {order.postId ? (
                                                        <p className={cx('lineMeta')}>ID tin: {order.postId}</p>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </td>
                                        <td>1</td>
                                        <td>{formatCurrency(lineAmount)}</td>
                                        <td>{formatCurrency(lineAmount)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className={cx('totals')}>
                            {platformFee > 0 ? (
                                <div className={cx('totalRow')}>
                                    <span>Tạm tính (hàng)</span>
                                    <span className={cx('amount')}>{formatCurrency(goodsAmount)}</span>
                                </div>
                            ) : null}
                            {platformFee > 0 ? (
                                <div className={cx('totalRow')}>
                                    <span>Phí nền tảng</span>
                                    <span className={cx('amount')}>{formatCurrency(platformFee)}</span>
                                </div>
                            ) : null}
                            <div className={cx('totalRow', 'grand')}>
                                <span>Tổng thanh toán</span>
                                <span className={cx('amount')}>{formatCurrency(totalAmount)}</span>
                            </div>
                        </div>

                        <h2 className={cx('sectionTitle')}>Giao hàng</h2>
                        <dl className={cx('kvBlock')}>
                            <div className={cx('kvRow')}>
                                <dt>Người nhận</dt>
                                <dd>{order.receiverName || '—'}</dd>
                            </div>
                            <div className={cx('kvRow')}>
                                <dt>Điện thoại</dt>
                                <dd>{order.receiverPhone || '—'}</dd>
                            </div>
                            <div className={cx('kvRow')}>
                                <dt>Địa chỉ</dt>
                                <dd>{order.shippingAddress || '—'}</dd>
                            </div>
                        </dl>

                        <h2 className={cx('sectionTitle')}>Thanh toán</h2>
                        <dl className={cx('kvBlock')}>
                            <div className={cx('kvRow')}>
                                <dt>Phương thức</dt>
                                <dd>{paymentMethodLabel}</dd>
                            </div>
                            <div className={cx('kvRow')}>
                                <dt>Trạng thái thanh toán</dt>
                                <dd>{paymentStatusLabel}</dd>
                            </div>
                            {order.paymentMethod?.name === 'MIDDLEMAN' &&
                                formatEscrowHoldLabel(order.holdDurationUnit, order.holdDurationAmount) && (
                                    <div className={cx('kvRow')}>
                                        <dt>Thời gian giữ tiền</dt>
                                        <dd>
                                            {formatEscrowHoldLabel(
                                                order.holdDurationUnit,
                                                order.holdDurationAmount
                                            )}
                                        </dd>
                                    </div>
                                )}
                            {order.paymentMethod?.name === 'MIDDLEMAN' &&
                                (orderStatus === 'DELIVERED' || orderStatus === 'SETTLING') &&
                                order.holdUntil && (
                                    <div className={cx('kvRow')}>
                                        <dt>Giữ tiền đến</dt>
                                        <dd>{formatDateTime(order.holdUntil)}</dd>
                                    </div>
                                )}
                        </dl>

                        {isAdminOrderRoute && canAdminOpenSettlementModal(order) && (
                            <div className={cx('adminEscrow')}>
                                <p className={cx('adminEscrowText')}>
                                    Đơn trung gian: mở bước giải ngân để xem QR demo và số tiền chuyển cho người bán
                                    (đã trừ phí sàn). Sau khi chuyển khoản thủ công, xác nhận để chuyển đơn sang hoàn
                                    tất.
                                </p>
                                <button
                                    type="button"
                                    className={cx('btn', 'primary')}
                                    onClick={handleOpenAdminSettlement}
                                    disabled={settlementBegin}
                                >
                                    {settlementBegin ? 'Đang xử lý…' : 'Giải ngân (QR demo)'}
                                </button>
                            </div>
                        )}

                        {order.paymentMethod?.name === 'MIDDLEMAN' && (
                            <>
                                <h2 className={cx('sectionTitle')}>Tài khoản ngân hàng</h2>
                                <div className={cx('bankGrid')}>
                                    {order.buyerBankInfo && (
                                        <div className={cx('bankBox')}>
                                            <h4>Người mua</h4>
                                            <div className={cx('bankMono')}>
                                                {order.buyerBankInfo.bankName}
                                                <br />
                                                {order.buyerBankInfo.accountName}
                                                <br />
                                                {order.buyerBankInfo.accountNumber}
                                            </div>
                                        </div>
                                    )}
                                    {order.sellerBankInfo && (
                                        <div className={cx('bankBox')}>
                                            <h4>Người bán</h4>
                                            <div className={cx('bankMono')}>
                                                {order.sellerBankInfo.bankName}
                                                <br />
                                                {order.sellerBankInfo.accountName}
                                                <br />
                                                {order.sellerBankInfo.accountNumber}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {isSeller && orderStatus === 'PENDING' && !order.sellerBankInfo && (
                                    <div className={cx('bankForm')}>
                                        <p className={cx('partyLabel')} style={{ marginBottom: 8 }}>
                                            Nhập STK nhận tiền (bắt buộc khi chấp nhận đơn trung gian)
                                        </p>
                                        <input
                                            type="text"
                                            name="bankName"
                                            value={sellerBankForm.bankName}
                                            onChange={handleSellerBankChange}
                                            placeholder="Tên ngân hàng"
                                        />
                                        <input
                                            type="text"
                                            name="accountName"
                                            value={sellerBankForm.accountName}
                                            onChange={handleSellerBankChange}
                                            placeholder="Chủ tài khoản"
                                        />
                                        <input
                                            type="text"
                                            name="accountNumber"
                                            value={sellerBankForm.accountNumber}
                                            onChange={handleSellerBankChange}
                                            placeholder="Số tài khoản"
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        {((isSeller && orderStatus === 'PENDING') || (isBuyer && orderStatus === 'PENDING')) && (
                            <div className={cx('actions')}>
                                {isSeller && orderStatus === 'PENDING' && (
                                    <>
                                        <button
                                            type="button"
                                            className={cx('btn', 'danger')}
                                            onClick={handleCancel}
                                            disabled={actionLoading}
                                        >
                                            {actionLoading ? 'Đang xử lý…' : 'Từ chối đơn'}
                                        </button>
                                        <button
                                            type="button"
                                            className={cx('btn', 'primary')}
                                            onClick={handleConfirm}
                                            disabled={actionLoading}
                                        >
                                            {actionLoading ? 'Đang xử lý…' : 'Chấp nhận đơn'}
                                        </button>
                                    </>
                                )}
                                {isBuyer && orderStatus === 'PENDING' && !isSeller && (
                                    <button
                                        type="button"
                                        className={cx('btn', 'danger')}
                                        onClick={handleCancel}
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? 'Đang xử lý…' : 'Hủy đơn'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </article>

                {order.postId ? (
                    <aside className={cx('sidebar')}>
                        <PostOrdersList
                            postId={order.postId}
                            currentOrderId={order.id}
                            orderDetailPath={
                                isAdminOrderRoute ? adminOrderPath : (id) => `/order/myOrder/${id}`
                            }
                        />
                    </aside>
                ) : null}
                </div>

                <AdminSettlementModal
                    visible={settlementOpen}
                    order={order}
                    onClose={() => setSettlementOpen(false)}
                    confirmLoading={settlementConfirm}
                    onConfirmTransfer={handleConfirmAdminSettlement}
                />

                {isBuyer &&
                    (orderStatus === 'DELIVERED' ||
                        orderStatus === 'SETTLING' ||
                        orderStatus === 'COMPLETED') && (
                    <section className={cx('feedbackBlock')}>
                        <h2>Đánh giá</h2>
                        <p className={cx('sub')}>Chia sẻ trải nghiệm sau khi nhận hàng</p>
                        {!existingFeedback && !showFeedbackForm && (
                            <button
                                type="button"
                                className={cx('btnWide')}
                                onClick={() => setShowFeedbackForm(true)}
                            >
                                Viết đánh giá
                            </button>
                        )}
                        {showFeedbackForm && !existingFeedback && (
                            <div className={cx('feedbackFormBox')}>
                                <FeedbackForm
                                    orderId={order.id}
                                    targetUserName={
                                        sellerInfo?.fullName || sellerInfo?.username || 'Người bán'
                                    }
                                    onSuccess={(feedback) => {
                                        setExistingFeedback(feedback);
                                        setShowFeedbackForm(false);
                                        toast.success('Đánh giá đã được gửi!');
                                    }}
                                    onCancel={() => setShowFeedbackForm(false)}
                                />
                            </div>
                        )}
                        {existingFeedback && (
                            <div>
                                <p className={cx('partyLabel')} style={{ marginBottom: 12 }}>
                                    Đánh giá của bạn
                                </p>
                                <FeedbackList feedbacks={[existingFeedback]} />
                            </div>
                        )}
                    </section>
                )}

                {isSeller &&
                    (orderStatus === 'DELIVERED' ||
                        orderStatus === 'SETTLING' ||
                        orderStatus === 'COMPLETED') && (
                    <section className={cx('feedbackBlock')}>
                        <h2>Đánh giá từ khách</h2>
                        {existingFeedback ? (
                            <FeedbackList feedbacks={[existingFeedback]} />
                        ) : (
                            <p className={cx('sub')}>Chưa có đánh giá cho đơn này.</p>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
};

export default OrderDetailPage;
