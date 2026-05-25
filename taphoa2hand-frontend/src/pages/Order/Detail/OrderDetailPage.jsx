import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import classNames from 'classnames/bind';
import {
    FiArrowLeft, FiCheck, FiX, FiUser, FiMapPin, FiPhone, FiMail,
    FiChevronRight, FiStar, FiCreditCard, FiPackage
} from 'react-icons/fi';
import styles from './OrderDetailPage.module.scss';
import orderService from '../../../services/orderService';
import { getUserById } from '../../../services/userService';
import * as feedbackService from '../../../services/feedbackService';
import { FeedbackForm, FeedbackList } from '../../../components/Feedback';
import PostOrdersList from '../../../components/PostOrdersList/PostOrdersList';

const cx = classNames.bind(styles);

const decodeJwt = (token) => {
    try { return JSON.parse(atob(token.split('.')[1])); }
    catch { return null; }
};
const getMeUsername = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const d = decodeJwt(token);
    return (d?.sub ?? d?.username) || null;
};

// ─── Stepper config cho thanh toán TRUNG GIAN ───
const STEPS_MIDDLEMAN = [
    'PENDING', 'CONFIRMED', 'PAID_WAITING_PICKUP',
    'SHIPPING', 'DELIVERED', 'SETTLING', 'COMPLETED'
];

// ─── Stepper config cho thanh toán TRỰC TIẾP ───
const STEPS_DIRECT = [
    'PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'COMPLETED'
];

const STEP_LABELS_MIDDLEMAN = {
    PENDING: 'Chờ duyệt',
    CONFIRMED: 'Đã duyệt',
    PAID_WAITING_PICKUP: 'Đã thanh toán',
    SHIPPING: 'Đang giao',
    DELIVERED: 'Đã giao',
    SETTLING: 'Quyết toán',
    COMPLETED: 'Hoàn thành',
};

const STEP_LABELS_DIRECT = {
    PENDING: 'Chờ duyệt',
    CONFIRMED: 'Đã duyệt',
    SHIPPING: 'Đang giao',
    DELIVERED: 'Đã giao',
    COMPLETED: 'Hoàn thành',
};

const STATUS_STYLES = {
    PENDING: { bg: '#fff9e6', color: '#92400e', border: '#fcd34d' },
    CONFIRMED: { bg: '#eff6ff', color: '#1e40af', border: '#93c5fd' },
    PAID_WAITING_PICKUP: { bg: '#f0fdf4', color: '#065f46', border: '#6ee7b7' },
    SHIPPING: { bg: '#faf5ff', color: '#5b21b6', border: '#c4b5fd' },
    DELIVERED: { bg: '#ecfdf5', color: '#065f46', border: '#34d399' },
    SETTLING: { bg: '#fff7ed', color: '#9a3412', border: '#fdba74' },
    COMPLETED: { bg: '#ecfeff', color: '#155e75', border: '#22d3ee' },
    CANCELLED: { bg: '#fef2f2', color: '#991b1b', border: '#fca5a5' },
    REPORTED: { bg: '#fefce8', color: '#854d0e', border: '#facc15' },
};

function getUserId(order, field) {
    if (!order) return null;
    if (order[field]) return order[field];
    const obj = order[field.replace('Id', '')];
    if (typeof obj === 'string') return obj;
    if (obj && typeof obj === 'object') return obj.id;
    return null;
}

const OrderDetailPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin/orders');
    const meUsername = getMeUsername();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [existingFeedback, setExistingFeedback] = useState(null);
    const [buyerInfo, setBuyerInfo] = useState(null);
    const [sellerInfo, setSellerInfo] = useState(null);
    const [sellerBankForm, setSellerBankForm] = useState({ bankName: '', accountName: '', accountNumber: '' });

    const fetchUser = async (id, setter) => {
        if (!id) return;
        try {
            const res = await getUserById(id);
            const root = res?.data;
            if (!root) return;
            setter(root.code === 1000 ? root.result : root.result ?? root);
        } catch (e) { console.error(e); }
    };

    const fetchFeedback = async (oid) => {
        try {
            const res = await feedbackService.getFeedbackByOrderId(oid);
            if (res && res.code === 1000) {
                setExistingFeedback(res.result || null);
            } else {
                setExistingFeedback(null);
            }
        } catch { setExistingFeedback(null); }
    };

    const refresh = async () => {
        try {
            const res = await orderService.getOrderDetail(orderId);
            const o = res.data?.result || res.data || res;
            setOrder(o);
            const bId = getUserId(o, 'buyerId');
            const sId = getUserId(o, 'sellerId');
            setBuyerInfo(null); setSellerInfo(null);
            await Promise.all([fetchUser(bId, setBuyerInfo), fetchUser(sId, setSellerInfo)]);
            fetchFeedback(o.id);
        } catch { toast.error('Không tải được đơn hàng'); }
    };

    useEffect(() => {
        setLoading(true);
        refresh().finally(() => setLoading(false));
    }, [orderId]);

    const formatCurrency = (v) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);
    const formatDateTime = (iso) => {
        if (!iso) return '—';
        try {
            return new Date(iso).toLocaleString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch { return iso; }
    };
    const formatEscrowTime = (unit, amount) =>
        amount != null && unit ? (unit === 'HOURS' ? `${amount} giờ` : `${amount} ngày`) : null;

    const orderStatus = order?.status?.name;
    const isDirectPayment = order?.paymentMethod?.name === 'DIRECT';

    // Chọn steps và labels dựa trên phương thức thanh toán
    const steps = isDirectPayment ? STEPS_DIRECT : STEPS_MIDDLEMAN;
    const stepLabels = isDirectPayment ? STEP_LABELS_DIRECT : STEP_LABELS_MIDDLEMAN;
    const currentStep = steps.indexOf(orderStatus);

    const st = STATUS_STYLES[orderStatus] || { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' };

    const buyerId = getUserId(order, 'buyerId');
    const sellerId = getUserId(order, 'sellerId');
    const isBuyer = Boolean(meUsername) &&
        (order?.buyerUsername === meUsername || buyerInfo?.username === meUsername);
    const isSeller = Boolean(meUsername) && sellerInfo?.username === meUsername;

    const paymentLabel = order?.paymentMethod?.name === 'MIDDLEMAN' ? 'Trung gian (ký quỹ)' : 'Trực tiếp';
    const platformFee = Number(order?.platformFee) || 0;
    const totalAmount = Number(order?.totalAmount) || 0;
    const goodsAmount = Math.max(0, totalAmount - platformFee);

    const handleSellerBankChange = (e) => {
        setSellerBankForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleConfirm = async () => {
        if (order?.paymentMethod?.name === 'MIDDLEMAN') {
            const { bankName, accountName, accountNumber } = sellerBankForm;
            if (!bankName || !accountName || !accountNumber) {
                toast.warning('Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng.');
                return;
            }
        }
        if (!window.confirm('Xác nhận đơn hàng?')) return;
        try {
            setActionLoading(true);
            if (order?.paymentMethod?.name === 'MIDDLEMAN') {
                await orderService.updateOrderStatus(orderId, 'CONFIRMED', sellerBankForm);
            } else {
                await orderService.updateOrderStatus(orderId, 'CONFIRMED');
            }
            toast.success(isSeller ? 'Đã chốt đơn.' : 'Đã xác nhận.');
            await refresh();
        } catch { toast.error('Lỗi xác nhận.'); }
        finally { setActionLoading(false); }
    };

    const handleCancel = async () => {
        if (!window.confirm('Hủy đơn?')) return;
        try {
            setActionLoading(true);
            await orderService.updateOrderStatus(orderId, 'CANCELLED');
            toast.success('Đã hủy.');
            await refresh();
        } catch { toast.error('Lỗi hủy.'); }
        finally { setActionLoading(false); }
    };

    if (loading) return (
        <div className={cx('loading-wrap')}>
            <div className={cx('spinner')} />
            <p>Đang tải đơn hàng…</p>
        </div>
    );
    if (!order) return <div className={cx('error-wrap')}>Không tìm thấy đơn hàng</div>;

    const orderPath = (id) => isAdminRoute ? `/admin/orders/${id}` : `/order/myOrder/${id}`;

    return (
        <div className={cx('page')}>
            <div className={cx('container')}>

                {/* ─── Back ─── */}
                <button className={cx('back-btn')} onClick={() => navigate(-1)}>
                    <FiArrowLeft /> Quay lại
                </button>

                <div className={cx('layout')}>

                    {/* ─── MAIN COLUMN ─── */}
                    <main className={cx('main')}>

                        {/* STEP STATUS - Hiển thị khác nhau cho từng phương thức */}
                        {orderStatus !== 'CANCELLED' && orderStatus !== 'REPORTED' && (
                            <div className={cx('stepper')}>
                                {steps.map((stepKey, i) => {
                                    const done = currentStep > i;
                                    const active = currentStep === i;

                                    return (
                                        <div key={stepKey} className={cx('step', { done, active })}>
                                            <div className={cx('step-dot')}>
                                                {done ? <FiCheck size={10} /> : <span>{i + 1}</span>}
                                            </div>
                                            <span className={cx('step-label')}>
                                                {stepLabels[stepKey]}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* CANCEL / REPORT STATE */}
                        {(orderStatus === 'CANCELLED' || orderStatus === 'REPORTED') && (
                            <div className={cx('cancelled-banner')}>
                                <FiX size={14} />
                                Đơn đã bị {orderStatus === 'CANCELLED' ? 'hủy' : 'báo cáo'}
                            </div>
                        )}

                        {/* Order Info Card */}
                        <section className={cx('card')}>
                            <div className={cx('card-header')}>
                                <div>
                                    <p className={cx('order-label')}>Mã đơn hàng</p>
                                    <p className={cx('order-id')}>#{order.id?.replace(/-/g, '').slice(0, 12).toUpperCase()}</p>
                                </div>
                                <div className={cx('order-meta-right')}>
                                    <p className={cx('order-date')}>{formatDateTime(order.createdAt)}</p>
                                    <span className={cx('status-pill')} style={{ background: st.bg, color: st.color, borderColor: st.border }}>
                                        {order.status?.displayName || orderStatus}
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* Parties */}
                        <section className={cx('card')}>
                            <h3 className={cx('card-title')}>Người tham gia</h3>
                            <div className={cx('parties')}>
                                <div className={cx('party')}>
                                    <div className={cx('party-avatar')}>
                                        {sellerInfo?.avatar ? (
                                            <img src={sellerInfo.avatar} alt="" />
                                        ) : <FiUser size={20} />}
                                    </div>
                                    <div className={cx('party-info')}>
                                        <p className={cx('party-role')}>Người bán</p>
                                        <p className={cx('party-name')}>{sellerInfo?.fullName || sellerInfo?.username || '—'}</p>
                                        {sellerInfo?.username && <p className={cx('party-username')}>@{sellerInfo.username}</p>}
                                        {sellerInfo?.email && <p className={cx('party-email')}><FiMail size={12} /> {sellerInfo.email}</p>}
                                        {sellerId && (
                                            <Link className={cx('party-link')} to={`/user/${sellerId}`}>
                                                Xem hồ sơ <FiChevronRight size={13} />
                                            </Link>
                                        )}
                                        {isSeller && <span className={cx('you-tag')}>Bạn</span>}
                                    </div>
                                </div>

                                <div className={cx('party-divider')} />

                                <div className={cx('party')}>
                                    <div className={cx('party-avatar')}>
                                        {buyerInfo?.avatar ? (
                                            <img src={buyerInfo.avatar} alt="" />
                                        ) : <FiUser size={20} />}
                                    </div>
                                    <div className={cx('party-info')}>
                                        <p className={cx('party-role')}>Người mua</p>
                                        <p className={cx('party-name')}>{buyerInfo?.fullName || buyerInfo?.username || '—'}</p>
                                        {buyerInfo?.username && <p className={cx('party-username')}>@{buyerInfo.username}</p>}
                                        {buyerInfo?.email && <p className={cx('party-email')}><FiMail size={12} /> {buyerInfo.email}</p>}
                                        {buyerId && (
                                            <Link className={cx('party-link')} to={`/user/${buyerId}`}>
                                                Xem hồ sơ <FiChevronRight size={13} />
                                            </Link>
                                        )}
                                        {isBuyer && <span className={cx('you-tag')}>Bạn</span>}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Product Items */}
                        <section className={cx('card')}>
                            <h3 className={cx('card-title')}>Sản phẩm</h3>
                            <div className={cx('product-row')}>
                                {order.postImageUrl && (
                                    <img src={order.postImageUrl} alt="" className={cx('product-thumb')} />
                                )}
                                <div className={cx('product-info')}>
                                    <p className={cx('product-title')}>{order.postTitle || 'Sản phẩm'}</p>
                                    {order.postId && <p className={cx('product-id')}>ID tin: {order.postId}</p>}
                                </div>
                            </div>
                        </section>

                        {/* Delivery */}
                        <section className={cx('card')}>
                            <h3 className={cx('card-title')}>Giao hàng</h3>
                            <div className={cx('kv-list')}>
                                <div className={cx('kv')}>
                                    <span className={cx('kv-key')}><FiUser size={14} /> Người nhận</span>
                                    <span className={cx('kv-val')}>{order.receiverName || '—'}</span>
                                </div>
                                <div className={cx('kv')}>
                                    <span className={cx('kv-key')}><FiPhone size={14} /> Điện thoại</span>
                                    <span className={cx('kv-val')}>{order.receiverPhone || '—'}</span>
                                </div>
                                <div className={cx('kv')}>
                                    <span className={cx('kv-key')}><FiMapPin size={14} /> Địa chỉ</span>
                                    <span className={cx('kv-val')}>{order.shippingAddress || '—'}</span>
                                </div>
                            </div>
                        </section>

                        {/* Payment */}
                        <section className={cx('card')}>
                            <h3 className={cx('card-title')}>Thanh toán</h3>
                            <div className={cx('kv-list')}>
                                <div className={cx('kv')}>
                                    <span className={cx('kv-key')}>Phương thức</span>
                                    <span className={cx('kv-val', 'method')}>
                                        {isDirectPayment ? 'Trực tiếp' : 'Trung gian (ký quỹ)'}
                                    </span>
                                </div>
                                <div className={cx('kv')}>
                                    <span className={cx('kv-key')}>Trạng thái TT</span>
                                    <span className={cx('kv-val')}>{order.paymentStatus?.displayName || '—'}</span>
                                </div>
                                {isDirectPayment ? (
                                    <div className={cx('kv')}>
                                        <span className={cx('kv-key')}>Ghi chú</span>
                                        <span className={cx('kv-val')}>💵 Thanh toán trực tiếp - Không qua trung gian</span>
                                    </div>
                                ) : (
                                    <>
                                        {formatEscrowTime(order.holdDurationUnit, order.holdDurationAmount) && (
                                            <div className={cx('kv')}>
                                                <span className={cx('kv-key')}>Thời gian giữ tiền</span>
                                                <span className={cx('kv-val')}>{formatEscrowTime(order.holdDurationUnit, order.holdDurationAmount)}</span>
                                            </div>
                                        )}
                                        {['DELIVERED', 'SETTLING'].includes(orderStatus) && order.holdUntil && (
                                            <div className={cx('kv')}>
                                                <span className={cx('kv-key')}>Giữ tiền đến</span>
                                                <span className={cx('kv-val')}>{formatDateTime(order.holdUntil)}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Totals */}
                            <div className={cx('totals')}>
                                {platformFee > 0 && (
                                    <>
                                        <div className={cx('total-row')}>
                                            <span>Tiền hàng</span>
                                            <span>{formatCurrency(goodsAmount)}</span>
                                        </div>
                                        <div className={cx('total-row')}>
                                            <span>Phí nền tảng</span>
                                            <span>{formatCurrency(platformFee)}</span>
                                        </div>
                                    </>
                                )}
                                <div className={cx('total-row', 'grand')}>
                                    <span>Tổng thanh toán</span>
                                    <span className={cx('grand-amount')}>{formatCurrency(totalAmount)}</span>
                                </div>
                            </div>
                        </section>

                        {/* Bank Info */}
                        {order.paymentMethod?.name === 'MIDDLEMAN' && (
                            <section className={cx('card')}>
                                <h3 className={cx('card-title')}>Tài khoản ngân hàng</h3>
                                <div className={cx('bank-grid')}>
                                    {order.buyerBankInfo && (
                                        <div className={cx('bank-box')}>
                                            <p className={cx('bank-role')}>Người mua (hoàn tiền)</p>
                                            <p className={cx('bank-info')}>{order.buyerBankInfo.bankName}</p>
                                            <p className={cx('bank-info')}>{order.buyerBankInfo.accountName}</p>
                                            <p className={cx('bank-info', 'mono')}>{order.buyerBankInfo.accountNumber}</p>
                                        </div>
                                    )}
                                    {order.sellerBankInfo && (
                                        <div className={cx('bank-box')}>
                                            <p className={cx('bank-role')}>Người bán (nhận tiền)</p>
                                            <p className={cx('bank-info')}>{order.sellerBankInfo.bankName}</p>
                                            <p className={cx('bank-info')}>{order.sellerBankInfo.accountName}</p>
                                            <p className={cx('bank-info', 'mono')}>{order.sellerBankInfo.accountNumber}</p>
                                        </div>
                                    )}
                                </div>
                                {isSeller && orderStatus === 'PENDING' && !order.sellerBankInfo && (
                                    <div className={cx('bank-form')}>
                                        <p className={cx('bank-form-hint')}>
                                            Nhập STK nhận tiền (bắt buộc khi chấp nhận đơn trung gian)
                                        </p>
                                        <input type="text" name="bankName" placeholder="Tên ngân hàng" value={sellerBankForm.bankName} onChange={handleSellerBankChange} />
                                        <input type="text" name="accountName" placeholder="Chủ tài khoản" value={sellerBankForm.accountName} onChange={handleSellerBankChange} />
                                        <input type="text" name="accountNumber" placeholder="Số tài khoản" value={sellerBankForm.accountNumber} onChange={handleSellerBankChange} />
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Action Buttons */}
                        {/* Kiểm tra xem có phải thanh toán trực tiếp không */}
                        {(() => {
                            const isDirect = order?.paymentMethod?.name === 'DIRECT';

                            // ===== THANH TOÁN TRỰC TIẾP =====
                            if (isDirect) {
                                // Người bán: duyệt/từ chối, bắt đầu giao, xác nhận đã giao
                                if (isSeller) {
                                    return (
                                        <section className={cx('card', 'actions-card')}>
                                            {/* PENDING: duyệt hoặc từ chối */}
                                            {orderStatus === 'PENDING' && (
                                                <>
                                                    <button className={cx('btn', 'btn-danger')} onClick={handleCancel} disabled={actionLoading}>
                                                        <FiX /> {actionLoading ? '…' : 'Từ chối đơn'}
                                                    </button>
                                                    <button className={cx('btn', 'btn-primary')} onClick={handleConfirm} disabled={actionLoading}>
                                                        <FiCheck /> {actionLoading ? '…' : 'Chấp nhận đơn'}
                                                    </button>
                                                </>
                                            )}
                                            {/* CONFIRMED: bắt đầu giao */}
                                            {orderStatus === 'CONFIRMED' && (
                                                <button className={cx('btn', 'btn-primary')} onClick={async () => {
                                                    setActionLoading(true);
                                                    try {
                                                        await orderService.updateOrderStatus(orderId, 'SHIPPING');
                                                        toast.success('Đã bắt đầu giao hàng');
                                                        await refresh();
                                                    } catch { toast.error('Lỗi cập nhật.'); }
                                                    finally { setActionLoading(false); }
                                                }} disabled={actionLoading}>
                                                    <FiPackage /> {actionLoading ? '…' : 'Bắt đầu giao hàng'}
                                                </button>
                                            )}
                                            {/* SHIPPING: xác nhận đã giao */}
                                            {orderStatus === 'SHIPPING' && (
                                                <button className={cx('btn', 'btn-success')} onClick={async () => {
                                                    if (!window.confirm('Xác nhận đã giao hàng thành công?')) return;
                                                    setActionLoading(true);
                                                    try {
                                                        await orderService.updateOrderStatus(orderId, 'DELIVERED');
                                                        toast.success('Đã xác nhận giao hàng');
                                                        await refresh();
                                                    } catch { toast.error('Lỗi xác nhận.'); }
                                                    finally { setActionLoading(false); }
                                                }} disabled={actionLoading}>
                                                    <FiCheck /> {actionLoading ? '…' : 'Xác nhận đã giao'}
                                                </button>
                                            )}
                                        </section>
                                    );
                                }

                                // Người mua: hủy đơn khi PENDING/CONFIRMED, xác nhận hoàn thành khi DELIVERED
                                if (isBuyer) {
                                    return (
                                        <section className={cx('card', 'actions-card')}>
                                            {(orderStatus === 'PENDING' || orderStatus === 'CONFIRMED') && (
                                                <button className={cx('btn', 'btn-danger')} onClick={handleCancel} disabled={actionLoading}>
                                                    <FiX /> {actionLoading ? '…' : 'Hủy đơn'}
                                                </button>
                                            )}
                                            {orderStatus === 'DELIVERED' && (
                                                <button className={cx('btn', 'btn-success')} onClick={async () => {
                                                    if (!window.confirm('Xác nhận hoàn thành đơn hàng?')) return;
                                                    setActionLoading(true);
                                                    try {
                                                        await orderService.updateOrderStatus(orderId, 'COMPLETED');
                                                        toast.success('Đã xác nhận hoàn thành!');
                                                        await refresh();
                                                    } catch (e) {
                                                        console.error('Error:', e);
                                                        toast.error('Lỗi xác nhận: ' + (e?.message || e));
                                                    }
                                                    finally { setActionLoading(false); }
                                                }} disabled={actionLoading}>
                                                    <FiCheck /> {actionLoading ? '…' : 'Xác nhận hoàn thành'}
                                                </button>
                                            )}
                                        </section>
                                    );
                                }
                            }

                            // ===== THANH TOÁN TRUNG GIAN =====
                            // Người bán: duyệt/từ chối, cập nhật trạng thái giao hàng
                            if (isSeller) {
                                return (
                                    <section className={cx('card', 'actions-card')}>
                                        {/* PENDING: duyệt hoặc từ chối */}
                                        {orderStatus === 'PENDING' && (
                                            <>
                                                <button className={cx('btn', 'btn-danger')} onClick={handleCancel} disabled={actionLoading}>
                                                    <FiX /> {actionLoading ? '…' : 'Từ chối đơn'}
                                                </button>
                                                <button className={cx('btn', 'btn-primary')} onClick={handleConfirm} disabled={actionLoading}>
                                                    <FiCheck /> {actionLoading ? '…' : 'Chấp nhận đơn'}
                                                </button>
                                            </>
                                        )}
                                        {/* SHIPPING: đánh dấu đã giao */}
                                        {orderStatus === 'SHIPPING' && (
                                            <button className={cx('btn', 'btn-success')} onClick={async () => {
                                                if (!window.confirm('Xác nhận đã giao hàng thành công?')) return;
                                                setActionLoading(true);
                                                try {
                                                    await orderService.updateOrderStatus(orderId, 'DELIVERED');
                                                    toast.success('Đã xác nhận giao hàng');
                                                    await refresh();
                                                } catch { toast.error('Lỗi xác nhận.'); }
                                                finally { setActionLoading(false); }
                                            }} disabled={actionLoading}>
                                                <FiCheck /> {actionLoading ? '…' : 'Xác nhận đã giao'}
                                            </button>
                                        )}
                                    </section>
                                );
                            }

                            // Người mua trung gian: hủy đơn khi PENDING, xác nhận hoàn thành khi SETTLING
                            if (isBuyer) {
                                return (
                                    <section className={cx('card', 'actions-card')}>
                                        {orderStatus === 'PENDING' && (
                                            <button className={cx('btn', 'btn-danger')} onClick={handleCancel} disabled={actionLoading}>
                                                <FiX /> {actionLoading ? '…' : 'Hủy đơn'}
                                            </button>
                                        )}
                                        {orderStatus === 'SETTLING' && (
                                            <button className={cx('btn', 'btn-success')} onClick={async () => {
                                                if (!window.confirm('Xác nhận hoàn thành đơn hàng?')) return;
                                                setActionLoading(true);
                                                try {
                                                    await orderService.updateOrderStatus(orderId, 'COMPLETED');
                                                    toast.success('Đã xác nhận hoàn thành!');
                                                    await refresh();
                                                } catch { toast.error('Lỗi xác nhận.'); }
                                                finally { setActionLoading(false); }
                                            }} disabled={actionLoading}>
                                                <FiCheck /> {actionLoading ? '…' : 'Xác nhận hoàn thành'}
                                            </button>
                                        )}
                                    </section>
                                );
                            }
                        })()}

                        {/* Feedback */}
                        {isBuyer && ['COMPLETED'].includes(orderStatus) && (
                            <section className={cx('card', 'feedback-section')}>
                                <h3 className={cx('card-title')}>Đánh giá</h3>
                                {!existingFeedback && !showFeedbackForm && (
                                    <button className={cx('btn', 'btn-outline')} onClick={() => setShowFeedbackForm(true)}>
                                        <FiStar /> Viết đánh giá
                                    </button>
                                )}
                                {showFeedbackForm && !existingFeedback && (
                                    <div className={cx('feedback-form-wrap')}>
                                        <FeedbackForm
                                            order={order}
                                            mode="create"
                                            onSuccess={(fb) => { setExistingFeedback(fb); setShowFeedbackForm(false); toast.success('Đánh giá đã được gửi!'); }}
                                            onCancel={() => setShowFeedbackForm(false)}
                                        />
                                    </div>
                                )}
                                {existingFeedback && (
                                    <FeedbackList feedbacks={[existingFeedback]} />
                                )}
                            </section>
                        )}

                        {isSeller && ['DELIVERED', 'SETTLING', 'COMPLETED'].includes(orderStatus) && existingFeedback && (
                            <section className={cx('card', 'feedback-section')}>
                                <h3 className={cx('card-title')}>Đánh giá từ khách</h3>
                                <FeedbackList feedbacks={[existingFeedback]} />
                            </section>
                        )}

                    </main>

                    {/* ─── SIDEBAR ─── */}
                    {order.postId && (
                        <aside className={cx('sidebar')}>
                            <PostOrdersList
                                postId={order.postId}
                                currentOrderId={order.id}
                                orderDetailPath={orderPath}
                            />
                        </aside>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
