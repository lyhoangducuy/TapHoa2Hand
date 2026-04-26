// src/components/PostModalForm.jsx
import React, { useState, useEffect } from 'react';
import { 
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CForm, CFormLabel, CFormInput, CFormSelect, CButton, CSpinner
} from '@coreui/react';

// Import API
import { getAllPostStatuses } from '../../../../services/postStatus';

const PostModalForm = ({ visible, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ 
    title: '', 
    price: '', 
    postTypeName: 'SELL',
    status: '' 
  });

  const [statuses, setStatuses] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  // LẤY TRẠNG THÁI ĐỘNG KHI MỞ MODAL
  useEffect(() => {
    if (visible) {
      const fetchStatuses = async () => {
        setIsFetching(true);
        try {
          const response = await getAllPostStatuses();
          const data = response.result || response || [];
          setStatuses(data);

          // Gán mặc định là phần tử đầu tiên
          if (data.length > 0) {
            const firstVal = data[0].value || data[0];
            setFormData(prev => ({ ...prev, status: firstVal }));
          }
        } catch (error) {
          console.error("Lỗi lấy trạng thái:", error);
        } finally {
          setIsFetching(false);
        }
      };

      fetchStatuses();
    } else {
      // Khi đóng Modal, reset form
      setFormData({ title: '', price: '', postTypeName: 'SELL', status: '' });
    }
  }, [visible]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    const dataToSubmit = {
      ...formData,
      price: Number(formData.price)
    };
    onSubmit(dataToSubmit);
  };

  return (
    <CModal alignment="center" visible={visible} onClose={onClose} backdrop="static">
      <CModalHeader>
        <CModalTitle>Thêm bài viết nhanh</CModalTitle>
      </CModalHeader>
      
      <CModalBody>
        {isFetching ? (
          <div className="text-center py-3">
             <CSpinner size="sm"/> Đang tải dữ liệu...
          </div>
        ) : (
          <CForm>
            <div className="mb-3">
              <CFormLabel>Tiêu đề bài viết (*)</CFormLabel>
              <CFormInput 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                placeholder="Nhập tiêu đề bài viết..." 
              />
            </div>
            <div className="mb-3">
              <CFormLabel>Giá bán - VNĐ (*)</CFormLabel>
              <CFormInput 
                type="number" 
                name="price" 
                value={formData.price} 
                onChange={handleChange} 
                placeholder="Ví dụ: 150000" 
              />
            </div>
            <div className="mb-3">
              <CFormLabel>Loại bài viết</CFormLabel>
              <CFormSelect name="postTypeName" value={formData.postTypeName} onChange={handleChange}>
                <option value="SELL">Tin rao bán</option>
                <option value="BUY">Tin cần mua</option>
              </CFormSelect>
            </div>
            <div className="mb-3">
              <CFormLabel>Trạng thái</CFormLabel>
              <CFormSelect name="status" value={formData.status} onChange={handleChange}>
                {statuses.map((st, idx) => {
                   const val = st.value || st;
                   const lbl = st.label || st;
                   return <option key={idx} value={val}>{lbl}</option>;
                })}
              </CFormSelect>
            </div>
          </CForm>
        )}
      </CModalBody>
      
      <CModalFooter>
        <CButton color="secondary" variant="ghost" onClick={onClose} disabled={isFetching}>Hủy bỏ</CButton>
        <CButton color="primary" onClick={handleSubmit} disabled={isFetching}>Lưu thông tin</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default PostModalForm;