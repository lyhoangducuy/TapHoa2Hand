import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './UserAdminPage.module.scss';
import { 
  CCard, CCardBody, CCardHeader, CButton, CFormInput, 
  CInputGroup, CInputGroupText, CPagination, CPaginationItem 
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilUserPlus } from '@coreui/icons';

// Import các component con
import UserTable from './UserTable/UserTable';
import UserModalForm from './UserModalForm/UserModalForm';

const cx = classNames.bind(styles);

const mockUsers = [
  { id: 1, name: 'Nguyễn Văn A', email: 'vana@gmail.com', role: 'Admin', status: 'Active', avatar: 'A' },
  { id: 2, name: 'Trần Thị B', email: 'tranb@yahoo.com', role: 'User', status: 'Active', avatar: 'B' },
];

function UserAdminPage() {
  const [users, setUsers] = useState(mockUsers);
  const [modalVisible, setModalVisible] = useState(false);

  // Logic: Nhận dữ liệu từ Modal gửi lên và thêm vào danh sách
  const handleAddUser = (newUserData) => {
    const newUser = {
      id: users.length + 1, // Tự tăng ID
      name: newUserData.name,
      email: newUserData.email,
      role: newUserData.role,
      status: 'Active',
      avatar: newUserData.name.charAt(0).toUpperCase() // Lấy chữ cái đầu làm Avatar
    };

    setUsers([...users, newUser]); // Cập nhật lại state danh sách user
    setModalVisible(false); // Đóng modal
  };

  return (
    <div className={cx('user-page')}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold m-0" style={{ color: '#334155' }}>Quản lý người dùng</h3>
        <CButton color="primary" className="d-flex align-items-center gap-2" onClick={() => setModalVisible(true)}>
          <CIcon icon={cilUserPlus} /> Thêm người dùng
        </CButton>
      </div>

      <CCard className="mb-4 shadow-sm border-0">
        <CCardHeader className="bg-white py-3">
          <CInputGroup className="w-50">
            <CInputGroupText className="bg-white text-muted"><CIcon icon={cilSearch} /></CInputGroupText>
            <CFormInput placeholder="Tìm kiếm theo tên hoặc email..." />
          </CInputGroup>
        </CCardHeader>

        <CCardBody>
          {/* Nhúng Component Bảng và truyền danh sách users xuống */}
          <UserTable users={users} />

          <div className="d-flex justify-content-end mt-4">
            <CPagination>
              <CPaginationItem disabled>Trước</CPaginationItem>
              <CPaginationItem active>1</CPaginationItem>
              <CPaginationItem>Sau</CPaginationItem>
            </CPagination>
          </div>
        </CCardBody>
      </CCard>

      {/* Nhúng Component Modal Form */}
      <UserModalForm 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSubmit={handleAddUser} 
      />
    </div>
  );
}

export default UserAdminPage;