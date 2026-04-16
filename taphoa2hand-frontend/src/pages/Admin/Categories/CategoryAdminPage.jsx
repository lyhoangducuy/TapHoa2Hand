import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './CategoryAdminPage.module.scss'; // Đổi tên file scss nếu cần
import { 
  CCard, CCardBody, CCardHeader, CButton, CFormInput, 
  CInputGroup, CInputGroupText, CPagination, CPaginationItem 
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilPlus } from '@coreui/icons';

import CategoryTable from './CategoryTable/CategoryTable'; // Import CategoryTable
// Giả định bạn có service này, hãy đổi lại theo tên thực tế trong project của bạn
import { adminGetAllCategories } from '../../../services/categoryService'; 

const cx = classNames.bind(styles);

function CategoryAdminPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); 
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategories(currentPage);
  }, [currentPage]);

  const fetchCategories = async (page) => {
    try {
      // Giả định API phân trang (page, size)
      const response = await adminGetAllCategories(page, 10); 
      if (response && response.code === 1000) {
        // Cập nhật state dựa trên response từ Spring Boot
        setCategories(response.result.content || response.result || []); 
        setTotalPages(response.result.totalPages || 1);
      }
    } catch (error) {
      console.error("Lỗi fetch categories:", error);
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
        <h3 className="fw-bold m-0">Quản lý danh mục</h3>
        {/* Điều hướng tới trang thêm mới danh mục */}
        <CButton color="primary" onClick={() => navigate('/admin/categories/create')}>
          <CIcon icon={cilPlus} className="me-2"/> Thêm danh mục
        </CButton>
      </div>

      <CCard className="mb-4 shadow-sm border-0">
        <CCardHeader className="bg-white py-3">
          <CInputGroup className="w-50">
            <CInputGroupText><CIcon icon={cilSearch} /></CInputGroupText>
            <CFormInput placeholder="Tìm kiếm danh mục..." />
          </CInputGroup>
        </CCardHeader>
        <CCardBody>
          {/* Truyền categories và hàm onRefresh xuống table */}
          <CategoryTable categories={categories} onRefresh={() => fetchCategories(currentPage)} />
          
          {totalPages > 0 && (
            <div className="d-flex justify-content-end mt-4">
              <CPagination>
                <CPaginationItem 
                  disabled={currentPage === 0} 
                  onClick={() => setCurrentPage(currentPage - 1)}
                  style={{ cursor: currentPage === 0 ? 'not-allowed' : 'pointer' }}
                >
                  Trước
                </CPaginationItem>
                {renderPaginationItems()}
                <CPaginationItem 
                  disabled={currentPage === totalPages - 1} 
                  onClick={() => setCurrentPage(currentPage + 1)}
                  style={{ cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer' }}
                >
                  Sau
                </CPaginationItem>
              </CPagination>
            </div>
          )}
        </CCardBody>
      </CCard>
    </div>
  );
}

export default CategoryAdminPage;