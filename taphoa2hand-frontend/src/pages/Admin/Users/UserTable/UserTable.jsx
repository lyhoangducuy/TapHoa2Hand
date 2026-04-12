// src/components/UserTable.jsx
import React, { useState } from 'react'; // 1. Bổ sung useState
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CButton, CAvatar
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash } from '@coreui/icons';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../../../components/Popup/ConfirmModal';
import { deleteUser } from '../../../../services/userService';

const UserTable = ({ users,  onRefresh}) => {
  const navigate = useNavigate();

  // 3. Khai báo state cho Popup
  const [modalVisible, setModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const handleEdit = (userId) => {
    navigate(`/admin/users/detail/${userId}`);
  };

  // 4. Hàm mở popup khi bấm icon Thùng rác
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setModalVisible(true);
  };

  // 5. Hàm gọi API xóa khi bấm "Xác nhận" trong popup
  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        // Đợi API xóa xong
        await deleteUser(userToDelete.id); 
        
        // 3. Gọi hàm onRefresh để báo Component cha tải lại dữ liệu
        if (onRefresh) {
            onRefresh(); 
        }
        
      } catch (error) {
        console.error("Lỗi khi xóa:", error);
        alert("Xóa thất bại!");
      }
    }
    setModalVisible(false); // Đóng popup
    setUserToDelete(null);  // Xóa data tạm
  };

  return (
    // 6. Phải bọc tất cả bằng cặp thẻ Fragment <> </>
    <>
      <CTable hover responsive align="middle" className="mb-0 border">
        <CTableHead color="light">
          <CTableRow>
            <CTableHeaderCell className="text-center" style={{ width: '150px' }}>ID</CTableHeaderCell>
            <CTableHeaderCell>Tên tài khoản</CTableHeaderCell>
            <CTableHeaderCell className="text-center">Vai trò</CTableHeaderCell>
            <CTableHeaderCell className="text-center">Hành động</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {users && users.map((user) => (
            <CTableRow key={user.id}>
              <CTableDataCell className="text-center text-muted">
                <span title={user.id}>#{user.id ? user.id.substring(0, 8) : 'N/A'}</span>
              </CTableDataCell>

              <CTableDataCell>
                <div className="d-flex align-items-center gap-3">
                  <CAvatar color="primary" textColor="white">
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </CAvatar>
                  <div className="fw-semibold text-dark">{user.username}</div>
                </div>
              </CTableDataCell>

              <CTableDataCell className="text-center">
                <span className="fw-medium text-secondary">
                  {user.roles && user.roles.length > 0
                    ? user.roles.map(role => role.description).join(', ')
                    : 'N/A'}
                </span>
              </CTableDataCell>

              <CTableDataCell className="text-center">
                <div className="d-flex justify-content-center gap-2">
                  
                  <CButton color="info" variant="ghost" size="sm" title="Chỉnh sửa"
                    onClick={() => handleEdit(user.id)}
                  >
                    <CIcon icon={cilPencil} />
                  </CButton>

                  {/* 7. Thay đổi sự kiện onClick ở đây */}
                  <CButton color="danger" variant="ghost" size="sm" title="Xóa"
                    onClick={() => handleDeleteClick(user)}
                  >
                    <CIcon icon={cilTrash} />
                  </CButton>
                </div>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      {/* 8. Đặt Component Modal ở dưới cùng */}
      <ConfirmModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa tài khoản"
        content={
          <span>
            Bạn có chắc chắn muốn xóa tài khoản <strong className="text-danger">{userToDelete?.username}</strong> không?
            <br />
            <small className="text-muted">Hành động này không thể hoàn tác.</small>
          </span>
        }
      />
    </>
  );
};

export default UserTable;