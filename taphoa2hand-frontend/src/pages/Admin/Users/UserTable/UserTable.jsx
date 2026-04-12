import React from 'react';
import { 
  CTable, CTableHead, CTableRow, CTableHeaderCell, 
  CTableBody, CTableDataCell, CButton, CBadge 
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash, cilBan } from '@coreui/icons';

const UserTable = ({ users }) => {
  // Hàm chọn màu badge
  const getBadgeColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Banned': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <CTable hover responsive align="middle" className="mb-0 border">
      <CTableHead color="light">
        <CTableRow>
          <CTableHeaderCell className="text-center">ID</CTableHeaderCell>
          <CTableHeaderCell>Người dùng</CTableHeaderCell>
          <CTableHeaderCell className="text-center">Vai trò</CTableHeaderCell>
          <CTableHeaderCell className="text-center">Trạng thái</CTableHeaderCell>
          <CTableHeaderCell className="text-center">Hành động</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {users.map((user) => (
          <CTableRow key={user.id}>
            <CTableDataCell className="text-center text-muted">#{user.id}</CTableDataCell>
            
            <CTableDataCell>
              <div className="d-flex align-items-center gap-3">
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#ffeced', color: '#ff6b6b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {user.avatar}
                </div>
                <div>
                  <div className="fw-semibold text-dark">{user.name}</div>
                  <div className="small text-muted">{user.email}</div>
                </div>
              </div>
            </CTableDataCell>

            <CTableDataCell className="text-center">
              <span className="fw-medium text-secondary">{user.role}</span>
            </CTableDataCell>

            <CTableDataCell className="text-center">
              <CBadge color={getBadgeColor(user.status)} shape="rounded-pill">
                {user.status === 'Active' ? 'Hoạt động' : 'Bị khóa'}
              </CBadge>
            </CTableDataCell>

            <CTableDataCell className="text-center">
              <div className="d-flex justify-content-center gap-2">
                <CButton color="info" variant="ghost" size="sm" title="Chỉnh sửa">
                  <CIcon icon={cilPencil} />
                </CButton>
                <CButton color="warning" variant="ghost" size="sm" title="Khóa tài khoản">
                  <CIcon icon={cilBan} />
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