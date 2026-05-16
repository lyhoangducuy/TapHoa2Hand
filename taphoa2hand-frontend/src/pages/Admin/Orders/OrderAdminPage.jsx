import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import classNames from 'classnames/bind';
import {
    CCard,
    CCardBody,
    CCardHeader,
    CButton,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CFormInput,
    CFormSelect,
    CPagination,
    CPaginationItem,
    CSpinner,
} from '@coreui/react';
import styles from './OrderAdminPage.module.scss';
import orderService from '../../../services/orderService';

const cx = classNames.bind(styles);

const ORDER_STATUSES = [
    { value: '', label: 'Tất cả trạng thái đơn' },
    { value: 'PENDING', label: 'Chờ xác nhận' },
    { value: 'CONFIRMED', label: 'Đã xác nhận, chờ thanh toán' },
    { value: 'PAID_WAITING_PICKUP', label: 'Đã thanh toán, chờ lấy hàng' },
    { value: 'SHIPPING', label: 'Đang giao hàng' },
    { value: 'DELIVERED', label: 'Đã giao thành công' },
    { value: 'SETTLING', label: 'Đang giải ngân (trung gian)' },
    { value: 'COMPLETED', label: 'Hoàn tất (đã chuyển tiền NB)' },
    { value: 'CANCELLED', label: 'Đã hủy' },
    { value: 'RETURNED', label: 'Trả hàng/Hoàn tiền' },
];

const PAYMENT_METHODS = [
    { value: '', label: 'Tất cả phương thức' },
    { value: 'DIRECT', label: 'Trực tiếp' },
    { value: 'MIDDLEMAN', label: 'Trung gian' },
];

const PAYMENT_STATUSES = [
    { value: '', label: 'Tất cả TT thanh toán' },
    { value: 'UNPAID', label: 'Chưa thanh toán' },
    { value: 'PAID', label: 'Đã thanh toán' },
    { value: 'REFUNDED', label: 'Đã hoàn tiền' },
];
const getStatusClass = (status) => {
    switch (status) {
        case 'PENDING':
            return 'statusPending';
        case 'CONFIRMED':
            return 'statusConfirmed';
        case 'PAID_WAITING_PICKUP':
            return 'statusPaidWaitingPickup';
        case 'SHIPPING':
            return 'statusShipping';
        case 'DELIVERED':
            return 'statusDelivered';
        case 'SETTLING':
            return 'statusSettling';
        case 'COMPLETED':
            return 'statusCompleted';
        case 'CANCELLED':
        case 'CANCELLED_AUTO':
            return 'statusCancelled';
        case 'RETURNED':
            return 'statusReturned';
        default:
            return '';
    }
};
const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount || 0);

const formatDateTime = (value) => {
    if (!value) return '---';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '---';
    return d.toLocaleString('vi-VN');
};

function OrderUserCell({ username, avatar, userId }) {
    const showName = username?.trim();
    const initial = (showName || userId || '?').charAt(0).toUpperCase();
    return (
        <div className={cx('userCell')} title={userId ? `ID: ${userId}` : undefined}>
            {avatar ? (
                <img className={cx('userAvatar')} src={avatar} alt="" referrerPolicy="no-referrer" />
            ) : (
                <div className={cx('userAvatar', 'userAvatarPlaceholder')} aria-hidden>
                    {initial}
                </div>
            )}
            <div className={cx('userMeta')}>
                <span className={cx('userName')}>
                    {showName ? `@${showName}` : userId ? `${userId.slice(0, 8)}…` : '—'}
                </span>
            </div>
        </div>
    );
}

const OrderAdminPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filterOrderStatus, setFilterOrderStatus] = useState('');
    const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
    const [filterPaymentStatus, setFilterPaymentStatus] = useState('');

    const fetchOrders = useCallback(async (page) => {
        try {
            setLoading(true);
            const res = await orderService.getAdminOrders(
                page,
                10,
                filterOrderStatus || undefined,
                filterPaymentMethod || undefined,
                filterPaymentStatus || undefined
            );
            const body = res?.data ?? res;
            if (body?.code === 1000 && body.result != null) {
                const pageData = body.result;
                const list = Array.isArray(pageData.content) ? pageData.content : [];
                setOrders(list);
                setTotalPages(
                    typeof pageData.totalPages === 'number' && pageData.totalPages >= 1
                        ? pageData.totalPages
                        : 1
                );
            } else {
                setOrders([]);
                setTotalPages(1);
                if (body?.message) toast.warning(body.message);
            }
        } catch (error) {
            console.error('Lỗi lấy danh sách đơn hàng:', error);
            setOrders([]);
            toast.error(error?.response?.data?.message || 'Không tải được danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    }, [filterOrderStatus, filterPaymentMethod, filterPaymentStatus]);

    useEffect(() => {
        fetchOrders(currentPage);
    }, [currentPage, fetchOrders]);

    const onFilterChange = (setter) => (e) => {
        setter(e.target.value);
        setCurrentPage(0);
    };


    const filteredOrders = orders.filter((order) => {
        const value = searchText.trim().toLowerCase();
        if (!value) return true;
        return (
            order.id?.toLowerCase().includes(value) ||
            order.buyerId?.toLowerCase().includes(value) ||
            order.sellerId?.toLowerCase().includes(value) ||
            order.buyerUsername?.toLowerCase().includes(value) ||
            order.sellerUsername?.toLowerCase().includes(value) ||
            order.status?.name?.toLowerCase().includes(value) ||
            order.status?.displayName?.toLowerCase().includes(value) ||
            order.paymentMethod?.name?.toLowerCase().includes(value) ||
            order.paymentStatus?.name?.toLowerCase().includes(value)
        );
    });

    const renderPaginationItems = () => {
        const items = [];
        const windowSize = 9;
        let start = Math.max(0, currentPage - Math.floor(windowSize / 2));
        let end = Math.min(totalPages, start + windowSize);
        start = Math.max(0, end - windowSize);
        for (let i = start; i < end; i += 1) {
            items.push(
                <CPaginationItem
                    key={i}
                    active={i === currentPage}
                    onClick={() => setCurrentPage(i)}
                    style={{ cursor: 'pointer' }}
                >
                    {i + 1}
                </CPaginationItem>
            );
        }
        return items;
    };

    return (
        <div className={cx('order-page')}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0">Quản lý đơn hàng</h3>
                <CFormInput
                    className={cx('search-input')}
                    placeholder="Tìm nhanh trên trang (ID, người mua/bán, trạng thái)…"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ maxWidth: '380px' }}
                />
            </div>

            <div className="row g-3 mb-3">
                <div className="col-md-4">
                    <CFormSelect value={filterOrderStatus} onChange={onFilterChange(setFilterOrderStatus)}>
                        {ORDER_STATUSES.map((o) => (
                            <option key={o.value || 'all'} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </CFormSelect>
                </div>
                <div className="col-md-4">
                    <CFormSelect value={filterPaymentMethod} onChange={onFilterChange(setFilterPaymentMethod)}>
                        {PAYMENT_METHODS.map((o) => (
                            <option key={o.value || 'all'} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </CFormSelect>
                </div>
                <div className="col-md-4">
                    <CFormSelect value={filterPaymentStatus} onChange={onFilterChange(setFilterPaymentStatus)}>
                        {PAYMENT_STATUSES.map((o) => (
                            <option key={o.value || 'all'} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </CFormSelect>
                </div>
            </div>

            <CCard className="shadow-sm border-0">
                <CCardHeader className="bg-white py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <span>Danh sách đơn hàng</span>
                        <span className="text-secondary">
                            Trang {currentPage + 1}/{totalPages}
                        </span>
                    </div>
                </CCardHeader>
                <CCardBody>
                    {loading ? (
                        <div className={cx('loader')}>
                            <CSpinner />
                            <span>Đang tải đơn hàng...</span>
                        </div>
                    ) : (
                        <>
                            <CTable hover responsive align="middle" className="mb-0 border">
                                <CTableHead color="light">
                                    <CTableRow>
                                        <CTableHeaderCell>ID</CTableHeaderCell>
                                        <CTableHeaderCell>Người mua</CTableHeaderCell>
                                        <CTableHeaderCell>Người bán</CTableHeaderCell>
                                        <CTableHeaderCell>TT đơn</CTableHeaderCell>
                                        <CTableHeaderCell>Phương thức</CTableHeaderCell>
                                        <CTableHeaderCell className={cx('amountHeader')}>
                                            Tổng tiền
                                        </CTableHeaderCell>
                                        <CTableHeaderCell>Ngày tạo</CTableHeaderCell>
                                        <CTableHeaderCell className="text-center">Thao tác</CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {filteredOrders.length > 0 ? (
                                        filteredOrders.map((order) => (
                                            <CTableRow key={order.id}>
                                                <CTableDataCell className={cx('order-id')}>{order.id}</CTableDataCell>
                                                <CTableDataCell>
                                                    <OrderUserCell
                                                        username={order.buyerUsername}
                                                        avatar={order.buyerAvatar}
                                                        userId={order.buyerId}
                                                    />
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <OrderUserCell
                                                        username={order.sellerUsername}
                                                        avatar={order.sellerAvatar}
                                                        userId={order.sellerId}
                                                    />
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <span
                                                        className={cx(
                                                            'statusBadge',
                                                            getStatusClass(order.status?.name)
                                                        )}
                                                    >
                                                        {order.status?.displayName || order.status?.name || '---'}
                                                    </span>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    {order.paymentMethod?.description ||
                                                        order.paymentMethod?.name ||
                                                        '---'}
                                                </CTableDataCell>
                                                <CTableDataCell className={cx('amountCell')}>
                                                    {formatCurrency(order.totalAmount)}
                                                </CTableDataCell>
                                                <CTableDataCell>{formatDateTime(order.createdAt)}</CTableDataCell>
                                                <CTableDataCell className="text-center">
                                                    <div className="d-flex flex-wrap gap-1 justify-content-center">
                                                        <CButton
                                                            color="info"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                                                        >
                                                            Chi tiết
                                                        </CButton>
                                                        
                                                    </div>
                                                </CTableDataCell>
                                            </CTableRow>
                                        ))
                                    ) : (
                                        <CTableRow>
                                            <CTableDataCell colSpan={9} className="text-center text-muted py-4">
                                                Không có đơn hàng.
                                            </CTableDataCell>
                                        </CTableRow>
                                    )}
                                </CTableBody>
                            </CTable>

                            {totalPages > 1 && (
                                <div className="d-flex justify-content-end mt-4">
                                    <CPagination>
                                        <CPaginationItem
                                            disabled={currentPage === 0}
                                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                                            style={{ cursor: currentPage === 0 ? 'default' : 'pointer' }}
                                        >
                                            Trước
                                        </CPaginationItem>
                                        {renderPaginationItems()}
                                        <CPaginationItem
                                            disabled={currentPage >= totalPages - 1}
                                            onClick={() =>
                                                setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
                                            }
                                            style={{
                                                cursor: currentPage >= totalPages - 1 ? 'default' : 'pointer',
                                            }}
                                        >
                                            Sau
                                        </CPaginationItem>
                                    </CPagination>
                                </div>
                            )}
                        </>
                    )}
                </CCardBody>
            </CCard>
           
        </div>
    );
};

export default OrderAdminPage;
