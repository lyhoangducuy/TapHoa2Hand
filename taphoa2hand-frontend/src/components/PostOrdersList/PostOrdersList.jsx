import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import { getCountOfPost } from '../../services/postService';
import styles from './PostOrdersList.module.scss';

const cx = classNames.bind(styles);

const formatPrice = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const formatDate = (value) => {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return '—';
    }
};

const sortNewestFirst = (list) =>
    [...(list || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

/**
 * Danh sách đơn của một tin — ô nhỏ cuộn được, mới nhất trên cùng.
 */
const PostOrdersList = ({
    postId,
    orders: ordersProp,
    orderCount: orderCountProp,
    currentOrderId,
    orderDetailPath = (id) => `/order/myOrder/${id}`,
    className,
}) => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState(ordersProp ?? []);
    const [orderCount, setOrderCount] = useState(orderCountProp ?? 0);
    const [loading, setLoading] = useState(Boolean(postId && ordersProp == null));

    useEffect(() => {
        if (ordersProp != null) {
            setOrders(ordersProp);
            setOrderCount(orderCountProp ?? ordersProp.length);
            setLoading(false);
            return;
        }
        if (!postId) {
            setOrders([]);
            setOrderCount(0);
            setLoading(false);
            return;
        }

        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const res = await getCountOfPost(postId);
                const body = res?.code != null ? res : res?.data;
                if (!cancelled && body?.code === 1000 && body.result) {
                    setOrders(body.result.orders ?? []);
                    setOrderCount(body.result.orderCount ?? body.result.orders?.length ?? 0);
                }
            } catch (e) {
                if (!cancelled) {
                    setOrders([]);
                    setOrderCount(0);
                }
                console.error('PostOrdersList:', e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [postId, ordersProp, orderCountProp]);

    const sortedOrders = useMemo(() => sortNewestFirst(orders), [orders]);
    const total = orderCount ?? sortedOrders.length;

    return (
        <section className={cx('panel', className)} aria-label="Đơn hàng trên tin">
            <h3 className={cx('title')}>
                <span>Đơn hàng trên tin</span>
                <span className={cx('countBadge')}>{total}</span>
            </h3>

            <div className={cx('list')}>
                {loading ? (
                    <p className={cx('loading')}>Đang tải…</p>
                ) : sortedOrders.length === 0 ? (
                    <p className={cx('empty')}>Chưa có đơn hàng</p>
                ) : (
                    sortedOrders.map((item) => {
                        const isActive =
                            currentOrderId && item.orderId === currentOrderId;
                        const initial = (item.username || '?').charAt(0).toUpperCase();
                        return (
                            <button
                                key={item.orderId}
                                type="button"
                                className={cx('item', { active: isActive })}
                                onClick={() => item.orderId && navigate(orderDetailPath(item.orderId))}
                            >
                                {item.avatar ? (
                                    <img
                                        className={cx('avatar')}
                                        src={item.avatar}
                                        alt=""
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className={cx('avatar')}>{initial}</div>
                                )}
                                <div className={cx('body')}>
                                    <div className={cx('userRow')}>
                                        <span className={cx('username')}>
                                            @{item.username || '—'}
                                        </span>
                                        <span className={cx('price')}>{formatPrice(item.price)}</span>
                                    </div>
                                    <p className={cx('meta')}>{formatDate(item.createdAt)}</p>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>

            {!loading && sortedOrders.length > 3 ? (
                <p className={cx('hint')}>Cuộn lên để xem đơn cũ hơn</p>
            ) : null}
        </section>
    );
};

export default PostOrdersList;
