import React, { useState } from 'react';
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell, CButton
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash } from '@coreui/icons';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../../../components/Popup/ConfirmModal'; 
import { adminDeleteCategory } from '../../../../services/categoryService';

const CategoryTable = ({ categories, onRefresh }) => {
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const handleEdit = (categoryId) => {
    navigate(`/admin/categories/detail/${categoryId}`);
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
      try {
        await adminDeleteCategory(categoryToDelete.id); 
        if (onRefresh) onRefresh(); 
      } catch (error) {
        console.error("Lỗi khi xóa danh mục:", error);
        alert("Xóa danh mục thất bại!");
      }
    }
    setModalVisible(false);
    setCategoryToDelete(null);
  };

  // Format ngày tạo từ Spring Boot (VD: 2024-05-18T10:30:00 -> 18/05/2024)
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <>
      <CTable hover responsive align="middle" className="mb-0 border">
        <CTableHead color="light">
          <CTableRow>
            <CTableHeaderCell className="text-center" style={{ width: '80px' }}>ID</CTableHeaderCell>
            <CTableHeaderCell>Tên danh mục</CTableHeaderCell>
            <CTableHeaderCell className="text-center">Ngày tạo</CTableHeaderCell>
            <CTableHeaderCell className="text-center" style={{ width: '150px' }}>Hành động</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {categories && categories.length > 0 ? categories.map((category) => (
            <CTableRow key={category.id}>
              
              {/* Cột ID */}
              <CTableDataCell className="text-center text-muted">
                <span title={category.id}>#{category.id ? category.id.substring(0, 8) : 'N/A'}</span>
              </CTableDataCell>

              {/* Cột Tên danh mục */}
              <CTableDataCell>
                <div className="fw-semibold text-dark text-truncate" title={category.name}>
                  {category.name || 'Chưa có tên'}
                </div>
              </CTableDataCell>

              {/* Cột Ngày tạo */}
              <CTableDataCell className="text-center text-muted">
                {formatDate(category.createdAt)}
              </CTableDataCell>

              {/* Cột Hành động */}
              <CTableDataCell className="text-center">
                <div className="d-flex justify-content-center gap-2">
                  <CButton color="info" variant="ghost" size="sm" title="Chỉnh sửa"
                    onClick={() => handleEdit(category.id)}
                  >
                    <CIcon icon={cilPencil} />
                  </CButton>
                  <CButton color="danger" variant="ghost" size="sm" title="Xóa"
                    onClick={() => handleDeleteClick(category)}
                  >
                    <CIcon icon={cilTrash} />
                  </CButton>
                </div>
              </CTableDataCell>
            </CTableRow>
          )) : (
            <CTableRow>
              <CTableDataCell colSpan="4" className="text-center text-muted py-4">
                Không có dữ liệu danh mục nào.
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>

      <ConfirmModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa danh mục"
        content={
          <span>
            Bạn có chắc chắn muốn xóa danh mục <strong>"{categoryToDelete?.name}"</strong> không?
            <br />
            <small className="text-muted">Hành động này không thể hoàn tác.</small>
          </span>
        }
      />
    </>
  );
};

export default CategoryTable;