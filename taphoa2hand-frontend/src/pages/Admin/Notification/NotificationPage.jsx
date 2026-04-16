import React, { useState } from 'react';
import {
  CCard, CCardHeader, CCardBody, CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CButton, CModal, CModalHeader, CModalTitle,
  CModalBody, CModalFooter, CForm, CFormInput, CFormTextarea, CInputGroup
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilTrash, cilPlus, cilCheckCircle, cilSearch, cilLink } from '@coreui/icons';

// Import cấu hình API và httpClient của bạn

import { API } from '../../../configurations/configuration';
import httpClient from '../../../configurations/httpClient';

const Notificationpage = () => {
  const [notifications, setNotifications] = useState([]);
  const [searchUserId, setSearchUserId] = useState('');
  const [loading, setLoading] = useState(false);
  
  // State cho Modal Thêm mới (Đã bổ sung trường link)
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({ recipientId: '', content: '', link: '' });

  // 1. TÌM KIẾM THÔNG BÁO THEO USER ID
  const fetchNotifications = async () => {
    if (!searchUserId) {
      alert("Vui lòng nhập ID người dùng để xem thông báo!");
      return;
    }
    setLoading(true);
    try {
      // Sử dụng httpClient để tự động có Authorization header
      const response = await httpClient.get(API.GET_NOTIFICATIONS(searchUserId));
      setNotifications(response.data.result); 
    } catch (error) {
      console.error("Lỗi khi tải danh sách:", error);
      alert("Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  // 2. THÊM THÔNG BÁO MỚI
  const handleSave = async () => {
    if (!formData.recipientId || !formData.content) {
      alert("Vui lòng nhập đủ ID người nhận và nội dung!");
      return;
    }
    try {
      const response = await httpClient.post(API.CREATE_NOTIFICATION, formData);
      const newNoti = response.data.result;
      
      alert("Gửi thông báo thành công!");
      setModalVisible(false);
      setFormData({ recipientId: '', content: '', link: '' });
      
      // Nếu admin đang xem danh sách của user đó, thì thêm luôn vào danh sách hiển thị
      if (searchUserId === formData.recipientId.toString()) {
        setNotifications(prev => [newNoti, ...prev]);
      }
    } catch (error) {
      console.error("Lỗi khi gửi thông báo", error);
      alert("Lỗi khi gửi thông báo.");
    }
  };

  // 3. ĐÁNH DẤU ĐÃ ĐỌC
  const handleMarkAsRead = async (id) => {
    try {
      const response = await httpClient.put(API.MARK_READ_NOTIFICATION(id));
      const updatedNoti = response.data.result;
      setNotifications(prev => 
        prev.map(noti => noti.id === id ? updatedNoti : noti)
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    }
  };

  // 4. XÓA THÔNG BÁO
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thông báo này?")) {
      try {
        await httpClient.delete(API.DELETE_NOTIFICATION(id));
        setNotifications(prev => prev.filter(n => n.id !== id));
        alert("Đã xóa thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa", error);
        alert("Lỗi khi xóa thông báo.");
      }
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
            <label className="form-label fw-bold">Xem thông báo của người dùng:</label>
            <CInputGroup>
              <CFormInput 
                type="text" 
                placeholder="Nhập User ID..."
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
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
                <CTableRow>
                  <CTableDataCell colSpan="5" className="text-center">Đang tải...</CTableDataCell>
                </CTableRow>
              ) : notifications.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan="5" className="text-center text-muted">
                    Không có dữ liệu. Vui lòng tìm kiếm ID người dùng.
                  </CTableDataCell>
                </CTableRow>
              ) : (
                notifications.map((noti) => (
                  <CTableRow key={noti.id}>
                    <CTableDataCell style={{ maxWidth: '250px', whiteSpace: 'normal' }}>
                      {noti.content}
                    </CTableDataCell>
                    <CTableDataCell style={{ maxWidth: '150px' }}>
                      {noti.link ? (
                        <a href={noti.link} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                          <CIcon icon={cilLink} className="me-1" /> Mở Link
                        </a>
                      ) : (
                        <span className="text-muted small">Không có</span>
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      {noti.read ? (
                        <span className="text-success fw-semibold">Đã đọc</span>
                      ) : (
                        <span className="text-danger fw-bold">Chưa đọc</span>
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      {new Date(noti.createdAt).toLocaleString('vi-VN')}
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      {!noti.read && (
                        <CButton 
                          color="success" 
                          variant="ghost" 
                          size="sm" 
                          title="Đánh dấu đã đọc"
                          onClick={() => handleMarkAsRead(noti.id)}
                          className="me-2"
                        >
                          <CIcon icon={cilCheckCircle} />
                        </CButton>
                      )}
                      <CButton 
                        color="danger" 
                        variant="ghost" 
                        size="sm" 
                        title="Xóa"
                        onClick={() => handleDelete(noti.id)}
                      >
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

      {/* Modal Tạo Thông Báo */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Tạo thông báo mới</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <label className="form-label">ID Người nhận <span className="text-danger">*</span></label>
              <CFormInput 
                type="text" 
                placeholder="VD: 1, 2..."
                value={formData.recipientId}
                onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Nội dung thông báo <span className="text-danger">*</span></label>
              <CFormTextarea 
                rows="3"
                placeholder="Nhập nội dung..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              ></CFormTextarea>
            </div>
            <div className="mb-3">
              <label className="form-label">Đường dẫn đính kèm (Link)</label>
              <CFormInput 
                type="text" 
                placeholder="VD: /posts/123 hoặc https://..."
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              />
              <div className="form-text">Khi người dùng click vào thông báo sẽ chuyển hướng đến link này (tùy chọn).</div>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>Hủy</CButton>
          <CButton color="primary" onClick={handleSave}>Gửi thông báo</CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default Notificationpage;