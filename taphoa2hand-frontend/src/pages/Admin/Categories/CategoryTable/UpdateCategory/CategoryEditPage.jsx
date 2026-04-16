import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CCard, CCardBody, CCardHeader, CForm, CFormLabel, 
  CFormInput, CButton, CSpinner, CRow, CCol 
} from '@coreui/react';

// Import đúng service của Category
import { adminGetCategoryDetail, adminUpdateCategory } from '../../../../../services/categoryService'; 

const CategoryEditPage = () => {
  const { categoryId } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();

  // State lưu thông tin text của danh mục
  const [formData, setFormData] = useState({
    name: '',
  });

  // State phụ để hiển thị thông tin chỉ đọc (Read-only)
  const [createdAt, setCreatedAt] = useState('');
  
  const [isFetching, setIsFetching] = useState(true); 
  const [isSaving, setIsSaving] = useState(false);    

  // 1. GỌI API LẤY DATA DANH MỤC
  useEffect(() => {
    const fetchCategoryData = async () => {
      setIsFetching(true);
      try {
        const res = await adminGetCategoryDetail(categoryId);
        const category = res.result || res; // Tùy cấu trúc API trả về
        
        setFormData({
          name: category.name || '',
        });

        // Format lại ngày tạo để hiển thị cho đẹp
        if (category.createdAt) {
          const date = new Date(category.createdAt);
          setCreatedAt(date.toLocaleString('vi-VN'));
        }

      } catch (error) {
        console.error("Lỗi khi lấy thông tin danh mục:", error);
        alert("Không thể tải thông tin danh mục!");
        navigate('/admin/categories'); 
      } finally {
        setIsFetching(false);
      }
    };

    if (categoryId) fetchCategoryData();
  }, [categoryId, navigate]);

  // 2. XỬ LÝ ĐỔI TEXT
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 3. BẤM LƯU
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Gọi API cập nhật danh mục (Gửi kèm form text dạng JSON)
      await adminUpdateCategory(categoryId, formData);

      alert("Cập nhật danh mục thành công!");
      navigate('/admin/categories'); 

    } catch (error) {
      console.error("Lỗi cập nhật danh mục:", error);
      alert("Cập nhật thất bại, vui lòng kiểm tra lại!");
    } finally {
      setIsSaving(false);
    }
  };

  if (isFetching) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <CSpinner color="primary" /> <span className="ms-3">Đang tải thông tin danh mục...</span>
      </div>
    );
  }

  return (
    <CCard className="mb-4 shadow-sm border-0">
      <CCardHeader className="bg-white py-3">
        <h5 className="mb-0 fw-bold">Chi tiết danh mục: #{categoryId?.substring(0, 8)}</h5>
      </CCardHeader>
      
      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          
          <CRow>
            {/* Tên danh mục */}
            <CCol md={8} className="mb-4">
              <CFormLabel className="fw-semibold">Tên danh mục (*)</CFormLabel>
              <CFormInput 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                placeholder="Nhập tên danh mục..."
              />
            </CCol>

            {/* Ngày tạo (Read-only) */}
            <CCol md={4} className="mb-4">
              <CFormLabel className="fw-semibold">Ngày tạo</CFormLabel>
              <CFormInput 
                value={createdAt || 'N/A'} 
                disabled 
                className="bg-light"
              />
            </CCol>
          </CRow>

          <hr className="my-4" />
          
          <div className="d-flex gap-2 justify-content-end">
            <CButton color="secondary" variant="ghost" onClick={() => navigate('/admin/categories')}>
              Hủy bỏ
            </CButton>
            <CButton type="submit" color="primary" disabled={isSaving} className="px-4">
              {isSaving ? (
                <><CSpinner size="sm" className="me-2" /> Đang lưu...</>
              ) : (
                'Lưu thay đổi'
              )}
            </CButton>
          </div>

        </CForm>
      </CCardBody>
    </CCard>
  );
};

export default CategoryEditPage;