import React, { useState } from 'react';
import {
    CTable, CTableHead, CTableRow, CTableHeaderCell,
    CTableBody, CTableDataCell, CButton, CAvatar, CBadge, CModal,
    CModalHeader, CModalTitle, CModalBody, CModalFooter, CSpinner,
    CFormTextarea,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash, cilBan, cilLockUnlocked } from '@coreui/icons';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../../../components/Popup/ConfirmModal';
import { deleteUser } from '../../../../services/userService';
import { toast } from 'react-toastify';

const LOCK_STATUS_CONFIG = {
    ACTIVE:              { color: 'success', label: 'Hoạt động', icon: cilLockUnlocked },
    LOCKED_24H:          { color: 'warning', label: 'Khóa 24h',  icon: cilBan },
    PERMANENTLY_LOCKED:  { color: 'danger',  label: 'Khóa vĩnh viễn', icon: cilBan },
};

const computeLockStatus = (user) => {
    const blockedUntil = user.blockedUntil;
    if (!blockedUntil) return 'ACTIVE';
    const blockedTime = new Date(blockedUntil);
    if (blockedTime > new Date()) {
        const diffHours = (blockedTime - new Date()) / (1000 * 60 * 60);
        return diffHours <= 25 ? 'LOCKED_24H' : 'PERMANENTLY_LOCKED';
    }
    return 'ACTIVE';
};

const UserTable = ({ users, onRefresh, onBlock24h, onBlockPermanent, onUnblock }) => {
    const navigate = useNavigate();

    // Delete modal
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Block (24h / permanent) modal
    const [blockModalVisible, setBlockModalVisible] = useState(false);
    const [blockTarget, setBlockTarget] = useState(null);   // { user, type: '24H'|'PERMANENT' }
    const [blockReason, setBlockReason] = useState('');
    const [blockLoading, setBlockLoading] = useState(false);

    // Unblock modal
    const [unblockModalVisible, setUnblockModalVisible] = useState(false);
    const [unblockTarget, setUnblockTarget] = useState(null);
    const [unblockLoading, setUnblockLoading] = useState(false);

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;
        try {
            setDeleteLoading(true);
            await deleteUser(userToDelete.id);
            setDeleteModalVisible(false);
            toast.success('Xóa tài khoản thành công!');
            onRefresh?.();
        } catch (error) {
            console.error('Lỗi xóa:', error);
            toast.error(error?.response?.data?.message || 'Xóa thất bại!');
        } finally {
            setDeleteLoading(false);
            setUserToDelete(null);
        }
    };

    // ── Block ────────────────────────────────────────────────────────────────
    const openBlockModal = (user, type) => {
        setBlockTarget({ user, type });
        setBlockReason('');
        setBlockModalVisible(true);
    };

    const handleConfirmBlock = async () => {
        if (!blockTarget) return;
        try {
            setBlockLoading(true);
            const reason = blockReason.trim() || 'Vi phạm điều khoản sử dụng';
            const durationHours = blockTarget.type === '24H' ? 24 : null;
            await onBlock24h(blockTarget.user.id, reason, durationHours);
            setBlockModalVisible(false);
            setBlockTarget(null);
            onRefresh?.();
        } catch (error) {
            console.error('Lỗi khóa:', error);
            toast.error(error?.response?.data?.message || 'Khóa tài khoản thất bại!');
        } finally {
            setBlockLoading(false);
        }
    };

    // ── Unblock ──────────────────────────────────────────────────────────────
    const openUnblockModal = (user) => {
        setUnblockTarget(user);
        setUnblockModalVisible(true);
    };

    const handleConfirmUnblock = async () => {
        if (!unblockTarget) return;
        try {
            setUnblockLoading(true);
            await onUnblock(unblockTarget.id);
            setUnblockModalVisible(false);
            toast.success('Mở khóa tài khoản thành công!');
            setUnblockTarget(null);
            onRefresh?.();
        } catch (error) {
            console.error('Lỗi mở khóa:', error);
            toast.error(error?.response?.data?.message || 'Mở khóa thất bại!');
        } finally {
            setUnblockLoading(false);
        }
    };

    if (!users || users.length === 0) {
        return (
            <div className="text-center py-4 text-muted">
                Không có người dùng nào
            </div>
        );
    }

    return (
        <>
            <CTable hover responsive align="middle" className="mb-0 border">
                <CTableHead color="light">
                    <CTableRow>
                        <CTableHeaderCell style={{ width: '130px' }} className="text-center">ID</CTableHeaderCell>
                        <CTableHeaderCell>Tên tài khoản</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Vai trò</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Trạng thái</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Hành động</CTableHeaderCell>
                    </CTableRow>
                </CTableHead>
                <CTableBody>
                    {users.map((user) => {
                        const lockStatus = computeLockStatus(user);
                        const lockCfg = LOCK_STATUS_CONFIG[lockStatus] || LOCK_STATUS_CONFIG.ACTIVE;
                        const LockIcon = lockCfg.icon;
                        const isLocked = lockStatus !== 'ACTIVE';

                        return (
                            <CTableRow key={user.id}>
                                <CTableDataCell className="text-center text-muted">
                                    <span title={user.id}>#{user.id ? user.id.substring(0, 8) : 'N/A'}</span>
                                </CTableDataCell>

                                <CTableDataCell>
                                    <div className="d-flex align-items-center gap-3">
                                        <CAvatar color="primary" textColor="white">
                                            {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                        </CAvatar>
                                        <div className="fw-semibold text-dark">{user.username}</div>
                                    </div>
                                </CTableDataCell>

                                <CTableDataCell className="text-center">
                                    <span className="fw-medium text-secondary">
                                        {user.roles && user.roles.length > 0
                                            ? user.roles.map(role => role.description).join(', ')
                                            : 'N/A'}
                                    </span>
                                </CTableDataCell>

                                {/* Status column */}
                                <CTableDataCell className="text-center">
                                    <CBadge color={lockCfg.color} shape="rounded-pill">
                                        <CIcon icon={LockIcon} className="me-1" />
                                        {lockCfg.label}
                                    </CBadge>
                                </CTableDataCell>

                                {/* Action buttons */}
                                <CTableDataCell className="text-center">
                                    <div className="d-flex justify-content-center gap-1 flex-wrap">

                                        {/* Block actions — only show when user is ACTIVE */}
                                        {!isLocked && (
                                            <>
                                                <CButton
                                                    color="warning"
                                                    variant="ghost"
                                                    size="sm"
                                                    title="Khóa 24 giờ"
                                                    onClick={() => openBlockModal(user, '24H')}
                                                >
                                                    <CIcon icon={cilBan} />
                                                    <span className="ms-1" style={{ fontSize: '0.7rem' }}>24h</span>
                                                </CButton>
                                                <CButton
                                                    color="danger"
                                                    variant="ghost"
                                                    size="sm"
                                                    title="Khóa vĩnh viễn"
                                                    onClick={() => openBlockModal(user, 'PERMANENT')}
                                                >
                                                    <CIcon icon={cilBan} />
                                                </CButton>
                                            </>
                                        )}

                                        {/* Unblock — only show when user is locked */}
                                        {isLocked && (
                                            <CButton
                                                color="success"
                                                variant="outline"
                                                size="sm"
                                                title="Mở khóa tài khoản"
                                                onClick={() => openUnblockModal(user)}
                                            >
                                                <CIcon icon={cilLockUnlocked} className="me-1" />
                                                Mở khóa
                                            </CButton>
                                        )}

                                        {/* Common actions */}
                                        <CButton
                                            color="info"
                                            variant="ghost"
                                            size="sm"
                                            title="Chỉnh sửa"
                                            onClick={() => navigate(`/admin/users/detail/${user.id}`)}
                                        >
                                            <CIcon icon={cilPencil} />
                                        </CButton>
                                        <CButton
                                            color="danger"
                                            variant="ghost"
                                            size="sm"
                                            title="Xóa"
                                            onClick={() => handleDeleteClick(user)}
                                        >
                                            <CIcon icon={cilTrash} />
                                        </CButton>
                                    </div>
                                </CTableDataCell>
                            </CTableRow>
                        );
                    })}
                </CTableBody>
            </CTable>

            {/* ── Delete confirm modal (reuse existing ConfirmModal) ─────────── */}
            <ConfirmModal
                visible={deleteModalVisible}
                onClose={() => { setDeleteModalVisible(false); setUserToDelete(null); }}
                onConfirm={handleConfirmDelete}
                title="Xác nhận xóa tài khoản"
                content={
                    <span>
                        Bạn có chắc chắn muốn xóa tài khoản{' '}
                        <strong className="text-danger">{userToDelete?.username}</strong> không?
                        <br />
                        <small className="text-muted">Hành động này không thể hoàn tác.</small>
                    </span>
                }
            />

            {/* ── Block confirm modal ──────────────────────────────────────── */}
            {blockModalVisible && blockTarget && (
                <CModal
                    visible={blockModalVisible}
                    onClose={() => { setBlockModalVisible(false); setBlockTarget(null); setBlockReason(''); }}
                    centered backdrop="static"
                >
                    <CModalHeader>
                        <CModalTitle>
                            <CIcon icon={cilBan} className="me-2 text-danger" />
                            Xác nhận khóa tài khoản
                        </CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        <p>
                            Bạn có chắc muốn khóa tài khoản{' '}
                            <strong>{blockTarget.user.username}</strong>{' '}
                            {blockTarget.type === '24H' ? 'trong 24 giờ' : 'vĩnh viễn'}?
                        </p>
                        <p className="text-muted small mb-2">
                            {blockTarget.type === '24H'
                                ? 'Sau 24 giờ, tài khoản sẽ tự động được mở khóa.'
                                : 'Người dùng sẽ bị đăng xuất ngay lập tức và không thể đăng nhập lại.'}
                        </p>
                        <CFormTextarea
                            rows={2}
                            placeholder="Nhập lý do khóa (không bắt buộc)..."
                            value={blockReason}
                            onChange={(e) => setBlockReason(e.target.value)}
                        />
                    </CModalBody>
                    <CModalFooter>
                        <CButton
                            color="secondary"
                            variant="ghost"
                            onClick={() => { setBlockModalVisible(false); setBlockTarget(null); setBlockReason(''); }}
                            disabled={blockLoading}
                        >
                            Hủy
                        </CButton>
                        <CButton
                            color={blockTarget.type === '24H' ? 'warning' : 'danger'}
                            onClick={handleConfirmBlock}
                            disabled={blockLoading}
                        >
                            {blockLoading
                                ? <CSpinner size="sm" />
                                : <><CIcon icon={cilBan} className="me-1" />
                                    {blockTarget.type === '24H' ? 'Khóa 24 giờ' : 'Khóa vĩnh viễn'}</>}
                        </CButton>
                    </CModalFooter>
                </CModal>
            )}

            {/* ── Unblock confirm modal ────────────────────────────────────── */}
            {unblockModalVisible && unblockTarget && (
                <CModal
                    visible={unblockModalVisible}
                    onClose={() => { setUnblockModalVisible(false); setUnblockTarget(null); }}
                    centered backdrop="static"
                >
                    <CModalHeader>
                        <CModalTitle>
                            <CIcon icon={cilLockUnlocked} className="me-2 text-success" />
                            Xác nhận mở khóa tài khoản
                        </CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        <p>
                            Bạn có chắc muốn mở khóa tài khoản{' '}
                            <strong>{unblockTarget.username}</strong>?
                        </p>
                        <p className="text-muted small">
                            Người dùng sẽ có thể đăng nhập lại bình thường.
                        </p>
                    </CModalBody>
                    <CModalFooter>
                        <CButton
                            color="secondary"
                            variant="ghost"
                            onClick={() => { setUnblockModalVisible(false); setUnblockTarget(null); }}
                            disabled={unblockLoading}
                        >
                            Hủy
                        </CButton>
                        <CButton color="success" onClick={handleConfirmUnblock} disabled={unblockLoading}>
                            {unblockLoading
                                ? <CSpinner size="sm" />
                                : <><CIcon icon={cilLockUnlocked} className="me-1" /> Mở khóa</>}
                        </CButton>
                    </CModalFooter>
                </CModal>
            )}
        </>
    );
};

export default UserTable;
