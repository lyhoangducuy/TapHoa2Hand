import React, { useState, useEffect } from 'react';
import {
    CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
    CForm, CFormInput, CFormTextarea, CFormLabel,
    CButton, CSpinner, CBadge,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPeople } from '@coreui/icons';

import { getUserAdmin, getMyInfo } from '../../../../services/userService';
import { createNotification } from '../../../../services/notificationService';

const CreateNotificationModal = ({ visible, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ content: '', link: '' });
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        if (visible) {
            if (allUsers.length === 0) {
                fetchAllUsersForSelection();
            }
            fetchCurrentUser();
        }
    }, [visible]);

    const fetchCurrentUser = async () => {
        try {
            const res = await getMyInfo();
            const user = res?.data?.result || res?.result || res;
            if (user?.id) {
                setCurrentUserId(String(user.id));
            }
        } catch (error) {
            console.error('Lỗi lấy thông tin user hiện tại:', error);
        }
    };

    const fetchAllUsersForSelection = async () => {
        setLoadingUsers(true);
        try {
            const res = await getUserAdmin(0, 1000);
            const usersList = res.result?.content || res.result?.data || res.data?.result || res.result || [];
            setAllUsers(usersList);
        } catch (error) {
            console.error('Lỗi lấy danh sách user:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleSave = async () => {
        if (selectedUsers.length === 0 || !formData.content.trim()) {
            alert('Vui lòng chọn ít nhất 1 người nhận và nhập nội dung!');
            return;
        }

        setIsSubmitting(true);
        const payload = {
            userIds: selectedUsers,
            content: formData.content,
            link: formData.link,
            createdBy: currentUserId,
        };

        try {
            await createNotification(payload);
            onSuccess(selectedUsers);
            setFormData({ content: '', link: '' });
            setSelectedUsers([]);
            setUserSearchTerm('');
        } catch (error) {
            console.error('Lỗi khi gửi thông báo', error);
            alert('Lỗi khi gửi thông báo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredUsers = allUsers.filter(u =>
        (u.username || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        (u.id || '').toString().includes(userSearchTerm)
    );

    const handleSelectAllFiltered = () => {
        const filteredIds = filteredUsers.map(u => u.id.toString());
        const isAllSelected = filteredIds.length > 0 &&
            filteredIds.every(id => selectedUsers.includes(id));

        if (isAllSelected) {
            setSelectedUsers(prev => prev.filter(id => !filteredIds.includes(id)));
        } else {
            setSelectedUsers(prev => Array.from(new Set([...prev, ...filteredIds])));
        }
    };

    const toggleUserSelection = (userId) => {
        const idStr = userId.toString();
        setSelectedUsers(prev =>
            prev.includes(idStr) ? prev.filter(id => id !== idStr) : [...prev, idStr]
        );
    };

    return (
        <CModal alignment="center" visible={visible} onClose={onClose} size="lg" backdrop="static">
            <CModalHeader>
                <CModalTitle>Tạo thông báo mới</CModalTitle>
            </CModalHeader>
            <CModalBody>
                <CForm>
                    {/* Người nhận */}
                    <div className="mb-4 border p-3 rounded bg-light">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="d-flex align-items-center gap-2">
                                <CFormLabel className="fw-bold mb-0">Chọn người nhận <span className="text-danger">*</span></CFormLabel>
                                {selectedUsers.length > 0 && (
                                    <CBadge color="info" shape="rounded-pill">
                                        Đã chọn: {selectedUsers.length}
                                    </CBadge>
                                )}
                            </div>
                            <CButton
                                color="secondary"
                                variant="outline"
                                size="sm"
                                onClick={fetchAllUsersForSelection}
                                disabled={loadingUsers}
                            >
                                {loadingUsers ? <CSpinner size="sm" /> : <><CIcon icon={cilPeople} className="me-1" />Tải lại DS</>}
                            </CButton>
                        </div>

                        <CFormInput
                            className="mb-3"
                            placeholder="Tìm kiếm theo username, email hoặc ID..."
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                        />

                        <div
                            className="border bg-white rounded p-2"
                            style={{ maxHeight: '220px', overflowY: 'auto' }}
                        >
                            {loadingUsers ? (
                                <div className="text-center py-3 text-muted">
                                    <CSpinner size="sm" /> Đang tải...
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="text-center py-3 text-muted">Không tìm thấy người dùng.</div>
                            ) : (
                                <>
                                    <div className="mb-2 pb-2 border-bottom">
                                        <label className="d-flex align-items-center gap-2 fw-bold text-primary cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    filteredUsers.length > 0 &&
                                                    filteredUsers.every(u => selectedUsers.includes(u.id.toString()))
                                                }
                                                onChange={handleSelectAllFiltered}
                                            />
                                            Chọn tất cả ({filteredUsers.length})
                                        </label>
                                    </div>
                                    {filteredUsers.map(user => (
                                        <div key={user.id} className="mb-1">
                                            <label className="d-flex align-items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.includes(user.id.toString())}
                                                    onChange={() => toggleUserSelection(user.id)}
                                                />
                                                <span>
                                                    {user.username || user.fullName}{' '}
                                                    {user.email ? `(${user.email})` : ''} —{' '}
                                                    <span className="text-muted small">ID: {user.id}</span>
                                                </span>
                                            </label>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Nội dung */}
                    <div className="mb-3">
                        <CFormLabel className="fw-semibold">Nội dung thông báo <span className="text-danger">*</span></CFormLabel>
                        <CFormTextarea
                            rows={3}
                            placeholder="Nhập nội dung gửi đến người dùng..."
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        />
                    </div>

                    {/* Link đính kèm */}
                    <div className="mb-3">
                        <CFormLabel className="fw-semibold">Đường dẫn đính kèm (Link)</CFormLabel>
                        <CFormInput
                            type="text"
                            placeholder="VD: /posts/123 hoặc https://..."
                            value={formData.link}
                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                        />
                    </div>
                </CForm>
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                    Hủy bỏ
                </CButton>
                <CButton
                    color="primary"
                    onClick={handleSave}
                    disabled={isSubmitting || selectedUsers.length === 0 || !formData.content.trim()}
                >
                    {isSubmitting ? <CSpinner size="sm" /> : <>Gửi thông báo ({selectedUsers.length} người)</>}
                </CButton>
            </CModalFooter>
        </CModal>
    );
};

export default CreateNotificationModal;
