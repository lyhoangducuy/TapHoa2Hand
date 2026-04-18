import React, { useState, useEffect } from 'react';
import {
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CForm, CFormInput, CFormTextarea, CInputGroup, CFormCheck,
  CButton, CSpinner, CBadge
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPeople } from '@coreui/icons';

import { getUserAdmin } from '../../../../services/userService'; 
import { createNotification } from '../../../../services/notificationService';

const CreateNotificationModal = ({ visible, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ content: '', link: '' });
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible && allUsers.length === 0) {
      fetchAllUsersForSelection();
    }
  }, [visible]);

  const fetchAllUsersForSelection = async () => {
    setLoadingUsers(true);
    try {
      const res = await getUserAdmin(0, 1000);
      const usersList = res.result?.content || res.result?.data || res.data?.result || res.result || [];
      setAllUsers(usersList);
    } catch (error) {
      console.error("Lỗi lấy danh sách user:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSave = async () => {
    if (selectedUsers.length === 0 || !formData.content.trim()) {
      alert("Vui lòng chọn ít nhất 1 người nhận và nhập nội dung!");
      return;
    }
    
    setIsSubmitting(true);

    // Dữ liệu này phải khớp với NotificationRequest bên Backend Java
    const payload = {
      userIds: selectedUsers, // Backend dùng getUserId()
      content: formData.content,
      link: formData.link
    };

    try {
      await createNotification(payload); 
      // Gửi thành công -> Báo cho component cha và reset form
      onSuccess(selectedUsers);
      setFormData({ content: '', link: '' });
      setSelectedUsers([]); 
      setUserSearchTerm('');
    } catch (error) {
      console.error("Lỗi khi gửi thông báo", error);
      alert("Lỗi khi gửi thông báo.");
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
    const isAllSelected = filteredIds.length > 0 && filteredIds.every(id => selectedUsers.includes(id));

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
    <CModal visible={visible} onClose={onClose} size="lg" backdrop="static">
      <CModalHeader>
        <CModalTitle>Tạo thông báo mới</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm>
          {/* Người nhận */}
          <div className="mb-4 border p-3 rounded bg-light">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="form-label fw-bold mb-0">
                Chọn người nhận <span className="text-danger">*</span>
                {selectedUsers.length > 0 && <CBadge color="info" className="ms-2">Đã chọn: {selectedUsers.length}</CBadge>}
              </label>
              <CButton color="secondary" size="sm" onClick={fetchAllUsersForSelection} disabled={loadingUsers}>
                {loadingUsers ? <CSpinner size="sm"/> : <CIcon icon={cilPeople} className="me-1"/>} Tải lại DS
              </CButton>
            </div>

            <CInputGroup className="mb-3">
              <CFormInput 
                placeholder="Tìm kiếm theo username, email hoặc ID..." 
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
              />
            </CInputGroup>

            <div className="user-list-container border bg-white p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {loadingUsers ? (
                <div className="text-center p-3 text-muted">Đang tải danh sách...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center p-3 text-muted">Không tìm thấy người dùng.</div>
              ) : (
                <>
                  <div className="mb-2 pb-2 border-bottom">
                    <CFormCheck 
                      id="selectAll"
                      label={<span className="fw-bold text-primary">Chọn tất cả ({filteredUsers.length})</span>}
                      checked={filteredUsers.length > 0 && filteredUsers.every(u => selectedUsers.includes(u.id.toString()))}
                      onChange={handleSelectAllFiltered}
                    />
                  </div>
                  {filteredUsers.map(user => (
                    <div key={user.id} className="mb-1">
                      <CFormCheck 
                        id={`user-${user.id}`}
                        label={`${user.username || user.fullName} ${user.email ? `(${user.email})` : ''} - ID: ${user.id}`}
                        checked={selectedUsers.includes(user.id.toString())}
                        onChange={() => toggleUserSelection(user.id)}
                      />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Nội dung */}
          <div className="mb-3">
            <label className="form-label fw-bold">Nội dung thông báo <span className="text-danger">*</span></label>
            <CFormTextarea 
              rows="3"
              placeholder="Nhập nội dung gửi đến người dùng..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>
          
          {/* Link đính kèm */}
          <div className="mb-3">
            <label className="form-label fw-bold">Đường dẫn đính kèm (Link)</label>
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
        <CButton color="secondary" onClick={onClose} disabled={isSubmitting}>Hủy</CButton>
        <CButton color="primary" onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? <CSpinner size="sm"/> : `Gửi thông báo (${selectedUsers.length} người)`}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default CreateNotificationModal;