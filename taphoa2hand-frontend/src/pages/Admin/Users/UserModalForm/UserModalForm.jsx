import React, { useState } from 'react';
import { 
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CForm, CFormLabel, CFormInput, CFormSelect, CButton
} from '@coreui/react';

const UserModalForm = ({ visible, onClose, onSubmit }) => {
  // State cục bộ chỉ để lưu tạm dữ liệu người dùng đang nhập
  const [formData, setFormData] = useState({ name: '', email: '', role: 'User' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    // Gọi hàm onSubmit của Component Cha truyền xuống và đưa dữ liệu cho Cha
    onSubmit(formData);
    
    // Reset form sau khi gửi
    setFormData({ name: '', email: '', role: 'User' });
  };

  return (
    <CModal alignment="center" visible={visible} onClose={onClose} backdrop="static">
      <CModalHeader>
        <CModalTitle>Thêm người dùng mới</CModalTitle>
      </CModalHeader>
      
      <CModalBody>
        <CForm>
          <div className="mb-3">
            <CFormLabel htmlFor="inputName">Họ và tên</CFormLabel>
            <CFormInput 
              id="inputName" name="name" 
              value={formData.name} onChange={handleChange} 
              placeholder="Nhập họ và tên..." 
            />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="inputEmail">Email</CFormLabel>
            <CFormInput 
              type="email" id="inputEmail" name="email" 
              value={formData.email} onChange={handleChange} 
              placeholder="name@example.com" 
            />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="selectRole">Vai trò</CFormLabel>
            <CFormSelect id="selectRole" name="role" value={formData.role} onChange={handleChange}>
              <option value="User">Người dùng (User)</option>
              <option value="Admin">Quản trị viên (Admin)</option>
            </CFormSelect>
          </div>
        </CForm>
      </CModalBody>
      
      <CModalFooter>
        <CButton color="secondary" variant="ghost" onClick={onClose}>Hủy bỏ</CButton>
        <CButton color="primary" onClick={handleSubmit}>Lưu thông tin</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default UserModalForm;