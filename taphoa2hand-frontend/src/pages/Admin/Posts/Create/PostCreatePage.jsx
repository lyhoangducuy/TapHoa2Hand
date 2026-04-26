import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from '../PostAdminPage.module.scss'; // Giữ lại import style của bạn
import {
    CCard, CCardBody, CCardHeader, CButton, CForm, CFormInput,
    CRow, CCol, CFormCheck, CSpinner, CFormLabel, CFormSelect
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilArrowLeft, cilSave } from '@coreui/icons';

// Import các service lấy dữ liệu động
import { getAllCategories } from "../../../../services/categoryService";
import { getAllPayments } from '../../../../services/paymentsService';
import { createPost } from "../../../../services/postService";
import { getAllPostStatuses } from '../../../../services/postStatus';
const cx = classNames.bind(styles);

function PostCreatePage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // State lưu dữ liệu nền (Lấy động từ API)
    const [categories, setCategories] = useState([]);
    const [payments, setPayments] = useState([]);
    const [statuses, setStatuses] = useState([]);

    // State file ảnh
    const [images, setImages] = useState([]);

    // Form Data (Chuẩn cấu trúc bạn cung cấp + thêm status)
    const [formData, setFormData] = useState({
        title: "",
        price: "",
        postTypeName: "SELL",
        status: "",
        listCategoriesId: [],
        acceptedPaymentMethods: [], // Chứa mảy object { value, label }
        postDetail: {
            description: "",
            brand: "",
            model: "",
            itemCondition: "",
            usedDuration: "",
            reasonForSelling: ""
        },
        postAddress: {
            city: "",
            ward: "",
            street: ""
        }
    });

    // GỌI API LẤY DỮ LIỆU ĐỘNG
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoryRes, paymentRes, statusRes] = await Promise.all([
                    getAllCategories(),
                    getAllPayments(),
                    getAllPostStatuses()
                ]);

                setCategories(categoryRes.result || []);
                setPayments(paymentRes.result || []);

                const fetchedStatuses = statusRes.result || statusRes || [];
                setStatuses(fetchedStatuses);

                // Đặt trạng thái mặc định
                // Đặt trạng thái mặc định
                if (fetchedStatuses.length > 0) {
                    const firstStatus = fetchedStatuses[0];
                    // Ưu tiên lấy trường 'code', nếu không có thì lấy 'value', nếu là mảng chuỗi thì lấy chính nó
                    const firstVal = firstStatus.code || firstStatus.value || firstStatus;

                    // Kiểm tra an toàn đề phòng firstVal vẫn là object
                    setFormData(prev => ({
                        ...prev,
                        status: typeof firstVal === 'object' ? '' : firstVal
                    }));
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu nền", error);
                setErrorMsg("Không thể tải cấu hình hệ thống.");
            }
        };
        fetchData();
    }, []);

    // --- CÁC HÀM XỬ LÝ SỰ KIỆN (Logic của bạn) ---
    const handleBasicChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDetailChange = (e) => {
        setFormData({
            ...formData,
            postDetail: { ...formData.postDetail, [e.target.name]: e.target.value }
        });
    };

    const handleAddressChange = (e) => {
        setFormData({
            ...formData,
            postAddress: { ...formData.postAddress, [e.target.name]: e.target.value }
        });
    };

    const handleCategoryToggle = (categoryId) => {
        const currentList = [...formData.listCategoriesId];
        const index = currentList.indexOf(categoryId.toString());

        if (index > -1) {
            currentList.splice(index, 1);
        } else {
            currentList.push(categoryId.toString());
        }

        setFormData({ ...formData, listCategoriesId: currentList });
    };

    const handlePaymentToggle = (payment) => {
        const currentList = [...formData.acceptedPaymentMethods];

        // Dùng 'value' để kiểm tra (logic theo code bạn cung cấp)
        const index = currentList.findIndex((p) => p.value === (payment.value || payment));

        if (index > -1) {
            currentList.splice(index, 1);
        } else {
            currentList.push({
                value: payment.value || payment,
                label: payment.label || payment
            });
        }

        setFormData({ ...formData, acceptedPaymentMethods: currentList });
    };

    const handleFileChange = (e) => {
        setImages(e.target.files);
    };

    // --- SUBMIT FORM ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg("");

        try {
            // Map mảng object payment thành mảng value chuỗi
            const mappedPayments = formData.acceptedPaymentMethods.map(pay => pay.value);

            const payload = {
                ...formData,
                listAcceptedPaymentMethodsValue: mappedPayments,
                price: Number(formData.price)
            };

            // Xóa trường cũ đi cho sạch request
            delete payload.acceptedPaymentMethods;

            await createPost(payload, images);
            alert("Tạo bài đăng thành công!");
            navigate('/admin/posts');

        } catch (error) {
            console.error("Lỗi khi tạo bài", error);
            setErrorMsg("Tạo bài viết thất bại, vui lòng kiểm tra lại thông tin!");
        } finally {
            setIsLoading(false);
        }
    };

    // --- GIAO DIỆN COREUI ---
    return (
        <div className={cx('wrapper', 'user-page')}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0">Đăng Tin Tạp Hóa 2Hand</h3>
                <CButton color="secondary" variant="outline" onClick={() => navigate(-1)}>
                    <CIcon icon={cilArrowLeft} className="me-2" /> Quay lại
                </CButton>
            </div>

            <CCard className="shadow-sm border-0 mb-5">
                <CCardBody>
                    {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

                    <CForm onSubmit={handleSubmit}>
                        {/* 1. THÔNG TIN CƠ BẢN */}
                        <h6 className="fw-bold mt-2 mb-3 border-bottom pb-2 text-primary">1. Thông tin cơ bản</h6>
                        <CRow className="mb-4">
                            <CCol md={6}>
                                <CFormInput label="Tiêu đề (*)" name="title" value={formData.title} onChange={handleBasicChange} required />
                            </CCol>
                            <CCol md={3}>
                                <CFormInput type="number" label="Giá (VNĐ) (*)" name="price" value={formData.price} onChange={handleBasicChange} required />
                            </CCol>
                            <CCol md={3}>
                                <CFormLabel>Loại bài viết</CFormLabel>
                                <CFormSelect name="postTypeName" value={formData.postTypeName} onChange={handleBasicChange}>
                                    <option value="SELL">Tin rao bán</option>
                                    <option value="BUY">Tin cần mua</option>
                                </CFormSelect>
                            </CCol>
                            <CCol md={3}>
                                <CFormLabel>Trạng thái</CFormLabel>
                                <CFormSelect name="status" value={formData.status} onChange={handleBasicChange}>
                                    {statuses.map((st, idx) => {
                                        // Lấy đúng key từ Backend (code và displayName)
                                        const val = st.code || st.value || st;
                                        const lbl = st.displayName || st.label || st.name || st;

                                        // Chuyển về String để đảm bảo React không bao giờ bị crash vì nhận nhầm Object
                                        const safeValue = typeof val === 'object' ? JSON.stringify(val) : String(val);
                                        const safeLabel = typeof lbl === 'object' ? 'Lỗi hiển thị' : String(lbl);

                                        return <option key={idx} value={safeValue}>{safeLabel}</option>
                                    })}
                                </CFormSelect>
                            </CCol>
                        </CRow>

                        {/* 2. DANH MỤC & THANH TOÁN */}
                        <CRow className="mb-4">
                            <CCol md={6}>
                                <CFormLabel className="fw-semibold">Danh mục (*)</CFormLabel>
                                <div className="p-3 border rounded bg-light">
                                    {categories.map((cat) => (
                                        <CFormCheck
                                            key={cat.id} inline label={cat.name}
                                            checked={formData.listCategoriesId.includes(cat.id.toString())}
                                            onChange={() => handleCategoryToggle(cat.id)}
                                        />
                                    ))}
                                </div>
                            </CCol>
                            <CCol md={6}>
                                <CFormLabel className="fw-semibold">Phương thức thanh toán (*)</CFormLabel>
                                <div className="p-3 border rounded bg-light">
                                    {payments.map((pay, idx) => {
                                        const payValue = pay.value || pay;
                                        const payLabel = pay.label || pay;
                                        return (
                                            <CFormCheck
                                                key={idx} inline label={payLabel}
                                                // Kiểm tra xem value có nằm trong mảng object đang lưu không
                                                checked={formData.acceptedPaymentMethods.findIndex(p => p.value === payValue) > -1}
                                                onChange={() => handlePaymentToggle(pay)}
                                            />
                                        );
                                    })}
                                </div>
                            </CCol>
                        </CRow>

                        {/* 3. CHI TIẾT SẢN PHẨM */}
                        <h6 className="fw-bold mt-4 mb-3 border-bottom pb-2 text-primary">2. Chi tiết sản phẩm</h6>
                        <CRow className="mb-3">
                            <CCol md={3}><CFormInput label="Thương hiệu" name="brand" value={formData.postDetail.brand} onChange={handleDetailChange} /></CCol>
                            <CCol md={3}><CFormInput label="Model" name="model" value={formData.postDetail.model} onChange={handleDetailChange} /></CCol>
                            <CCol md={3}><CFormInput label="Tình trạng" name="itemCondition" placeholder="Ví dụ: Mới 90%" value={formData.postDetail.itemCondition} onChange={handleDetailChange} /></CCol>
                            <CCol md={3}><CFormInput label="Thời gian đã dùng" name="usedDuration" placeholder="Ví dụ: 6 tháng" value={formData.postDetail.usedDuration} onChange={handleDetailChange} /></CCol>
                        </CRow>
                        <CRow className="mb-4">
                            <CCol md={12} className="mb-3">
                                <CFormInput label="Lý do bán" name="reasonForSelling" value={formData.postDetail.reasonForSelling} onChange={handleDetailChange} />
                            </CCol>
                            <CCol md={12}>
                                <CFormLabel>Mô tả chi tiết</CFormLabel>
                                <textarea
                                    className="form-control"
                                    name="description"
                                    rows="4"
                                    value={formData.postDetail.description}
                                    onChange={handleDetailChange}
                                ></textarea>
                            </CCol>
                        </CRow>

                        {/* 4. ĐỊA CHỈ */}
                        <h6 className="fw-bold mt-4 mb-3 border-bottom pb-2 text-primary">3. Địa chỉ người bán</h6>
                        <CRow className="mb-4">
                            <CCol md={4}><CFormInput label="Tỉnh / Thành phố" name="city" value={formData.postAddress.city} onChange={handleAddressChange} /></CCol>
                            <CCol md={4}><CFormInput label="Quận / Huyện / Xã" name="ward" value={formData.postAddress.ward} onChange={handleAddressChange} /></CCol>
                            <CCol md={4}><CFormInput label="Số nhà / Tên đường" name="street" value={formData.postAddress.street} onChange={handleAddressChange} /></CCol>
                        </CRow>

                        {/* 5. HÌNH ẢNH */}
                        <h6 className="fw-bold mt-4 mb-3 border-bottom pb-2 text-primary">4. Hình ảnh sản phẩm</h6>
                        <div className="mb-4 p-3 border rounded bg-light">
                            <CFormInput
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <small className="text-muted mt-2 d-block">Bạn có thể chọn nhiều ảnh cùng lúc.</small>
                        </div>

                        {/* NÚT SUBMIT */}
                        <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                            <CButton color="primary" type="submit" disabled={isLoading} className="px-4 py-2">
                                {isLoading ? <CSpinner size="sm" className="me-2" /> : <CIcon icon={cilSave} className="me-2" />}
                                Tạo bài đăng
                            </CButton>
                        </div>
                    </CForm>
                </CCardBody>
            </CCard>
        </div>
    );
}

export default PostCreatePage;