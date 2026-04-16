import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CCard, CCardBody, CButton, CForm, CFormInput, 
  CRow, CCol, CSpinner 
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilArrowLeft, cilSave } from '@coreui/icons';

import { adminCreateCategory } from '../../../../services/categoryService';

function CategoryCreatePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    name: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      await adminCreateCategory(formData); // data chỉ gồm { name: "..." }
      alert("Tạo danh mục thành công!");
      navigate('/admin/categories'); 
    } catch (error) {
      console.error("Lỗi khi tạo danh mục", error);
      setErrorMsg("Tạo danh mục thất bại, vui lòng kiểm tra lại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="user-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold m-0">Thêm Mới Danh Mục</h3>
        <CButton color="secondary" variant="outline" onClick={() => navigate(-1)}>
          <CIcon icon={cilArrowLeft} className="me-2"/> Quay lại
        </CButton>
      </div>

      <CCard className="shadow-sm border-0 mb-5">
        <CCardBody>
          {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

          <CForm onSubmit={handleSubmit}>
            <CRow className="mb-4">
              <CCol md={6}>
                <CFormInput 
                  label="Tên danh mục (*)" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  placeholder="Nhập tên danh mục..."
                />
              </CCol>
            </CRow>

            <div className="d-flex justify-content-end mt-4 pt-3 border-top">
              <CButton color="primary" type="submit" disabled={isLoading} className="px-4 py-2">
                {isLoading ? <CSpinner size="sm" className="me-2" /> : <CIcon icon={cilSave} className="me-2" />}
                Lưu danh mục
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  );
}

export default CategoryCreatePage;