import React from 'react';
import { 
  CTable, CTableHead, CTableRow, CTableHeaderCell, 
  CTableBody, CTableDataCell, CButton, CAvatar
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash } from '@coreui/icons';

const UserTable = ({ users }) => {
  return (
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
            {/* Hiển thị ID rút gọn */}
            <CTableDataCell className="text-center text-muted">
              <span title={user.id}>#{user.id ? user.id.substring(0, 8) : 'N/A'}</span>
            </CTableDataCell>
            
            <CTableDataCell>
              <div className="d-flex align-items-center gap-3">
                {/* Avatar dùng chữ cái đầu của username */}
                <CAvatar color="primary" textColor="white">
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </CAvatar>
                <div className="fw-semibold text-dark">{user.username}</div>
              </div>
            </CTableDataCell>

            <CTableDataCell className="text-center">
              <span className="fw-medium text-secondary">
                {user.role ? user.role.name : 'N/A'}
              </span>
            </CTableDataCell>

            <CTableDataCell className="text-center">
              <div className="d-flex justify-content-center gap-2">
                <CButton color="info" variant="ghost" size="sm" title="Chỉnh sửa">
                  <CIcon icon={cilPencil} />
                </CButton>
                <CButton color="danger" variant="ghost" size="sm" title="Xóa">
                  <CIcon icon={cilTrash} />
                </CButton>
              </div>
            </CTableDataCell>
          </CTableRow>
        ))}
      </CTableBody>
    </CTable>
  );
};

export default UserTable;