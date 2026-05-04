import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CCard, CCardBody, CCardHeader, CForm, CFormLabel, 
  CFormInput, CButton, CFormSelect, CSpinner, CRow, CCol, CImage, CFormTextarea
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilCloudUpload } from '@coreui/icons';

import { adminGetPostDetail, adminUpdatePost } from '../../../../../services/postService';
import { getAllCategories } from '../../../../../services/categoryService';

const PostEditPage = () => {
  const { postId } = useParams(); 
  const navigate = useNavigate();

  // State lưu danh sách categories và payment methods
  const [categories, setCategories] = useState([]);
  const paymentMethods = ['DIRECT', 'MIDDLEMAN', 'BANK_TRANSFER'];
  
  const mapStatusToName = (status) => {
    if (typeof status === 'object' && status !== null) {
      return status.name || 'AVAILABLE';
    }
    switch (status) {
      case 'Đang bán': return 'AVAILABLE';
      case 'Đã bán': return 'SOLD';
      case 'Đã ẩn': return 'HIDDEN';
      default: return status || 'AVAILABLE';
    }
  };

  // State lưu thông tin text của bài viết
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    postTypeName: 'SELL',
    status: 'AVAILABLE',
    content: '', // Giả định có trường content/mô tả
    listCategoriesId: [],
    listAcceptedPaymentMethodsValue: [],
    city: '',
    ward: '',
    postalAddress: '',
    condition: 'LIKE_NEW',
  });
  
  // State quản lý hình ảnh
  const [existingImages, setExistingImages] = useState([]); // Ảnh cũ từ server
  const [newImages, setNewImages] = useState([]);           // File ảnh mới chọn
  const [previewImages, setPreviewImages] = useState([]);   // Link URL tạm để preview ảnh mới
  
  const [isFetching, setIsFetching] = useState(true); 
  const [isSaving, setIsSaving] = useState(false);    

  // Load categories từ server
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategories();
        if (res && res.result) {
          setCategories(res.result);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  // 1. GỌI API LẤY DATA BÀI VIẾT
  useEffect(() => {
    const fetchPostData = async () => {
      setIsFetching(true);
      try {
        const res = await adminGetPostDetail(postId);
        const post = res.result || res; // Tùy cấu trúc API trả về
        
        const categoriesIds = post.categories && post.categories.length > 0 
          ? post.categories.map(cat => cat.id || cat)
          : [];
        
        const paymentMethods = post.acceptedPaymentMethods && post.acceptedPaymentMethods.length > 0
          ? post.acceptedPaymentMethods
          : [];
        
        setFormData({
          title: post.title || '',
          price: post.price || '',
          postTypeName: post.postType?.name || post.postType || 'SELL',
          status: mapStatusToName(post.status),
          content: post.postDetail?.description || '',
          listCategoriesId: categoriesIds,
          listAcceptedPaymentMethodsValue: paymentMethods,
          city: post.postAddress?.city || '',
          ward: post.postAddress?.ward || '',
          postalAddress: post.postAddress?.postalAddress || '',
          condition: post.postDetail?.condition || 'LIKE_NEW',
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

  // Xử lý chọn/bỏ chọn danh mục
  const handleCategoryChange = (categoryId) => {
    setFormData(prev => {
      const currentCategories = prev.listCategoriesId || [];
      if (currentCategories.includes(categoryId)) {
        return {
          ...prev,
          listCategoriesId: currentCategories.filter(id => id !== categoryId)
        };
      } else {
        return {
          ...prev,
          listCategoriesId: [...currentCategories, categoryId]
        };
      }
    });
  };

  // Xử lý chọn/bỏ chọn phương thức thanh toán
  const handlePaymentMethodChange = (method) => {
    setFormData(prev => {
      const currentMethods = prev.listAcceptedPaymentMethodsValue || [];
      if (currentMethods.includes(method)) {
        return {
          ...prev,
          listAcceptedPaymentMethodsValue: currentMethods.filter(m => m !== method)
        };
      } else {
        return {
          ...prev,
          listAcceptedPaymentMethodsValue: [...currentMethods, method]
        };
      }
    });
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
        price: Number(formData.price),
        postDetail: {
          description: formData.content,
          condition: formData.condition,
        },
        postAddress: {
          city: formData.city,
          ward: formData.ward,
          postalAddress: formData.postalAddress,
        }
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
                <option value="SOLD">Đã bán (SOLD)</option>
              </CFormSelect>
            </CCol>
            <CCol md={4} className="mb-3">
              <CFormLabel>Loại bài viết</CFormLabel>
              <CFormSelect name="postTypeName" value={formData.postTypeName} onChange={handleChange}>
                <option value="SELL">Tin rao bán</option>
                <option value="BUY">Tin cần mua</option>
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
            <CCol md={6} className="mb-3">
              <CFormLabel>Tình trạng sản phẩm</CFormLabel>
              <CFormSelect name="condition" value={formData.condition} onChange={handleChange}>
                <option value="LIKE_NEW">Như mới</option>
                <option value="GOOD">Tốt</option>
                <option value="FAIR">Bình thường</option>
                <option value="FOR_PARTS">Lấy linh kiện</option>
              </CFormSelect>
            </CCol>
          </CRow>

          <CRow>
            <CCol md={12} className="mb-3">
              <CFormLabel>Danh mục</CFormLabel>
              <div className="border rounded p-3" style={{ minHeight: '100px', backgroundColor: '#f8f9fa' }}>
                {categories && categories.length > 0 ? (
                  categories.map(cat => (
                    <div key={cat.id} className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`category-${cat.id}`}
                        checked={formData.listCategoriesId?.includes(cat.id) || false}
                        onChange={() => handleCategoryChange(cat.id)}
                      />
                      <label className="form-check-label" htmlFor={`category-${cat.id}`}>
                        {cat.name}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-muted small">Không có danh mục nào</p>
                )}
              </div>
            </CCol>
          </CRow>

          <CRow>
            <CCol md={12} className="mb-3">
              <CFormLabel>Phương thức thanh toán chấp nhận</CFormLabel>
              <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                {paymentMethods.map(method => (
                  <div key={method} className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`payment-${method}`}
                      checked={formData.listAcceptedPaymentMethodsValue?.includes(method) || false}
                      onChange={() => handlePaymentMethodChange(method)}
                    />
                    <label className="form-check-label" htmlFor={`payment-${method}`}>
                      {method === 'DIRECT' ? 'Giao dịch trực tiếp' : method === 'MIDDLEMAN' ? 'Giao dịch qua trung gian' : 'Chuyển khoản'}
                    </label>
                  </div>
                ))}
              </div>
            </CCol>
          </CRow>

          <CRow>
            <CCol md={12} className="mb-3">
              <CFormLabel>Mô tả chi tiết</CFormLabel>
              <CFormTextarea 
                name="content" 
                value={formData.content} 
                onChange={handleChange} 
                rows={4}
                placeholder="Nhập mô tả chi tiết sản phẩm..."
              />
            </CCol>
          </CRow>

          <CRow>
            <CCol md={6} className="mb-3">
              <CFormLabel>Thành phố/Tỉnh</CFormLabel>
              <CFormInput 
                name="city" 
                value={formData.city} 
                onChange={handleChange}
                placeholder="VD: Hà Nội"
              />
            </CCol>
            <CCol md={6} className="mb-3">
              <CFormLabel>Quận/Huyện</CFormLabel>
              <CFormInput 
                name="ward" 
                value={formData.ward} 
                onChange={handleChange}
                placeholder="VD: Hoàn Kiếm"
              />
            </CCol>
          </CRow>

          <CRow>
            <CCol md={12} className="mb-3">
              <CFormLabel>Địa chỉ chi tiết</CFormLabel>
              <CFormTextarea 
                name="postalAddress" 
                value={formData.postalAddress} 
                onChange={handleChange} 
                rows={2}
                placeholder="Nhập địa chỉ chi tiết..."
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