import React, { useEffect, useState } from 'react';
import {
  CCard, CCardHeader, CCardBody, CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CButton, CInputGroup, CFormInput, CSpinner, CBadge
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilTrash, cilPlus, cilCheckCircle, cilSearch, cilLink } from '@coreui/icons';

import { API } from '../../../configurations/configuration';
import httpClient from '../../../configurations/httpClient';
import CreateNotificationModal from './Create/CreateNotificationModal'; 
import { getToken } from '../../../services/localstorageService';
import { initiateSocketConnection } from '../../../services/socketService';

const Notificationpage = () => {
  const [notifications, setNotifications] = useState([]);
  const [searchUserId, setSearchUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Mở Socket cho Admin ngay khi load trang
  useEffect(() => {
    const token = getToken();
    if (token) {
      initiateSocketConnection(token);
    }
  }, []);

  const fetchNotifications = async () => {
    if (!searchUserId) {
      alert("Vui lòng nhập ID người dùng để xem thông báo!");
      return;
    }
    setLoading(true);
    try {
      const response = await httpClient.get(API.GET_NOTIFICATIONS(searchUserId));
      setNotifications(response.data.result || []); 
    } catch (error) {
      console.error("Lỗi khi tải danh sách:", error);
      alert("Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const response = await httpClient.put(API.MARK_READ_NOTIFICATION(id));
      const updatedNoti = response.data.result;
      setNotifications(prev => prev.map(noti => noti.id === id ? updatedNoti : noti));
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thông báo này?")) {
      try {
        await httpClient.delete(API.DELETE_NOTIFICATION(id));
        setNotifications(prev => prev.filter(n => n.id !== id));
      } catch (error) {
        console.error("Lỗi khi xóa", error);
        alert("Lỗi khi xóa thông báo.");
      }
    }
  };

  // Hàm này chạy khi Modal gửi thông báo thành công
  const handleModalSuccess = (targetedUsers) => {
    setModalVisible(false);
    // Nếu Admin đang xem ID của người vừa được gửi thông báo -> tự động tải lại bảng
    if (searchUserId && targetedUsers.includes(searchUserId.toString())) {
      fetchNotifications();
    }
  };

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Quản lý thông báo</strong>
          <CButton color="primary" onClick={() => setModalVisible(true)}>
            <CIcon icon={cilPlus} className="me-2" />
            Tạo thông báo mới
          </CButton>
        </CCardHeader>
        
        <CCardBody>
          <div className="mb-4" style={{ maxWidth: '400px' }}>
            <label className="form-label fw-bold">Xem thông báo của người dùng (Nhập ID):</label>
            <CInputGroup>
              <CFormInput 
                type="text" 
                placeholder="Nhập User ID..."
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchNotifications()}
              />
              <CButton type="button" color="secondary" onClick={fetchNotifications}>
                <CIcon icon={cilSearch} className="me-1"/> Tìm
              </CButton>
            </CInputGroup>
          </div>

          <CTable hover responsive align="middle">
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell>Nội dung</CTableHeaderCell>
                <CTableHeaderCell>Link đính kèm</CTableHeaderCell>
                <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                <CTableHeaderCell>Ngày tạo</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Hành động</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {loading ? (
                <CTableRow><CTableDataCell colSpan="5" className="text-center"><CSpinner size="sm" /></CTableDataCell></CTableRow>
              ) : notifications.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan="5" className="text-center text-muted">
                    {searchUserId ? "Người dùng này chưa có thông báo nào." : "Nhập ID để xem lịch sử."}
                  </CTableDataCell>
                </CTableRow>
              ) : (
                notifications.map((noti) => (
                  <CTableRow key={noti.id}>
                    <CTableDataCell style={{ maxWidth: '250px', whiteSpace: 'normal' }}>{noti.content}</CTableDataCell>
                    <CTableDataCell style={{ maxWidth: '150px' }}>
                      {noti.link ? (
                        <a href={noti.link} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                          <CIcon icon={cilLink} className="me-1" /> Mở Link
                        </a>
                      ) : <span className="text-muted small">Không có</span>}
                    </CTableDataCell>
                    <CTableDataCell>
                      {noti.read ? <CBadge color="success">Đã đọc</CBadge> : <CBadge color="danger">Chưa đọc</CBadge>}
                    </CTableDataCell>
                    <CTableDataCell>{new Date(noti.createdAt).toLocaleString('vi-VN')}</CTableDataCell>
                    <CTableDataCell className="text-center">
                      {!noti.read && (
                        <CButton color="success" variant="ghost" size="sm" onClick={() => handleMarkAsRead(noti.id)} className="me-2">
                          <CIcon icon={cilCheckCircle} />
                        </CButton>
                      )}
                      <CButton color="danger" variant="ghost" size="sm" onClick={() => handleDelete(noti.id)}>
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))
              )}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      <CreateNotificationModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSuccess={handleModalSuccess} 
      />
    </>
  );
};

export default Notificationpage;