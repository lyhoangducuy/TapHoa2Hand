import React, { useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import OrderCard from './OrderCard';
import styles from '../MyOrderPage.module.scss';

const cx = classNames.bind(styles);

/** Số đơn hiển thị ban đầu trong mỗi tin; còn lại gấp bằng "Xem thêm". */
const PREVIEW_ORDER_COUNT = 2;

const SORT_CREATED = 'created';
const SORT_PRICE_ASC = 'price_asc';
const SORT_PRICE_DESC = 'price_desc';

const SORT_LABELS = {
    [SORT_CREATED]: 'thời gian tạo (cũ → mới)',
    [SORT_PRICE_ASC]: 'giá thấp → cao',
    [SORT_PRICE_DESC]: 'giá cao → thấp',
};

/** Lọc SĐT: không cần nhập đúng tuyệt đối — khớp một phần, bỏ qua ký tự không phải số khi so khớp chữ số. */
function orderMatchesPhoneQuery(order, rawQuery) {
    const q = rawQuery.trim();
    if (!q) return true;
    const raw = String(order.receiverPhone ?? '');
    const lower = raw.toLowerCase();
    const qLower = q.toLowerCase();
    if (lower.includes(qLower)) return true;
    const qDigits = q.replace(/\D/g, '');
    if (!qDigits) return false;
    const phoneDigits = raw.replace(/\D/g, '');
    return phoneDigits.includes(qDigits);
}

function sortOrdersInGroup(orders, sortMode) {
    const arr = [...orders];
    const total = (o) => Number(o.totalAmount ?? 0);
    const created = (o) => (o.createdAt ? new Date(o.createdAt).getTime() : 0);

    if (sortMode === SORT_PRICE_ASC) {
        arr.sort((a, b) => total(a) - total(b) || created(a) - created(b));
    } else if (sortMode === SORT_PRICE_DESC) {
        arr.sort((a, b) => total(b) - total(a) || created(a) - created(b));
    } else {
        arr.sort((a, b) => created(a) - created(b));
    }
    return arr;
}

const PostOrderGroup = ({ 
    group,
    activeTab,
    onFeedback,
    onPayment,
    onReject,
    onApprove,
    onPaymentConfirmed,
    onShipping,
    onDelivered,
    actionLoading,
    onConfirmDelivery,
    onReportSuccess
}) => {
    const [sortMode, setSortMode] = useState(SORT_CREATED);
    const [phoneQuery, setPhoneQuery] = useState('');
    const [ordersExpanded, setOrdersExpanded] = useState(false);

    const phoneTrim = phoneQuery.trim();

    const visibleOrders = useMemo(() => {
        const filtered = group.orders.filter((o) => orderMatchesPhoneQuery(o, phoneQuery));
        return sortOrdersInGroup(filtered, sortMode);
    }, [group.orders, phoneQuery, sortMode]);

    const hasMoreOrders = visibleOrders.length > PREVIEW_ORDER_COUNT;
    const displayedOrders =
        ordersExpanded || !hasMoreOrders
            ? visibleOrders
            : visibleOrders.slice(0, PREVIEW_ORDER_COUNT);
    const hiddenCount = visibleOrders.length - PREVIEW_ORDER_COUNT;

    return (
        <div className={cx('post-order-group')}>
            <div className={cx('post-group-header')}>
                {group.postImageUrl ? (
                    <img
                        className={cx('post-thumb')}
                        src={group.postImageUrl}
                        alt={group.postTitle}
                    />
                ) : (
                    <div className={cx('post-thumb', 'placeholder')}>📦</div>
                )}
                <div className={cx('post-group-meta')}>
                    <h3 className={cx('post-group-title')}>
                        {group.postTitle || 'Tin đăng'}
                    </h3>
                    <p className={cx('post-group-sub')}>
                        {phoneTrim
                            ? `${visibleOrders.length}/${group.orders.length} đơn hiển thị — đang xếp: ${SORT_LABELS[sortMode]}`
                            : `${group.orders.length} đơn — đang xếp: ${SORT_LABELS[sortMode]}`}
                    </p>
                    <div className={cx('post-group-phone-row')}>
                        <label className={cx('post-group-phone-label')} htmlFor={`post-phone-${group.groupKey}`}>
                            Lọc theo SĐT
                        </label>
                        <input
                            id={`post-phone-${group.groupKey}`}
                            type="search"
                            enterKeyHint="search"
                            className={cx('post-group-phone-input')}
                            placeholder="Chỉ nhập số (một phần SĐT)"
                            value={phoneQuery}
                            onChange={(e) => setPhoneQuery(e.target.value.replace(/\D/g, ''))}
                            inputMode="numeric"
                            autoComplete="off"
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') setPhoneQuery('');
                            }}
                        />
                        {phoneTrim ? (
                            <button
                                type="button"
                                className={cx('post-group-phone-clear')}
                                onClick={() => setPhoneQuery('')}
                            >
                                Xóa lọc
                            </button>
                        ) : null}
                    </div>
                    <div className={cx('post-group-sort')} role="group" aria-label="Sắp xếp đơn trong tin">
                        <span className={cx('post-group-sort-label')}>Sắp xếp:</span>
                        <button
                            type="button"
                            className={cx('post-group-sort-btn', { active: sortMode === SORT_CREATED })}
                            onClick={() => setSortMode(SORT_CREATED)}
                        >
                            Thời gian tạo
                        </button>
                        <button
                            type="button"
                            className={cx('post-group-sort-btn', { active: sortMode === SORT_PRICE_ASC })}
                            onClick={() => setSortMode(SORT_PRICE_ASC)}
                        >
                            Giá thấp → cao
                        </button>
                        <button
                            type="button"
                            className={cx('post-group-sort-btn', { active: sortMode === SORT_PRICE_DESC })}
                            onClick={() => setSortMode(SORT_PRICE_DESC)}
                        >
                            Giá cao → thấp
                        </button>
                    </div>
                </div>
            </div>
            <div className={cx('post-group-orders')}>
                {visibleOrders.length === 0 && phoneTrim ? (
                    <p className={cx('post-group-empty-filter')}>
                        Không có đơn nào khớp. Thử bớt ký tự hoặc chỉ gõ vài số giữa số điện thoại.
                    </p>
                ) : null}
                {displayedOrders.map((order) => (
                    <OrderCard
                        key={order.id}
                        order={order}
                        activeTab={activeTab}
                        onFeedback={onFeedback}
                        onPayment={onPayment}
                        onReject={onReject}
                        onApprove={onApprove}
                        onPaymentConfirmed={onPaymentConfirmed}
                        onShipping={onShipping}
                        onDelivered={onDelivered}
                        actionLoading={actionLoading}
                        onConfirmDelivery={onConfirmDelivery}
                        onReportSuccess={onReportSuccess}
                    />
                ))}
                {hasMoreOrders && !ordersExpanded ? (
                    <div className={cx('post-group-more-wrap')}>
                        <button
                            type="button"
                            className={cx('post-group-expand-btn')}
                            onClick={() => setOrdersExpanded(true)}
                        >
                            Xem thêm {hiddenCount} đơn
                        </button>
                    </div>
                ) : null}
                {hasMoreOrders && ordersExpanded ? (
                    <div className={cx('post-group-more-wrap')}>
                        <button
                            type="button"
                            className={cx('post-group-collapse-btn')}
                            onClick={() => setOrdersExpanded(false)}
                        >
                            Thu gọn
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default PostOrderGroup;
