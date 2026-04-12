import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from '../UserAdminPage.module.scss'; // Dùng chung style hoặc tạo file mới tùy bạn
import {
  CCard, CCardBody, CCardHeader, CButton, CForm, CFormInput, CRow, CCol, CFormCheck, CSpinner
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilArrowLeft, cilSave } from '@coreui/icons';

import { createUserAdmin } from '../../../../services/userService';

const cx = classNames.bind(styles);

function UserCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Khởi tạo state khớp với UserCreateRequest DTO bên Backend
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    phone: '',
    email: '',
    password: '',
    dob: '',
    roles: ['USER'] // Mặc định tích sẵn role USER
  });

  // Xử lý thay đổi input text/date
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Xử lý thay đổi Checkbox Role (Chọn nhiều role)
  const handleRoleChange = (e) => {
    const { value, checked } = e.target;
    let newRoles = [...formData.roles];
    
    if (checked) {
      newRoles.push(value);
    } else {
      newRoles = newRoles.filter(role => role !== value);
    }
    
    setFormData(prev => ({ ...prev, roles: newRoles }));
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // Gọi API từ userService.js đã viết ở bước trước
      const response = await createUserAdmin(formData);
      
      // Tùy vào cách backend trả về, giả sử code 1000 là thành công
      if (response && response.code === 1000) {
        alert("Tạo người dùng thành công!");
        navigate('/admin/users'); // Chuyển hướng về lại trang danh sách (Sửa lại route cho đúng với app của bạn)
      } else {
        // Lỗi validate từ backend (trùng email, username,...)
        setErrorMsg(response.message || "Có lỗi xảy ra khi tạo user!");
      }
    } catch (error) {
      console.error("Lỗi submit:", error);
      setErrorMsg("Lỗi kết nối đến máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cx('user-page')}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold m-0">Thêm người dùng mới</h3>
        <CButton color="secondary" variant="outline" onClick={() => navigate(-1)}>
          <CIcon icon={cilArrowLeft} className="me-2"/> Quay lại
        </CButton>
      </div>

      <CCard className="shadow-sm border-0">
        <CCardHeader className="bg-white py-3">
          <h6 className="m-0 text-primary">Thông tin tài khoản</h6>
        </CCardHeader>
        <CCardBody>
          {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

          <CForm onSubmit={handleSubmit}>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormInput
                  type="text"
                  label="Họ và tên (*)"
                  name="fullName"
                  placeholder="Nhập họ và tên..."
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  minLength={3}
                  maxLength={50}
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  type="text"
                  label="Tên đăng nhập (Username) (*)"
                  name="username"
                  placeholder="Nhập tên đăng nhập..."
                  value={formData.username}
                  onChange={handleChange}
                  required
                  minLength={3}
                  maxLength={50}
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormInput
                  type="email"
                  label="Email (*)"
                  name="email"
                  placeholder="example@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  type="password"
                  label="Mật khẩu (*)"
                  name="password"
                  placeholder="Nhập mật khẩu..."
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </CCol>
            </CRow>

            <CRow className="mb-4">
              <CCol md={6}>
                <CFormInput
                  type="text"
                  label="Số điện thoại"
                  name="phone"
                  placeholder="Nhập số điện thoại..."
                  value={formData.phone}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  type="date"
                  label="Ngày sinh (Phải >= 15 tuổi)"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                />
              </CCol>
            </CRow>

            {/* Phân quyền (Roles) */}
            <CRow className="mb-4">
              <CCol md={12}>
                <label className="form-label d-block">Vai trò / Phân quyền</label>
                <CFormCheck 
                  inline 
                  type="checkbox" 
                  id="roleUser" 
                  value="USER" 
                  label="USER"
                  checked={formData.roles.includes('USER')}
                  onChange={handleRoleChange}
                />
                <CFormCheck 
                  inline 
                  type="checkbox" 
                  id="roleAdmin" 
                  value="ADMIN" 
                  label="ADMIN"
                  checked={formData.roles.includes('ADMIN')}
                  onChange={handleRoleChange}
                />
              </CCol>
            </CRow>

            <div className="d-flex justify-content-end">
              <CButton 
                color="secondary" 
                className="me-2" 
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Hủy
              </CButton>
              <CButton color="primary" type="submit" disabled={loading}>
                {loading ? <CSpinner size="sm" className="me-2" /> : <CIcon icon={cilSave} className="me-2" />}
                Lưu người dùng
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  );
}

export default UserCreatePage;