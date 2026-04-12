// src/pages/UserEditPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CCard, CCardBody, CCardHeader, CForm, CFormLabel, 
  CFormInput, CButton, CFormSelect, CSpinner, CRow, CCol, CAvatar
} from '@coreui/react';

// Nhớ import đúng tên hàm getInfoAdmin nhé
import { updateUserInfoAdmin, updateAvatarAdmin, getInfoAdmin } from '../../../../../services/userService'; 

const UserEditPage = () => {
  const { userId } = useParams(); 
  const navigate = useNavigate();

  // State hứng chuẩn các trường từ JSON
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    roles: ['USER'] 
  });
  
  const [avatarPreview, setAvatarPreview] = useState(null); // Để hiển thị ảnh cũ
  const [avatarFile, setAvatarFile] = useState(null);       // Để lưu file ảnh mới nếu đổi
  
  const [isFetching, setIsFetching] = useState(true); 
  const [isSaving, setIsSaving] = useState(false);    

  // 1. GỌI API LẤY DATA
  useEffect(() => {
    const fetchUserData = async () => {
      setIsFetching(true);
      try {
        const res = await getInfoAdmin(userId);
        
        const user = res.result ;
        setFormData({
          username: user.username || '',
          fullName: user.fullName || '',
          email: user.email || '',
          phone: user.phone || '',
          dob: user.dob || '',
          roles: user.roles && user.roles.length > 0 ? [user.roles[0].name] : ['USER']
        });
        
        // Lưu link ảnh cũ để hiển thị
        setAvatarPreview(user.avatar);

      } catch (error) {
        console.error("Lỗi khi lấy thông tin user:", error);
        alert("Không thể tải thông tin người dùng!");
        navigate('/admin/users'); 
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserData();
  }, [userId, navigate]);

  // 2. XỬ LÝ ĐỔI TEXT
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'role') {
      setFormData({ ...formData, roles: [value] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // 3. XỬ LÝ ĐỔI ẢNH (Hiện Preview ngay lập tức)
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); // Tạo link tạm để user xem trước ảnh mới
    }
  };

  // 4. BẤM LƯU
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Gọi API cập nhật Info
      await updateUserInfoAdmin(userId, formData);

      // Nếu có chọn file ảnh mới thì mới gọi API upload avatar
      if (avatarFile) {
        await updateAvatarAdmin(userId, avatarFile);
      }

      alert("Cập nhật thành công!");
      navigate('/admin/users'); 

    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      alert("Cập nhật thất bại, vui lòng kiểm tra lại!");
    } finally {
      setIsSaving(false);
    }
  };

  if (isFetching) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <CSpinner color="primary" /> <span className="ms-3">Đang tải thông tin người dùng...</span>
      </div>
    );
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>Chi tiết tài khoản: {formData.username}</strong>
      </CCardHeader>
      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          
          <CRow className="mb-4 text-center">
            <CCol>
              <div className="mb-3">
                <CAvatar 
                    src={avatarPreview || 'https://via.placeholder.com/150'} 
                    size="xl" 
                    style={{ width: '120px', height: '120px', objectFit: 'cover' }} 
                />
              </div>
              <CFormLabel className="btn btn-outline-primary btn-sm" style={{ cursor: 'pointer' }}>
                Đổi ảnh đại diện
                <CFormInput 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  hidden // Giấu nút chọn file xấu xí đi
                />
              </CFormLabel>
            </CCol>
          </CRow>

          <CRow>
            <CCol md={6} className="mb-3">
              <CFormLabel>Tên đăng nhập</CFormLabel>
              <CFormInput name="username" value={formData.username} onChange={handleChange} disabled />
            </CCol>
            <CCol md={6} className="mb-3">
              <CFormLabel>Vai trò</CFormLabel>
              <CFormSelect name="role" value={formData.roles[0]} onChange={handleChange}>
                <option value="USER">Người dùng (USER)</option>
                <option value="ADMIN">Quản trị viên (ADMIN)</option>
              </CFormSelect>
            </CCol>
          </CRow>

          <CRow>
            <CCol md={6} className="mb-3">
              <CFormLabel>Họ và tên</CFormLabel>
              <CFormInput name="fullName" value={formData.fullName} onChange={handleChange} />
            </CCol>
            <CCol md={6} className="mb-3">
              <CFormLabel>Số điện thoại</CFormLabel>
              <CFormInput name="phone" value={formData.phone} onChange={handleChange} />
            </CCol>
          </CRow>

          <CRow>
            <CCol md={6} className="mb-3">
              <CFormLabel>Email</CFormLabel>
              <CFormInput type="email" name="email" value={formData.email} onChange={handleChange} />
            </CCol>
            <CCol md={6} className="mb-4">
              <CFormLabel>Ngày sinh</CFormLabel>
              <CFormInput type="date" name="dob" value={formData.dob} onChange={handleChange} />
            </CCol>
          </CRow>

          <hr />
          
          <div className="d-flex gap-2 justify-content-end">
            <CButton color="secondary" variant="ghost" onClick={() => navigate('/admin/users')}>
              Hủy bỏ
            </CButton>
            <CButton type="submit" color="primary" disabled={isSaving}>
              {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </CButton>
          </div>

        </CForm>
      </CCardBody>
    </CCard>
  );
};

export default UserEditPage;