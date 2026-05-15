import React, { useMemo, useState, useEffect, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from '../ChatPage.module.scss';
import { getProvinces, getWardsByProvince } from '../../../services/locationService';

const cx = classNames.bind(styles);

const formatPrice = (price) => {
    if (!price && price !== 0) return 'Thỏa thuận';
    const num = Number(price);
    if (isNaN(num)) return price;
    return num.toLocaleString('vi-VN') + ' đ';
};

const formatEscrowHold = (unit, amount) => {
    if (amount == null || !unit) return null;
    return unit === 'HOURS' ? `${amount} giờ` : `${amount} ngày`;
};

/** Khớp backend OrderService: MIDDLEMAN_PLATFORM_FEE_RATE = 0.02, làm tròn HALF_UP đồng */
const MIDDLEMAN_FEE_RATE = 0.02;

function OrderModal({
    currentChat,
    orderForm,
    setOrderForm,
    handleOrderFormChange,
    submitOrderRequest,
    isSubmittingOrder,
    createdOrder,
    onCheckout,
    close,
}) {
    const isBuyPost = String(currentChat?.postType || '').toUpperCase() === 'BUY';

    const [provinces, setProvinces] = useState([]);
    const [provincesLoading, setProvincesLoading] = useState(true);
    const [provincesError, setProvincesError] = useState(null);

    const [wards, setWards] = useState([]);
    const [wardsLoading, setWardsLoading] = useState(false);
    const [wardsError, setWardsError] = useState(null);

    const loadProvinces = useCallback(async () => {
        setProvincesLoading(true);
        setProvincesError(null);
        try {
            const res = await getProvinces();
            if (res?.code === 1000 && Array.isArray(res.result)) {
                setProvinces(res.result);
            } else {
                setProvinces([]);
                setProvincesError(res?.message || 'Không lấy được danh sách tỉnh/thành');
            }
        } catch (err) {
            setProvinces([]);
            setProvincesError(err?.message || 'Lỗi kết nối khi tải tỉnh/thành');
        } finally {
            setProvincesLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProvinces();
    }, [loadProvinces]);

    useEffect(() => {
        const code = orderForm.shippingProvinceCode;
        if (!code) {
            setWards([]);
            setWardsError(null);
            setWardsLoading(false);
            return;
        }
        let cancelled = false;
        (async () => {
            setWardsLoading(true);
            setWardsError(null);
            try {
                const res = await getWardsByProvince(code);
                if (cancelled) return;
                if (res?.code === 1000 && Array.isArray(res.result)) {
                    setWards(res.result);
                    if (res.result.length === 0) {
                        setWardsError('Không có dữ liệu phường/xã cho tỉnh đã chọn.');
                    }
                } else {
                    setWards([]);
                    setWardsError(res?.message || 'Không lấy được danh sách phường/xã');
                }
            } catch (err) {
                if (!cancelled) {
                    setWards([]);
                    setWardsError(err?.message || 'Lỗi kết nối khi tải phường/xã');
                }
            } finally {
                if (!cancelled) setWardsLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [orderForm.shippingProvinceCode]);

    const middlemanPreview = useMemo(() => {
        if (orderForm.method !== 'MIDDLEMAN') return null;
        let base = null;
        if (isBuyPost) {
            const raw = orderForm.offeredPrice;
            if (raw === '' || raw == null) {
                base = null;
            } else {
                const n = typeof raw === 'number' ? raw : Number(String(raw).replace(/\D/g, ''));
                if (Number.isFinite(n) && n > 0) base = Math.floor(n);
            }
        } else {
            const p = Number(currentChat?.postPrice);
            if (Number.isFinite(p) && p >= 0) base = Math.floor(p);
        }
        if (base == null || base < 0) {
            return { ready: false, base: null, fee: null, total: null };
        }
        const fee = Math.round(base * MIDDLEMAN_FEE_RATE);
        return { ready: true, base, fee, total: base + fee };
    }, [orderForm.method, orderForm.offeredPrice, isBuyPost, currentChat?.postPrice]);

    // Nếu đã tạo order thành công, hiển thị thông tin order và nút checkout
    if (createdOrder) {
        return (
            <div className={cx('modal-overlay')}>
                <div className={cx('modal-content')}>
                    <h2>🎉 Đơn Hàng Đã Tạo</h2>
                    <div className={cx('product-summary')}>
                        <strong>Tin đăng:</strong> {currentChat?.postTitle} <br />
                        {createdOrder.paymentMethod?.name === 'MIDDLEMAN' ? (
                            <>
                                <strong>Tổng thanh toán:</strong>{' '}
                                <span>{formatPrice(createdOrder.totalAmount)}</span>
                            </>
                        ) : isBuyPost ? (
                            <>
                                <strong>Giá trên đơn:</strong>{' '}
                                <span>{formatPrice(createdOrder.totalAmount)}</span>
                            </>
                        ) : (
                            <>
                                <strong>Giá:</strong> <span>{formatPrice(currentChat?.postPrice)}</span>
                            </>
                        )}
                    </div>
                    
                    <div className={cx('order-info-section')}>
                        <h3>Thông tin đơn hàng</h3>
                        <div className={cx('info-row')}>
                            <span className={cx('label')}>Mã đơn hàng:</span>
                            <span className={cx('value')}>{createdOrder.id || 'Đang xử lý...'}</span>
                        </div>
                        <div className={cx('info-row')}>
                            <span className={cx('label')}>Người nhận:</span>
                            <span className={cx('value')}>{createdOrder.receiverName}</span>
                        </div>
                        <div className={cx('info-row')}>
                            <span className={cx('label')}>Số điện thoại:</span>
                            <span className={cx('value')}>{createdOrder.receiverPhone}</span>
                        </div>
                        <div className={cx('info-row')}>
                            <span className={cx('label')}>Địa chỉ:</span>
                            <span className={cx('value')}>{createdOrder.shippingAddress}</span>
                        </div>
                        <div className={cx('info-row')}>
                            <span className={cx('label')}>Phương thức:</span>
                            <span className={cx('value')}>
                                {createdOrder.method === 'MIDDLEMAN' ? 'Giao dịch qua Trung gian' : 'Giao dịch Trực tiếp'}
                            </span>
                        </div>
                        {createdOrder.paymentMethod?.name === 'MIDDLEMAN' &&
                            formatEscrowHold(createdOrder.holdDurationUnit, createdOrder.holdDurationAmount) && (
                            <div className={cx('info-row')}>
                                <span className={cx('label')}>Giữ tiền ký quỹ:</span>
                                <span className={cx('value')}>
                                    {formatEscrowHold(createdOrder.holdDurationUnit, createdOrder.holdDurationAmount)} sau khi giao thành công (tối đa 10 ngày)
                                </span>
                            </div>
                        )}
                        {createdOrder.paymentMethod?.name === 'MIDDLEMAN' &&
                            createdOrder.platformFee != null &&
                            createdOrder.totalAmount != null && (
                            <>
                                <div className={cx('info-row')}>
                                    <span className={cx('label')}>Giá hàng:</span>
                                    <span className={cx('value')}>
                                        {formatPrice(
                                            Number(createdOrder.totalAmount) - Number(createdOrder.platformFee)
                                        )}
                                    </span>
                                </div>
                                <div className={cx('info-row')}>
                                    <span className={cx('label')}>Phí trung gian (2%):</span>
                                    <span className={cx('value')}>{formatPrice(createdOrder.platformFee)}</span>
                                </div>
                                <div className={cx('info-row')}>
                                    <span className={cx('label')}>Tổng thanh toán:</span>
                                    <span className={cx('value')}>{formatPrice(createdOrder.totalAmount)}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className={cx('modal-actions')}>
                        <button 
                            type="button" 
                            onClick={close} 
                            className={cx('btn-cancel')}
                        >
                            Đóng
                        </button>
                        <button 
                            type="button" 
                            onClick={onCheckout} 
                            className={cx('btn-submit')}
                        >
                            💳 Thanh toán ngay
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Form tạo order
    return (
        <div className={cx('modal-overlay')}>
            <div className={cx('modal-content')}>
                <h2>Yêu Cầu Giao Dịch</h2>
                <div className={cx('product-summary')}>
                    <strong>Tin đăng:</strong> {currentChat?.postTitle} <br />
                    {isBuyPost ? (
                        <>
                            <strong>Gợi ý trên tin (tham khảo):</strong>{' '}
                            <span>{formatPrice(currentChat?.postPrice)}</span>
                        </>
                    ) : (
                        <>
                            <strong>Giá:</strong> <span>{formatPrice(currentChat?.postPrice)}</span>
                        </>
                    )}
                </div>
                <form onSubmit={submitOrderRequest}>
                    {isBuyPost && (
                        <div className={cx('form-section')}>
                            <strong>Giá bạn đề xuất (VNĐ)</strong>
                            <p className={cx('form-hint')}>
                                Tin <strong>cần mua</strong>: nhập mức giá bạn muốn bán / thỏa thuận. Giá này ghi vào đơn hàng.
                            </p>
                            <input
                                required
                                type="text"
                                inputMode="numeric"
                                name="offeredPrice"
                                value={orderForm.offeredPrice}
                                onChange={handleOrderFormChange}
                                placeholder="Ví dụ: 1500000"
                            />
                        </div>
                    )}
                    <div className={cx('form-section')}>
                        <strong>1. Thông tin nhận hàng</strong>
                        <input 
                            required 
                            type="text" 
                            name="receiverName" 
                            value={orderForm.receiverName} 
                            onChange={handleOrderFormChange} 
                            placeholder="Họ tên người nhận (không nhập số)" 
                        />
                        <input 
                            required 
                            type="text" 
                            inputMode="numeric"
                            pattern="[0-9]*"
                            name="receiverPhone" 
                            value={orderForm.receiverPhone} 
                            onChange={handleOrderFormChange} 
                            placeholder="Số điện thoại (chỉ số, 8–15 số)" 
                        />
                        <label className={cx('form-hint')} style={{ display: 'block', marginTop: 8 }}>
                            Tỉnh / Thành phố
                        </label>
                        {provincesError && (
                            <p className={cx('form-hint')} style={{ color: '#c0392b', marginBottom: 6 }}>
                                {provincesError}{' '}
                                <button
                                    type="button"
                                    className={cx('btn-cancel')}
                                    style={{ marginLeft: 8, padding: '4px 10px', fontSize: 13 }}
                                    onClick={loadProvinces}
                                >
                                    Thử lại
                                </button>
                            </p>
                        )}
                        <select
                            required
                            name="shippingProvinceCode"
                            value={orderForm.shippingProvinceCode || ''}
                            disabled={provincesLoading || provinces.length === 0}
                            onChange={(e) => {
                                const code = e.target.value;
                                const item = provinces.find((p) => String(p.code) === code);
                                setOrderForm((prev) => ({
                                    ...prev,
                                    shippingProvinceCode: code,
                                    shippingProvinceName: item?.name ?? '',
                                    shippingWardCode: '',
                                    shippingWardName: '',
                                }));
                            }}
                        >
                            <option value="">
                                {provincesLoading ? 'Đang tải danh sách…' : 'Chọn Tỉnh / Thành phố'}
                            </option>
                            {provinces.map((p) => (
                                <option key={p.code} value={String(p.code)}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        <label className={cx('form-hint')} style={{ display: 'block', marginTop: 8 }}>
                            Phường / Xã
                        </label>
                        {wardsError && orderForm.shippingProvinceCode && (
                            <p className={cx('form-hint')} style={{ color: '#c0392b', marginBottom: 6 }}>
                                {wardsError}
                            </p>
                        )}
                        <select
                            required
                            name="shippingWardCode"
                            value={orderForm.shippingWardCode || ''}
                            disabled={
                                !orderForm.shippingProvinceCode ||
                                provincesLoading ||
                                wardsLoading ||
                                wards.length === 0
                            }
                            onChange={(e) => {
                                const wcode = e.target.value;
                                const item = wards.find((w) => String(w.code) === wcode);
                                setOrderForm((prev) => ({
                                    ...prev,
                                    shippingWardCode: wcode,
                                    shippingWardName: item?.name ?? '',
                                }));
                            }}
                        >
                            <option value="">
                                {!orderForm.shippingProvinceCode
                                    ? 'Chọn tỉnh/thành trước'
                                    : wardsLoading
                                      ? 'Đang tải phường/xã…'
                                      : wards.length === 0
                                        ? 'Không có phường/xã'
                                        : 'Chọn Phường / Xã'}
                            </option>
                            {wards.map((w) => (
                                <option key={`${w.code}-${w.name}`} value={String(w.code)}>
                                    {w.name}
                                </option>
                            ))}
                        </select>
                        <label className={cx('form-hint')} style={{ display: 'block', marginTop: 8 }}>
                            Địa chỉ chi tiết (số nhà, tên đường…)
                        </label>
                        <textarea 
                            required 
                            name="shippingAddress" 
                            value={orderForm.shippingAddress} 
                            onChange={handleOrderFormChange} 
                            placeholder="Ví dụ: 12 Nguyễn Huệ (đã chọn phường/xã ở trên)" 
                        />
                    </div>
                    <div className={cx('form-section')}>
                        <strong>2. Phương thức giao dịch</strong>
                        <select name="method" value={orderForm.method} onChange={handleOrderFormChange}>
                            <option value="MIDDLEMAN">Giao dịch qua Trung gian (An toàn)</option>
                            <option value="DIRECT">Giao dịch Trực tiếp (Tự thỏa thuận)</option>
                        </select>
                    </div>
                    {orderForm.method === 'MIDDLEMAN' && (
                        <div className={cx('form-section', 'fee-preview')}>
                            <strong>3. Phí trung gian & tạm tính</strong>
                            <p className={cx('form-hint')}>
                                Phí nền tảng <strong>2%</strong> trên giá hàng (làm tròn đến đồng). Tin cần mua: tính theo{' '}
                                <strong>giá bạn nhập</strong> ở trên.
                            </p>
                            {!middlemanPreview?.ready ? (
                                <p className={cx('fee-preview-muted')}>
                                    {isBuyPost
                                        ? 'Nhập giá đề xuất để xem phí và tổng dự kiến.'
                                        : 'Chưa có giá tin hợp lệ để tạm tính.'}
                                </p>
                            ) : (
                                <div className={cx('fee-preview-rows')}>
                                    <div className={cx('fee-preview-row')}>
                                        <span>Giá hàng (tạm)</span>
                                        <span>{formatPrice(middlemanPreview.base)}</span>
                                    </div>
                                    <div className={cx('fee-preview-row')}>
                                        <span>Phí trung gian (2%)</span>
                                        <span>{formatPrice(middlemanPreview.fee)}</span>
                                    </div>
                                    <div className={cx('fee-preview-row', 'fee-preview-total')}>
                                        <span>Tổng dự kiến thanh toán</span>
                                        <span>{formatPrice(middlemanPreview.total)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {orderForm.method === 'MIDDLEMAN' && (
                        <div className={cx('form-section')}>
                            <strong>4. Thời gian giữ tiền (ký quỹ hai bên)</strong>
                            <p className={cx('form-hint')}>
                                Sau khi giao hàng thành công, tiền được giữ tối đa tương đương <strong>10 ngày</strong> (240 giờ). Chọn theo ngày hoặc theo giờ.
                            </p>
                            <div className={cx('hold-row')}>
                                <label className={cx('hold-label')}>
                                    <span>Đơn vị</span>
                                    <select
                                        name="holdDurationUnit"
                                        value={orderForm.holdDurationUnit}
                                        onChange={handleOrderFormChange}
                                    >
                                        <option value="DAYS">Theo ngày</option>
                                        <option value="HOURS">Theo giờ</option>
                                    </select>
                                </label>
                                <label className={cx('hold-label')}>
                                    <span>{orderForm.holdDurationUnit === 'HOURS' ? 'Số giờ (1–240)' : 'Số ngày (1–10)'}</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        name="holdDurationAmount"
                                        value={orderForm.holdDurationAmount}
                                        onChange={handleOrderFormChange}
                                        required
                                    />
                                </label>
                            </div>
                        </div>
                    )}
                    {orderForm.method === 'MIDDLEMAN' && (
                        <div className={cx('form-section')}>
                            <strong>5. Thông tin tài khoản ngân hàng</strong>
                            <input
                                required
                                type="text"
                                name="buyerBank.bankName"
                                value={orderForm.buyerBank.bankName}
                                onChange={handleOrderFormChange}
                                placeholder="Tên ngân hàng (không nhập số)"
                                autoComplete="organization"
                            />
                            <input
                                required
                                type="text"
                                name="buyerBank.accountName"
                                value={orderForm.buyerBank.accountName}
                                onChange={handleOrderFormChange}
                                placeholder="Họ tên chủ tài khoản (không nhập số)"
                                autoComplete="name"
                            />
                            <input
                                required
                                type="text"
                                name="buyerBank.accountNumber"
                                value={orderForm.buyerBank.accountNumber}
                                onChange={handleOrderFormChange}
                                placeholder="Số tài khoản (chỉ số)"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                autoComplete="off"
                            />
                        </div>
                    )}
                    <div className={cx('modal-actions')}>
                        <button 
                            type="button" 
                            onClick={close} 
                            className={cx('btn-cancel')}
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmittingOrder} 
                            className={cx('btn-submit')}
                        >
                            {isSubmittingOrder ? 'Đang gửi...' : 'Xác nhận tạo đơn'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default OrderModal;