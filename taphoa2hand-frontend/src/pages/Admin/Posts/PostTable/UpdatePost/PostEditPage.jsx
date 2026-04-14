// src/pages/PostEditPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CCard, CCardBody, CCardHeader, CForm, CFormLabel, 
  CFormInput, CButton, CFormSelect, CSpinner, CRow, CCol, CImage, CFormTextarea
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilCloudUpload } from '@coreui/icons';

// Import đúng service của bạn
import { adminGetPostDetail, adminUpdatePost } from '../../../../../services/postService'; 

const PostEditPage = () => {
  const { postId } = useParams(); 
  const navigate = useNavigate();

  // State lưu thông tin text của bài viết
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    status: 'AVAILABLE',
    content: '', // Giả định có trường content/mô tả
  });
  
  // State quản lý hình ảnh
  const [existingImages, setExistingImages] = useState([]); // Ảnh cũ từ server
  const [newImages, setNewImages] = useState([]);           // File ảnh mới chọn
  const [previewImages, setPreviewImages] = useState([]);   // Link URL tạm để preview ảnh mới
  
  const [isFetching, setIsFetching] = useState(true); 
  const [isSaving, setIsSaving] = useState(false);    

  // 1. GỌI API LẤY DATA BÀI VIẾT
  useEffect(() => {
    const fetchPostData = async () => {
      setIsFetching(true);
      try {
        const res = await adminGetPostDetail(postId);
        const post = res.result || res; // Tùy cấu trúc API trả về
        
        setFormData({
          title: post.title || '',
          price: post.price || '',
          status: post.status || 'AVAILABLE',
          content: post.content || '',
        });
        
        // Lưu mảng ảnh cũ để hiển thị
        if (post.postImages && post.postImages.length > 0) {
            setExistingImages(post.postImages.sort((a, b) => a.sortOrder - b.sortOrder));
        }

      } catch (error) {
        console.error("Lỗi khi lấy thông tin bài viết:", error);
        alert("Không thể tải thông tin bài viết!");
        navigate('/admin/posts'); 
      } finally {
        setIsFetching(false);
      }
    };

    fetchPostData();
  }, [postId, navigate]);

  // 2. XỬ LÝ ĐỔI TEXT
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 3. XỬ LÝ CHỌN NHIỀU ẢNH MỚI
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setNewImages(filesArray);
      
      // Tạo link tạm để preview ảnh mới
      const previews = filesArray.map(file => URL.createObjectURL(file));
      setPreviewImages(previews);
    }
  };

  // 4. BẤM LƯU
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Gọi API cập nhật bài viết (Gửi kèm form text và mảng file ảnh)
      // Lưu ý: Đảm bảo price được ép về kiểu số nếu Backend yêu cầu
      const postDataToSubmit = {
        ...formData,
        price: Number(formData.price)
      };

      await adminUpdatePost(postId, postDataToSubmit, newImages);

      alert("Cập nhật bài viết thành công!");
      navigate('/admin/posts'); 

    } catch (error) {
      console.error("Lỗi cập nhật bài viết:", error);
      alert("Cập nhật thất bại, vui lòng kiểm tra lại!");
    } finally {
      setIsSaving(false);
    }
  };

  if (isFetching) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <CSpinner color="primary" /> <span className="ms-3">Đang tải thông tin bài viết...</span>
      </div>
    );
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>Chi tiết bài viết: #{postId.substring(0, 8)}</strong>
      </CCardHeader>
      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          
          <CRow>
            <CCol md={8} className="mb-3">
              <CFormLabel>Tiêu đề bài đăng</CFormLabel>
              <CFormInput 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                required 
              />
            </CCol>
            <CCol md={4} className="mb-3">
              <CFormLabel>Trạng thái</CFormLabel>
              <CFormSelect name="status" value={formData.status} onChange={handleChange}>
                <option value="AVAILABLE">Hiển thị (AVAILABLE)</option>
                <option value="HIDDEN">Đã ẩn (HIDDEN)</option>
                {/* Có thể thêm các trạng thái khác như PENDING, SOLD tùy logic của bạn */}
              </CFormSelect>
            </CCol>
          </CRow>

          <CRow>
            <CCol md={6} className="mb-3">
              <CFormLabel>Giá bán (VNĐ)</CFormLabel>
              <CFormInput 
                type="number" 
                name="price" 
                value={formData.price} 
                onChange={handleChange} 
                required 
              />
            </CCol>
          </CRow>

          {/* Phần Hình ảnh */}
          <CRow className="mb-4 mt-3">
            <CCol>
              <CFormLabel className="fw-bold">Hình ảnh bài viết</CFormLabel>
              
              {/* Hiển thị ảnh cũ nếu không có ảnh mới được chọn */}
              {previewImages.length === 0 && existingImages.length > 0 && (
                <div className="d-flex flex-wrap gap-2 mb-3 p-3 bg-light rounded">
                  {existingImages.map((img, index) => (
                    <div key={index} className="position-relative">
                      <CImage 
                        src={img.imageUrl} 
                        className="rounded border object-fit-cover" 
                        width={100} height={100} 
                        alt="Post Image"
                      />
                      {img.isThumbnail && (
                         <span className="position-absolute bottom-0 start-0 w-100 bg-dark bg-opacity-50 text-white text-center" style={{fontSize: '11px'}}>Thumbnail</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Hiển thị ảnh mới preview */}
              {previewImages.length > 0 && (
                 <div className="d-flex flex-wrap gap-2 mb-3 p-3 border border-primary rounded">
                    <p className="w-100 text-primary small mb-1">Ảnh mới chuẩn bị tải lên (sẽ thay thế ảnh cũ):</p>
                    {previewImages.map((src, index) => (
                      <CImage 
                        key={index}
                        src={src} 
                        className="rounded border object-fit-cover shadow-sm" 
                        width={100} height={100} 
                        alt="New Post Image"
                      />
                    ))}
                 </div>
              )}

              {/* Nút Upload */}
              <div>
                  <CFormLabel className="btn btn-outline-primary btn-sm m-0" style={{ cursor: 'pointer' }}>
                    <CIcon icon={cilCloudUpload} className="me-2"/>
                    Chọn tải lên ảnh mới
                    <CFormInput 
                      type="file" 
                      accept="image/*"
                      multiple // Cho phép chọn nhiều ảnh
                      onChange={handleFileChange}
                      hidden 
                    />
                  </CFormLabel>
                  <CFormTextarea className="d-none" /> {/* Hack nhỏ giữ layout CoreUI */}
                  <span className="ms-3 small text-muted">Nếu chọn ảnh mới, toàn bộ ảnh cũ sẽ bị thay thế.</span>
              </div>
            </CCol>
          </CRow>

          <hr />
          
          <div className="d-flex gap-2 justify-content-end mt-4">
            <CButton color="secondary" variant="ghost" onClick={() => navigate('/admin/posts')}>
              Hủy bỏ
            </CButton>
            <CButton type="submit" color="primary" disabled={isSaving}>
              {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </CButton>
          </div>

        </CForm>
      </CCardBody>
    </CCard>
  );
};

export default PostEditPage;