import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './PostAdminPage.module.scss'; // Bạn có thể đổi tên file scss sau nếu muốn
import { 
  CCard, CCardBody, CCardHeader, CButton, CFormInput, 
  CInputGroup, CInputGroupText, CPagination, CPaginationItem 
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilPlus } from '@coreui/icons'; // Đổi icon thành cilPlus cho hợp với bài viết

import PostTable from './PostTable/PostTable'; // Import PostTable
import { adminGetAllPosts } from '../../../services/postService'; // Gọi đúng service của post

const cx = classNames.bind(styles);

function PostAdminPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); 
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  const fetchPosts = async (page) => {
    try {
      const response = await adminGetAllPosts(page, 10); 
      if (response && response.code === 1000) {
        // Lấy danh sách bài viết từ Spring Boot Page
        setPosts(response.result.content || []); 
        setTotalPages(response.result.totalPages || 1);
      }
    } catch (error) {
      console.error("Lỗi fetch posts:", error);
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
        <h3 className="fw-bold m-0">Quản lý bài viết</h3>
        <CButton color="primary" onClick={() => navigate('/admin/posts/create')}>
          <CIcon icon={cilPlus} className="me-2"/> Thêm bài viết
        </CButton>
      </div>

      <CCard className="mb-4 shadow-sm border-0">
        <CCardHeader className="bg-white py-3">
          <CInputGroup className="w-50">
            <CInputGroupText><CIcon icon={cilSearch} /></CInputGroupText>
            <CFormInput placeholder="Tìm kiếm bài viết..." />
          </CInputGroup>
        </CCardHeader>
        <CCardBody>
          {/* Truyền posts và hàm onRefresh xuống table */}
          <PostTable posts={posts} onRefresh={() => fetchPosts(currentPage)} />
          
          {totalPages > 0 && (
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
    </div>
  );
}

export default PostAdminPage;