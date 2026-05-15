import React from 'react';
import classNames from 'classnames/bind';
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader } from '@coreui/react';
import styles from './OrderAdminPage.module.scss';

const cx = classNames.bind(styles);

const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount || 0);

/** Đơn trung gian đã quá mốc giữ tiền, vẫn ở DELIVERED (chưa kịp job / chưa PATCH SETTLING). */
export function isMiddlemanDeliveredHoldPassed(order) {
    if (!order || order.paymentMethod?.name !== 'MIDDLEMAN') return false;
    if (order.status?.name !== 'DELIVERED') return false;
    if (!order.holdUntil) return false;
    const end = new Date(order.holdUntil);
    if (Number.isNaN(end.getTime())) return false;
    return end.getTime() <= Date.now();
}

export function isMiddlemanSettling(order) {
    return order?.paymentMethod?.name === 'MIDDLEMAN' && order?.status?.name === 'SETTLING';
}

export function canAdminOpenSettlementModal(order) {
    return isMiddlemanDeliveredHoldPassed(order) || isMiddlemanSettling(order);
}

export function settlementNetToSeller(order) {
    const total = Number(order?.totalAmount) || 0;
    const fee = Number(order?.platformFee) || 0;
    return Math.max(0, total - fee);
}

function buildDemoQrData(order) {
    const net = settlementNetToSeller(order);
    const bank = order?.sellerBankInfo;
    const parts = [
        'TAPH2HAND-DEMO-CK',
        `Don:${order?.id || ''}`,
        bank?.bankName ? `NH:${bank.bankName}` : '',
        bank?.accountNumber ? `STK:${bank.accountNumber}` : '',
        bank?.accountName ? `Ten:${bank.accountName}` : '',
        `SoTien:${net}`,
    ].filter(Boolean);
    return parts.join('|');
}

const AdminSettlementModal = ({
    visible,
    order,
    onClose,
    confirmLoading,
    onConfirmTransfer,
}) => {
    if (!order) return null;

    const net = settlementNetToSeller(order);
    const bank = order.sellerBankInfo;
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
        buildDemoQrData(order)
    )}`;

    return (
        <CModal alignment="center" visible={visible} onClose={onClose}>
            <CModalHeader>
                <h5 className="mb-0">Giải ngân trung gian (demo QR)</h5>
            </CModalHeader>
            <CModalBody>
                <p className="text-secondary small mb-3">
                    Chuyển khoản thủ công cho người bán theo thông tin bên dưới. Số tiền đã trừ phí sàn (demo — QR chỉ
                    minh họa).
                </p>
                <div className={cx('settlementGrid')}>
                    <div>
                        <p className={cx('settlementLabel')}>Số tiền chuyển cho người bán</p>
                        <p className={cx('settlementAmount')}>{formatCurrency(net)}</p>
                        <p className={cx('settlementHint')}>
                            Tổng đơn {formatCurrency(order.totalAmount)}
                            {order.platformFee > 0 ? ` · Phí sàn ${formatCurrency(order.platformFee)}` : ''}
                        </p>
                    </div>
                    <div className={cx('settlementQr')}>
                        <img src={qrSrc} alt="QR chuyển khoản demo" width={220} height={220} />
                    </div>
                </div>
                {bank ? (
                    <dl className={cx('settlementBank')}>
                        <div>
                            <dt>Ngân hàng</dt>
                            <dd>{bank.bankName || '—'}</dd>
                        </div>
                        <div>
                            <dt>Chủ TK</dt>
                            <dd>{bank.accountName || '—'}</dd>
                        </div>
                        <div>
                            <dt>Số TK</dt>
                            <dd>{bank.accountNumber || '—'}</dd>
                        </div>
                    </dl>
                ) : (
                    <p className="text-warning small mb-0">Chưa có thông tin STK người bán trên đơn.</p>
                )}
            </CModalBody>
            <CModalFooter className="d-flex flex-wrap gap-2 justify-content-between">
                <CButton color="secondary" variant="outline" onClick={onClose}>
                    Đóng
                </CButton>
                {order.status?.name === 'SETTLING' ? (
                    <CButton color="success" onClick={onConfirmTransfer} disabled={confirmLoading}>
                        {confirmLoading ? 'Đang xử lý…' : 'Xác nhận đã chuyển khoản'}
                    </CButton>
                ) : (
                    <span className="text-muted small align-self-center">
                        Chuyển sang bước giải ngân (SETTLING) để bật xác nhận.
                    </span>
                )}
            </CModalFooter>
        </CModal>
    );
};

export default AdminSettlementModal;
