import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './UserAdminPage.module.scss';
import {
    CCard, CCardBody, CCardHeader, CButton, CFormInput,
    CInputGroup, CInputGroupText, CPagination, CPaginationItem,
    CAlert,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilUserPlus, cilBan, cilLockUnlocked } from '@coreui/icons';

import UserTable from './UserTable/UserTable';
import { getUserAdmin } from '../../../services/userService';
import { blockUser, unblockUser } from '../../../services/adminUserService';
import { toast } from 'react-toastify';

const cx = classNames.bind(styles);

function UserAdminPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]);

    const fetchUsers = async (page) => {
        try {
            setIsLoading(true);
            const response = await getUserAdmin(page, 10);
            if (response && response.code === 1000) {
                setUsers(response.result.content || []);
                setTotalPages(response.result.totalPages || 1);
            }
        } catch (error) {
            console.error('Lỗi fetch users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Block user (24h or permanent) ──────────────────────────────────────────
    const handleBlockUser = async (userId, reason, durationHours) => {
        await blockUser(userId, reason, durationHours);
        const label = durationHours === 24 ? '24 giờ' : 'vĩnh viễn';
        toast.success(`Đã khóa tài khoản ${label}!`);
    };

    // ── Unblock user ──────────────────────────────────────────────────────────
    const handleUnblockUser = async (userId) => {
        await unblockUser(userId);
        toast.success('Đã mở khóa tài khoản!');
    };

    const renderPaginationItems = () => {
        const items = [];
        for (let i = 0; i < totalPages; i++) {
            items.push(
                <CPaginationItem
                    key={i} active={i === currentPage}
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
        <div className={cx('user-page')}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0">Quản lý người dùng</h3>
                <CButton color="primary" onClick={() => navigate('/admin/users/create')}>
                    <CIcon icon={cilUserPlus} className="me-2" /> Thêm người dùng
                </CButton>
            </div>

            <CCard className="mb-4 shadow-sm border-0">
                <CCardHeader className="bg-white py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <CInputGroup className="w-50">
                            <CInputGroupText><CIcon icon={cilSearch} /></CInputGroupText>
                            <CFormInput placeholder="Tìm kiếm theo username..." />
                        </CInputGroup>
                        <small className="text-muted">
                            Tổng cộng: <strong>{totalPages > 0 ? users.length : 0}</strong> người dùng
                        </small>
                    </div>
                </CCardHeader>
                <CCardBody>
                    <UserTable
                        users={users}
                        onRefresh={() => fetchUsers(currentPage)}
                        onBlock24h={handleBlockUser}
                        onBlockPermanent={handleBlockUser}
                        onUnblock={handleUnblockUser}
                    />

                    {totalPages > 0 && (
                        <div className="d-flex justify-content-end mt-4">
                            <CPagination>
                                <CPaginationItem
                                    disabled={currentPage === 0}
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                >
                                    Trước
                                </CPaginationItem>
                                {renderPaginationItems()}
                                <CPaginationItem
                                    disabled={currentPage >= totalPages - 1}
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                >
                                    Sau
                                </CPaginationItem>
                            </CPagination>
                        </div>
                    )}
                </CCardBody>
            </CCard>
        </div>
    );
}

export default UserAdminPage;