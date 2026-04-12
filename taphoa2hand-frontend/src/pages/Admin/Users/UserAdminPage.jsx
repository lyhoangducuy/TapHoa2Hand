import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './UserAdminPage.module.scss';
import { 
  CCard, CCardBody, CCardHeader, CButton, CFormInput, 
  CInputGroup, CInputGroupText, CPagination, CPaginationItem 
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilUserPlus } from '@coreui/icons';

import UserTable from './UserTable/UserTable';
import UserModalForm from './UserModalForm/UserModalForm';
import { getUserAdmin } from '../../../services/userService';

const cx = classNames.bind(styles);

function UserAdminPage() {
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(0); 
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const fetchUsers = async (page) => {
    try {
      const response = await getUserAdmin(page, 10); // Lấy size mặc định là 10
      if (response && response.code === 1000) {
        // Spring Boot Page trả về dữ liệu trong "content"
        setUsers(response.result.content || []); 
        setTotalPages(response.result.totalPages || 1);
      }
    } catch (error) {
      console.error("Lỗi fetch users:", error);
    }
  };

  const renderPaginationItems = () => {
    let items = [];
    for (let i = 0; i < totalPages; i++) {
      items.push(
        <CPaginationItem 
          key={i} active={i === currentPage} 
          onClick={() => setCurrentPage(i)}
          style={{ cursor: 'pointer' }}
        >
          {i + 1}
        </CPaginationItem>
      );
    }
    return items;
  };

  return (
    <div className={cx('user-page')}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold m-0">Quản lý người dùng</h3>
        <CButton color="primary" onClick={() => setModalVisible(true)}>
          <CIcon icon={cilUserPlus} className="me-2"/> Thêm người dùng
        </CButton>
      </div>

      <CCard className="mb-4 shadow-sm border-0">
        <CCardHeader className="bg-white py-3">
          <CInputGroup className="w-50">
            <CInputGroupText><CIcon icon={cilSearch} /></CInputGroupText>
            <CFormInput placeholder="Tìm kiếm theo username..." />
          </CInputGroup>
        </CCardHeader>
        <CCardBody>
          <UserTable users={users} />
          
          {totalPages > 1 && (
            <div className="d-flex justify-content-end mt-4">
              <CPagination>
                <CPaginationItem 
                  disabled={currentPage === 0} 
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Trước
                </CPaginationItem>
                {renderPaginationItems()}
                <CPaginationItem 
                  disabled={currentPage === totalPages - 1} 
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Sau
                </CPaginationItem>
              </CPagination>
            </div>
          )}
        </CCardBody>
      </CCard>

      <UserModalForm 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSubmit={() => { setModalVisible(false); fetchUsers(0); }} 
      />
    </div>
  );
}

export default UserAdminPage;