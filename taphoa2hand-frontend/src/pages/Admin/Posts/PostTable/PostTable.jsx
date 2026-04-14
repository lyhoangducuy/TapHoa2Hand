import React, { useState } from 'react';
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CButton, CBadge, CImage
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash } from '@coreui/icons';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../../../components/Popup/ConfirmModal'; 
import { adminDeletePost } from '../../../../services/postService';

const PostTable = ({ posts, onRefresh }) => {
  const navigate = useNavigate();

  const [modalVisible, setModalVisible] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  const handleEdit = (postId) => {
    navigate(`/admin/posts/detail/${postId}`);
  };

  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (postToDelete) {
      try {
        await adminDeletePost(postToDelete.id); 
        if (onRefresh) onRefresh(); 
      } catch (error) {
        console.error("Lỗi khi xóa bài viết:", error);
        alert("Xóa bài viết thất bại!");
      }
    }
    setModalVisible(false);
    setPostToDelete(null);
  };

  // Hàm format giá tiền VNĐ
  const formatPrice = (price) => {
    if (price == null) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Hàm lấy hình ảnh thumbnail (ưu tiên isThumbnail = true, nếu không lấy ảnh đầu tiên)
  const getThumbnailUrl = (images) => {
    if (!images || images.length === 0) return 'https://via.placeholder.com/60x60?text=No+Image';
    const thumbnail = images.find(img => img.isThumbnail);
    return thumbnail ? thumbnail.imageUrl : images[0].imageUrl;
  };

  // Hàm hiển thị badge trạng thái
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return <CBadge color="success" shape="rounded-pill">Hiển thị</CBadge>;
      case 'HIDDEN':
        return <CBadge color="secondary" shape="rounded-pill">Đã ẩn</CBadge>;
      default:
        return <CBadge color="warning" shape="rounded-pill">{status}</CBadge>;
    }
  };

  return (
    <>
      <CTable hover responsive align="middle" className="mb-0 border">
        <CTableHead color="light">
          <CTableRow>
            <CTableHeaderCell className="text-center" style={{ width: '100px' }}>ID</CTableHeaderCell>
            <CTableHeaderCell className="text-center" style={{ width: '100px' }}>Hình ảnh</CTableHeaderCell>
            <CTableHeaderCell>Tiêu đề</CTableHeaderCell>
            <CTableHeaderCell>Giá bán</CTableHeaderCell>
            <CTableHeaderCell className="text-center">Trạng thái</CTableHeaderCell>
            <CTableHeaderCell className="text-center">Ngày đăng</CTableHeaderCell>
            <CTableHeaderCell className="text-center">Hành động</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {posts && posts.map((post) => (
            <CTableRow key={post.id}>
              
              {/* Cột ID */}
              <CTableDataCell className="text-center text-muted">
                <span title={post.id}>#{post.id ? post.id.toString().substring(0, 8) : 'N/A'}</span>
              </CTableDataCell>

              {/* Cột Hình ảnh */}
              <CTableDataCell className="text-center">
                <CImage 
                  src={getThumbnailUrl(post.postImages)} 
                  alt={post.title}
                  width={60} 
                  height={60} 
                  className="rounded border object-fit-cover"
                />
              </CTableDataCell>

              {/* Cột Tiêu đề */}
              <CTableDataCell>
                <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '200px' }} title={post.title}>
                  {post.title || 'Không có tiêu đề'}
                </div>
              </CTableDataCell>

              {/* Cột Giá bán */}
              <CTableDataCell className="fw-bold text-danger">
                {formatPrice(post.price)}
              </CTableDataCell>

              {/* Cột Trạng thái */}
              <CTableDataCell className="text-center">
                {renderStatusBadge(post.status)}
              </CTableDataCell>

              {/* Cột Ngày đăng */}
              <CTableDataCell className="text-center text-muted small">
                {post.createdAt}
              </CTableDataCell>

              {/* Cột Hành động */}
              <CTableDataCell className="text-center">
                <div className="d-flex justify-content-center gap-2">
                  <CButton color="info" variant="ghost" size="sm" title="Chỉnh sửa"
                    onClick={() => handleEdit(post.id)}
                  >
                    <CIcon icon={cilPencil} />
                  </CButton>

                  <CButton color="danger" variant="ghost" size="sm" title="Xóa"
                    onClick={() => handleDeleteClick(post)}
                  >
                    <CIcon icon={cilTrash} />
                  </CButton>
                </div>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <ConfirmModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa bài viết"
        content={
          <span>
            Bạn có chắc chắn muốn xóa bài viết <strong>"{postToDelete?.title}"</strong> (ID: <strong className="text-danger">#{postToDelete?.id?.toString().substring(0, 8)}</strong>) không?
            <br />
            <small className="text-muted">Hành động này không thể hoàn tác.</small>
          </span>
        }
      />
    </>
  );
};

export default PostTable;