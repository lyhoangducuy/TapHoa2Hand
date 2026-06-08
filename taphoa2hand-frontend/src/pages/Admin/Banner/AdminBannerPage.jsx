import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './AdminBannerPage.module.scss';
import {
    CCard, CCardBody, CCardHeader,
    CButton, CFormInput, CInputGroup, CInputGroupText,
    CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
    CForm, CFormLabel, CFormSelect, CSpinner, CBadge,
    CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
    CImage,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilPlus, cilPencil, cilTrash, cilImage } from '@coreui/icons';
import { getAllBanners, createBanner, updateBanner, deleteBanner } from '../../../services/bannerService';

const cx = classNames.bind(styles);

const AdminBannerPage = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [visible, setVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentBanner, setCurrentBanner] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        targetUrl: '',
        sortOrder: 0,
        isActive: true,
        startDate: '',
        endDate: '',
    });

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
            console.error('Lỗi fetch banners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleFileChange = (e, setFile, setPreview) => {
        const file = e.target.files[0];
        if (file) {
            setFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            targetUrl: '',
            sortOrder: 0,
            isActive: true,
            startDate: '',
            endDate: '',
        });
        setDesktopFile(null);
        setMobileFile(null);
        setDesktopPreview('');
        setMobilePreview('');
    };

    const handleOpenCreate = () => {
        setIsEdit(false);
        setCurrentBanner(null);
        resetForm();
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
            endDate: banner.endDate ? banner.endDate.slice(0, 16) : '',
        });
        setDesktopFile(null);
        setMobileFile(null);
        setDesktopPreview(banner.imageDesktop || '');
        setMobilePreview(banner.imageMobile || '');
        setVisible(true);
    };

    const handleCloseModal = () => {
        setVisible(false);
        setIsEdit(false);
        setCurrentBanner(null);
        resetForm();
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            let response;
            if (isEdit && currentBanner) {
                response = await updateBanner(currentBanner.id, formData);
            } else {
                response = await createBanner(formData, desktopFile, mobileFile);
            }
            if (response && response.code === 1000) {
                handleCloseModal();
                fetchBanners();
            } else {
                alert(response?.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Lỗi submit banner:', error);
            alert('Có lỗi xảy ra khi lưu banner');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (bannerId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa banner này?')) return;
        try {
            const response = await deleteBanner(bannerId);
            if (response && response.code === 1000) {
                fetchBanners();
            } else {
                alert(response?.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Lỗi delete banner:', error);
            alert('Có lỗi xảy ra khi xóa banner');
        }
    };

    const filteredBanners = banners.filter(banner =>
        banner.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={cx('banner-page')}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0">Quản lý Banner</h3>
                <CButton color="primary" onClick={handleOpenCreate}>
                    <CIcon icon={cilPlus} className="me-2" /> Thêm Banner
                </CButton>
            </div>

            <CCard className="mb-4 shadow-sm border-0">
                <CCardHeader className="bg-white py-3">
                    <CInputGroup style={{ maxWidth: '400px' }}>
                        <CInputGroupText><CIcon icon={cilSearch} /></CInputGroupText>
                        <CFormInput
                            placeholder="Tìm kiếm theo tiêu đề..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <CButton color="secondary" variant="outline" onClick={() => setSearchTerm('')}>
                                ✕
                            </CButton>
                        )}
                    </CInputGroup>
                </CCardHeader>
                <CCardBody>
                    {loading ? (
                        <div className="text-center py-5">
                            <CSpinner color="primary" />
                            <div className="mt-2 text-muted small">Đang tải dữ liệu...</div>
                        </div>
                    ) : (
                        <CTable hover responsive align="middle" className="mb-0 border">
                            <CTableHead color="light">
                                <CTableRow>
                                    <CTableHeaderCell style={{ width: '60px' }} className="text-center">#</CTableHeaderCell>
                                    <CTableHeaderCell style={{ width: '100px' }} className="text-center">Hình ảnh</CTableHeaderCell>
                                    <CTableHeaderCell>Tiêu đề</CTableHeaderCell>
                                    <CTableHeaderCell style={{ width: '100px' }} className="text-center">Thứ tự</CTableHeaderCell>
                                    <CTableHeaderCell style={{ width: '130px' }} className="text-center">Trạng thái</CTableHeaderCell>
                                    <CTableHeaderCell style={{ width: '140px' }} className="text-center">Hành động</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {filteredBanners.length > 0 ? (
                                    filteredBanners.map((banner, index) => (
                                        <CTableRow key={banner.id}>
                                            <CTableDataCell className="text-center text-muted">
                                                #{index + 1}
                                            </CTableDataCell>
                                            <CTableDataCell className="text-center">
                                                {banner.imageDesktop ? (
                                                    <CImage
                                                        src={banner.imageDesktop}
                                                        alt={banner.title}
                                                        width={60}
                                                        height={40}
                                                        className="rounded border object-fit-cover"
                                                    />
                                                ) : (
                                                    <CIcon icon={cilImage} size="xl" className="text-muted" />
                                                )}
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '200px' }} title={banner.title}>
                                                    {banner.title || '—'}
                                                </div>
                                            </CTableDataCell>
                                            <CTableDataCell className="text-center fw-semibold">
                                                {banner.sortOrder ?? 0}
                                            </CTableDataCell>
                                            <CTableDataCell className="text-center">
                                                <CBadge color={banner.isActive ? 'success' : 'secondary'} shape="rounded-pill">
                                                    {banner.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                                </CBadge>
                                            </CTableDataCell>
                                            <CTableDataCell className="text-center">
                                                <div className="d-flex justify-content-center gap-2">
                                                    <CButton
                                                        color="info"
                                                        variant="ghost"
                                                        size="sm"
                                                        title="Sửa"
                                                        onClick={() => handleOpenEdit(banner)}
                                                    >
                                                        <CIcon icon={cilPencil} />
                                                    </CButton>
                                                    <CButton
                                                        color="danger"
                                                        variant="ghost"
                                                        size="sm"
                                                        title="Xóa"
                                                        onClick={() => handleDelete(banner.id)}
                                                    >
                                                        <CIcon icon={cilTrash} />
                                                    </CButton>
                                                </div>
                                            </CTableDataCell>
                                        </CTableRow>
                                    ))
                                ) : (
                                    <CTableRow>
                                        <CTableDataCell colSpan="6" className="text-center text-muted py-4">
                                            Không có banner nào
                                        </CTableDataCell>
                                    </CTableRow>
                                )}
                            </CTableBody>
                        </CTable>
                    )}
                </CCardBody>
            </CCard>

            {/* Create/Edit Modal */}
            <CModal size="lg" visible={visible} onClose={handleCloseModal} backdrop="static">
                <CModalHeader>
                    <CModalTitle>{isEdit ? 'Sửa Banner' : 'Thêm Banner'}</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm>
                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <CFormLabel className="fw-semibold">Tiêu đề (*)</CFormLabel>
                                <CFormInput
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Nhập tiêu đề banner"
                                />
                            </div>
                            <div className="col-md-6">
                                <CFormLabel className="fw-semibold">Link đích</CFormLabel>
                                <CFormInput
                                    name="targetUrl"
                                    value={formData.targetUrl}
                                    onChange={handleInputChange}
                                    placeholder="https://example.com"
                                />
                            </div>
                        </div>

                        <div className="row g-3 mb-3">
                            <div className="col-md-4">
                                <CFormLabel className="fw-semibold">Thứ tự hiển thị</CFormLabel>
                                <CFormInput
                                    name="sortOrder"
                                    type="number"
                                    value={formData.sortOrder}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                />
                            </div>
                            <div className="col-md-4">
                                <CFormLabel className="fw-semibold">Trạng thái</CFormLabel>
                                <CFormSelect
                                    name="isActive"
                                    value={formData.isActive}
                                    onChange={handleInputChange}
                                    options={[
                                        { value: true, label: 'Hoạt động' },
                                        { value: false, label: 'Không hoạt động' },
                                    ]}
                                />
                            </div>
                            <div className="col-md-4">
                                <CFormLabel className="fw-semibold">Ngày bắt đầu</CFormLabel>
                                <CFormInput
                                    name="startDate"
                                    type="datetime-local"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="row g-3 mb-3">
                            <div className="col-md-4">
                                <CFormLabel className="fw-semibold">Ngày kết thúc</CFormLabel>
                                <CFormInput
                                    name="endDate"
                                    type="datetime-local"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="row g-3">
                            <div className="col-md-6">
                                <CFormLabel className="fw-semibold">Hình ảnh Desktop</CFormLabel>
                                <CFormInput
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, setDesktopFile, setDesktopPreview)}
                                />
                                {(desktopPreview || formData.imageDesktop) && (
                                    <div className="mt-2">
                                        <CImage
                                            src={desktopPreview || formData.imageDesktop}
                                            alt="Desktop preview"
                                            className="rounded border"
                                            style={{ maxWidth: '200px', maxHeight: '120px', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="col-md-6">
                                <CFormLabel className="fw-semibold">Hình ảnh Mobile</CFormLabel>
                                <CFormInput
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, setMobileFile, setMobilePreview)}
                                />
                                {(mobilePreview || formData.imageMobile) && (
                                    <div className="mt-2">
                                        <CImage
                                            src={mobilePreview || formData.imageMobile}
                                            alt="Mobile preview"
                                            className="rounded border"
                                            style={{ maxWidth: '200px', maxHeight: '120px', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" variant="ghost" onClick={handleCloseModal} disabled={isSubmitting}>
                        Hủy bỏ
                    </CButton>
                    <CButton color="primary" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <CSpinner size="sm" /> : (isEdit ? 'Cập nhật' : 'Thêm mới')}
                    </CButton>
                </CModalFooter>
            </CModal>
        </div>
    );
};

export default AdminBannerPage;
