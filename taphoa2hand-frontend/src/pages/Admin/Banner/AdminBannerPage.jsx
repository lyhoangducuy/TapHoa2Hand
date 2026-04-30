import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './AdminBannerPage.module.scss';
import { 
  CCard, CCardBody, CCardHeader, CButton, CFormInput, 
  CInputGroup, CInputGroupText, CModal, CModalHeader, 
  CModalTitle, CModalBody, CModalFooter, CForm, CFormLabel,
  CFormSelect, CSpinner
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilPlus, cilPencil, cilTrash, cilImage } from '@coreui/icons';

import { getAllBanners, createBanner, updateBanner, deleteBanner } from '../../../services/bannerService';

const cx = classNames.bind(styles);

function AdminBannerPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [visible, setVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    targetUrl: '',
    sortOrder: 0,
    isActive: true,
    startDate: '',
    endDate: ''
  });
  
  // File state
  const [desktopFile, setDesktopFile] = useState(null);
  const [mobileFile, setMobileFile] = useState(null);
  const [desktopPreview, setDesktopPreview] = useState('');
  const [mobilePreview, setMobilePreview] = useState('');

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await getAllBanners();
      if (response && response.code === 1000) {
        setBanners(response.result || []);
      }
    } catch (error) {
      console.error("Lỗi fetch banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleOpenCreate = () => {
    setIsEdit(false);
    setCurrentBanner(null);
    setFormData({
      title: '',
      targetUrl: '',
      sortOrder: 0,
      isActive: true,
      startDate: '',
      endDate: ''
    });
    setDesktopFile(null);
    setMobileFile(null);
    setDesktopPreview('');
    setMobilePreview('');
    setVisible(true);
  };

  const handleOpenEdit = (banner) => {
    setIsEdit(true);
    setCurrentBanner(banner);
    setFormData({
      title: banner.title || '',
      targetUrl: banner.targetUrl || '',
      sortOrder: banner.sortOrder || 0,
      isActive: banner.isActive ?? true,
      startDate: banner.startDate ? banner.startDate.slice(0, 16) : '',
      endDate: banner.endDate ? banner.endDate.slice(0, 16) : ''
    });
    setDesktopFile(null);
    setMobileFile(null);
    setDesktopPreview(banner.imageDesktop || '');
    setMobilePreview(banner.imageMobile || '');
    setVisible(true);
  };

  const handleSubmit = async () => {
    try {
      let response;
      if (isEdit && currentBanner) {
        response = await updateBanner(currentBanner.id, formData);
      } else {
        response = await createBanner(formData, desktopFile, mobileFile);
      }
      
      if (response && response.code === 1000) {
        setVisible(false);
        fetchBanners();
      } else {
        alert(response?.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error("Lỗi submit banner:", error);
      alert('Có lỗi xảy ra khi lưu banner');
    }
  };

  const handleDelete = async (bannerId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa banner này?')) {
      try {
        const response = await deleteBanner(bannerId);
        if (response && response.code === 1000) {
          fetchBanners();
        } else {
          alert(response?.message || 'Có lỗi xảy ra');
        }
      } catch (error) {
        console.error("Lỗi delete banner:", error);
        alert('Có lỗi xảy ra khi xóa banner');
      }
    }
  };

  const filteredBanners = banners.filter(banner => 
    banner.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={cx('banner-page')}>
      <div className={cx('header')}>
        <h3 className={cx('title')}>Quản lý Banner</h3>
        <CButton color="primary" onClick={handleOpenCreate}>
          <CIcon icon={cilPlus} className="me-2" /> Thêm Banner
        </CButton>
      </div>

      <CCard className={cx('card')}>
        <CCardHeader className={cx('card-header')}>
          <CInputGroup className={cx('search-box')}>
            <CInputGroupText><CIcon icon={cilSearch} /></CInputGroupText>
            <CFormInput 
              placeholder="Tìm kiếm theo tiêu đề..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CInputGroup>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="text-center py-5">
              <CSpinner />
            </div>
          ) : (
            <table className={cx('banner-table')}>
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th style={{ width: '100px' }}>Hình ảnh</th>
                  <th>Tiêu đề</th>
                  <th style={{ width: '100px' }}>Thứ tự</th>
                  <th style={{ width: '100px' }}>Trạng thái</th>
                  <th style={{ width: '150px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredBanners.length > 0 ? (
                  filteredBanners.map((banner, index) => (
                    <tr key={banner.id}>
                      <td>{index + 1}</td>
                      <td>
                        {banner.imageDesktop ? (
                          <img 
                            src={banner.imageDesktop} 
                            alt={banner.title}
                            className={cx('banner-image')}
                          />
                        ) : (
                          <CIcon icon={cilImage} size="xl" className="text-muted" />
                        )}
                      </td>
                      <td>{banner.title}</td>
                      <td>{banner.sortOrder}</td>
                      <td>
                        <span className={banner.isActive ? cx('status-active') : cx('status-inactive')}>
                          {banner.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </td>
                      <td>
                        <div className={cx('action-buttons')}>
                          <CButton 
                            color="info" 
                            size="sm" 
                            onClick={() => handleOpenEdit(banner)}
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton 
                            color="danger" 
                            size="sm" 
                            onClick={() => handleDelete(banner.id)}
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      Không có banner nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </CCardBody>
      </CCard>

      {/* Create/Edit Modal */}
      <CModal visible={visible} onClose={() => setVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>{isEdit ? 'Sửa Banner' : 'Thêm Banner'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="row">
              <div className="col-md-6">
                <div className={cx('form-group')}>
                  <CFormLabel>Tiêu đề</CFormLabel>
                  <CFormInput
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Nhập tiêu đề banner"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className={cx('form-group')}>
                  <CFormLabel>Thứ tự hiển thị</CFormLabel>
                  <CFormInput
                    name="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className={cx('form-group')}>
                  <CFormLabel>Hình ảnh Desktop</CFormLabel>
                  <CFormInput
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setDesktopFile, setDesktopPreview)}
                  />
                  {(desktopPreview || formData.imageDesktop) && (
                    <img 
                      src={desktopPreview || formData.imageDesktop} 
                      alt="Desktop preview" 
                      className={cx('image-preview')}
                    />
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <div className={cx('form-group')}>
                  <CFormLabel>Hình ảnh Mobile</CFormLabel>
                  <CFormInput
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setMobileFile, setMobilePreview)}
                  />
                  {(mobilePreview || formData.imageMobile) && (
                    <img 
                      src={mobilePreview || formData.imageMobile} 
                      alt="Mobile preview" 
                      className={cx('image-preview')}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className={cx('form-group')}>
                  <CFormLabel>Link đích</CFormLabel>
                  <CFormInput
                    name="targetUrl"
                    value={formData.targetUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className={cx('form-group')}>
                  <CFormLabel>Trạng thái</CFormLabel>
                  <CFormSelect
                    name="isActive"
                    value={formData.isActive}
                    onChange={handleInputChange}
                    options={[
                      { value: true, label: 'Hoạt động' },
                      { value: false, label: 'Không hoạt động' }
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className={cx('form-group')}>
                  <CFormLabel>Ngày bắt đầu</CFormLabel>
                  <CFormInput
                    name="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className={cx('form-group')}>
                  <CFormLabel>Ngày kết thúc</CFormLabel>
                  <CFormInput
                    name="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Hủy
          </CButton>
          <CButton color="primary" onClick={handleSubmit}>
            {isEdit ? 'Cập nhật' : 'Thêm mới'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
}

export default AdminBannerPage;