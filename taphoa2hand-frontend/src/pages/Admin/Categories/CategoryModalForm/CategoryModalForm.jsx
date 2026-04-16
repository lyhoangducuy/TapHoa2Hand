// src/components/CategoryModalForm.jsx
import React, { useState, useEffect } from 'react';
import { 
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CForm, CFormLabel, CFormInput, CButton 
} from '@coreui/react';

const CategoryModalForm = ({ visible, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ 
    name: '' 
  });

  // Reset form mỗi khi mở/đóng Modal
  useEffect(() => {
    if (!visible) {
      setFormData({ name: '' });
    }
  }, [visible]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    // Gọi hàm onSubmit truyền từ component cha xuống
    onSubmit(formData);
  };

  return (
    <CModal alignment="center" visible={visible} onClose={onClose} backdrop="static">
      <CModalHeader>
        <CModalTitle>Thêm danh mục nhanh</CModalTitle>
      </CModalHeader>
      
      <CModalBody>
        <CForm>
          <div className="mb-3">
            <CFormLabel className="fw-semibold">Tên danh mục (*)</CFormLabel>
            <CFormInput 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="Nhập tên danh mục..." 
              autoFocus
            />
          </div>
        </CForm>
      </CModalBody>
      
      <CModalFooter>
        <CButton color="secondary" variant="ghost" onClick={onClose}>
          Hủy bỏ
        </CButton>
        <CButton 
          color="primary" 
          onClick={handleSubmit} 
          disabled={!formData.name.trim()} // Khóa nút nếu chưa nhập tên
        >
          Lưu thông tin
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default CategoryModalForm;