import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCategories } from "../../../services/categoryService";
import { getAllPayments } from "../../../services/paymentsService";
import { getAllPostsType } from "../../../services/postTypeService";
import { createPost } from "../../../services/postService";
import { toast } from "react-toastify";
import classNames from 'classnames/bind';
import styles from './CreatePostPage.module.scss';
import BasicInfoSection from "./components/BasicInfoSection";
import CategoriesSection from "./components/CategoriesSection";
import PaymentMethodsSection from "./components/PaymentMethodsSection";
import ProductDetailsSection from "./components/ProductDetailsSection";
import AddressSection from "./components/AddressSection";
import ImageUploadSection from "./components/ImageUploadSection";

const cx = classNames.bind(styles);

// ─── Price formatter ───
const formatPrice = (value) => {
    const num = value.replace(/[^\d]/g, '');
    if (!num) return '';
    return new Intl.NumberFormat('vi-VN').format(Number(num));
};

const unformatPrice = (value) => value.replace(/[^\d]/g, '');

function CreatePostPage() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [payments, setPayments] = useState([]);
    const [postTypes, setPostTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [images, setImages] = useState([]);
    const [fieldErrors, setFieldErrors] = useState({});

    // Live formatted price (display only)
    const [priceDisplay, setPriceDisplay] = useState('');

    const [formData, setFormData] = useState({
        title: "",
        price: "",
        postTypeName: "SELL",
        listCategoriesId: [],
        acceptedPaymentMethods: [],
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
            street: "",
            provinceCode: "",
            wardCode: ""
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, payRes, typeRes] = await Promise.all([
                    getAllCategories(),
                    getAllPayments(),
                    getAllPostsType()
                ]);
                setCategories(catRes.result || []);
                setPayments(payRes || []);
                setPostTypes(typeRes || []);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu nền", error);
                toast.error("Không tải được dữ liệu. Vui lòng thử lại.");
            }
        };
        fetchData();
    }, []);

    const handleBasicChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Realtime price formatting
    const handlePriceChange = (e) => {
        const raw = unformatPrice(e.target.value);
        const num = Number(raw);
        setFormData(prev => ({ ...prev, price: raw }));
        setPriceDisplay(formatPrice(raw));
    };

    const handleDetailChange = (e) => {
        setFormData(prev => ({
            ...prev,
            postDetail: { ...prev.postDetail, [e.target.name]: e.target.value }
        }));
    };

    const handleAddressChange = (e) => {
        setFormData(prev => ({
            ...prev,
            postAddress: { ...prev.postAddress, [e.target.name]: e.target.value }
        }));
    };

    const patchPostAddress = useCallback((patch) => {
        setFormData(prev => ({
            ...prev,
            postAddress: { ...prev.postAddress, ...patch },
        }));
    }, []);

    const handleCategoryToggle = (categoryId) => {
        const currentList = [...formData.listCategoriesId];
        const index = currentList.indexOf(categoryId.toString());
        if (index > -1) currentList.splice(index, 1);
        else currentList.push(categoryId.toString());
        setFormData(prev => ({ ...prev, listCategoriesId: currentList }));
    };

    const handlePaymentToggle = (payment) => {
        const currentList = [...formData.acceptedPaymentMethods];
        const index = currentList.findIndex(p => p.name === payment.name);
        if (index > -1) currentList.splice(index, 1);
        else currentList.push({ name: payment.name, description: payment.description });
        setFormData(prev => ({ ...prev, acceptedPaymentMethods: currentList }));
    };

    const handleFileChange = (e) => {
        setImages(e.target.files);
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) errors.title = "Tiêu đề không được để trống";
        else if (formData.title.trim().length < 5) errors.title = "Tiêu đề phải có ít nhất 5 ký tự";
        if (!formData.price) errors.price = "Giá không được để trống";
        else if (Number(formData.price) <= 0) errors.price = "Giá phải lớn hơn 0";
        if (formData.listCategoriesId.length === 0) errors.categories = "Phải chọn ít nhất 1 danh mục";
        if (formData.acceptedPaymentMethods.length === 0) errors.payments = "Phải chọn ít nhất 1 phương thức";
        if (!formData.postDetail.description.trim()) errors.description = "Mô tả không được để trống";
        else if (formData.postDetail.description.trim().length < 10) errors.description = "Mô tả phải có ít nhất 10 ký tự";
        if (!formData.postDetail.itemCondition.trim()) errors.itemCondition = "Tình trạng không được để trống";
        if (!formData.postAddress.city.trim()) errors.city = "Chưa chọn tỉnh/thành";
        if (!formData.postAddress.ward.trim()) errors.ward = "Chưa chọn phường/xã";
        if (!formData.postAddress.street.trim()) errors.street = "Số nhà / tên đường không được để trống";
        if (!images || images.length === 0) errors.images = "Phải chọn ít nhất 1 hình ảnh";
        else if (images.length > 10) errors.images = "Tối đa 10 hình ảnh";
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            toast.error("Vui lòng kiểm tra lại các trường thông tin.");
            return;
        }
        setFieldErrors({});
        setIsLoading(true);
        try {
            const payload = {
                title: formData.title,
                price: Number(formData.price),
                postTypeName: formData.postTypeName,
                listCategoriesId: formData.listCategoriesId,
                listAcceptedPaymentMethodsValue: formData.acceptedPaymentMethods.map(p => p.name),
                postDetail: {
                    description: formData.postDetail.description,
                    brand: formData.postDetail.brand,
                    model: formData.postDetail.model,
                    itemCondition: formData.postDetail.itemCondition,
                    usedDuration: formData.postDetail.usedDuration,
                    reasonForSelling: formData.postDetail.reasonForSelling
                },
                postAddress: {
                    city: formData.postAddress.city,
                    ward: formData.postAddress.ward,
                    street: formData.postAddress.street,
                }
            };
            await createPost(payload, images);
            toast.success("Đăng tin thành công!");
            navigate('/');
        } catch (error) {
            console.error("Lỗi khi tạo bài", error);
            const msg = error.response?.data?.message || "Đăng tin thất bại. Vui lòng thử lại.";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cx('page')}>
            {/* ─── Page Header ─── */}
            <div className={cx('page-header')}>
            </div>

            {/* ─── Form Container ─── */}
            <div className={cx('form-container')}>
                <form onSubmit={handleSubmit} noValidate>

                    {/* 1. Thông tin cơ bản */}
                    <section className={cx('card')}>
                        <div className={cx('card-header')}>
                            <div className={cx('card-icon', 'icon-basic')}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                            </div>
                            <div>
                                <h2 className={cx('card-title')}>Thông tin cơ bản</h2>
                                <p className={cx('card-desc')}>Loại tin, tiêu đề và giá sản phẩm</p>
                            </div>
                        </div>
                        <div className={cx('card-body')}>
                            <div className={cx('formGroup')}>
                                <label className={cx('label')}>Loại tin</label>
                                <select
                                    className={cx('selectControl')}
                                    name="postTypeName"
                                    value={formData.postTypeName}
                                    onChange={handleBasicChange}
                                >
                                    {postTypes.map(type => (
                                        <option key={type.name} value={type.name}>{type.displayName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={cx('formGroup')}>
                                <label className={cx('label')}>Tiêu đề <span className={cx('required')}>*</span></label>
                                <input
                                    className={cx('inputControl', { error: fieldErrors.title })}
                                    name="title"
                                    value={formData.title}
                                    onChange={handleBasicChange}
                                    placeholder="Ví dụ: iPhone 14 Pro Max 128GB – Mới 95%"
                                    maxLength={120}
                                />
                                {fieldErrors.title && <span className={cx('errorText')}>{fieldErrors.title}</span>}
                            </div>

                            <div className={cx('formGroup')}>
                                <label className={cx('label')}>Giá bán <span className={cx('required')}>*</span></label>
                                <div className={cx('price-wrapper')}>
                                    <input
                                        className={cx('inputControl', 'priceInput', { error: fieldErrors.price })}
                                        type="text"
                                        inputMode="numeric"
                                        value={priceDisplay}
                                        onChange={handlePriceChange}
                                        placeholder="0"
                                    />
                                    <span className={cx('priceSuffix')}>VND</span>
                                </div>
                                {priceDisplay && (
                                    <span className={cx('pricePreview')}>
                                        💰 {priceDisplay} đ
                                    </span>
                                )}
                                {fieldErrors.price && <span className={cx('errorText')}>{fieldErrors.price}</span>}
                            </div>
                        </div>
                    </section>

                    {/* 2. Danh mục */}
                    <CategoriesSection
                        categories={categories}
                        listCategoriesId={formData.listCategoriesId}
                        fieldErrors={fieldErrors}
                        onCategoryToggle={handleCategoryToggle}
                    />

                    {/* 3. Thanh toán */}
                    <PaymentMethodsSection
                        payments={payments}
                        acceptedPaymentMethods={formData.acceptedPaymentMethods}
                        fieldErrors={fieldErrors}
                        onPaymentToggle={handlePaymentToggle}
                    />

                    {/* 4. Chi tiết sản phẩm */}
                    <ProductDetailsSection
                        postDetail={formData.postDetail}
                        fieldErrors={fieldErrors}
                        onDetailChange={handleDetailChange}
                    />

                    {/* 5. Địa chỉ */}
                    <AddressSection
                        postAddress={formData.postAddress}
                        fieldErrors={fieldErrors}
                        onAddressChange={handleAddressChange}
                        onPostAddressPatch={patchPostAddress}
                    />

                    {/* 6. Hình ảnh */}
                    <ImageUploadSection
                        images={images}
                        fieldErrors={fieldErrors}
                        onFileChange={handleFileChange}
                    />

                    {/* ─── Submit ─── */}
                    <div className={cx('submit-area')}>
                        <button
                            type="button"
                            className={cx('btn-cancel')}
                            onClick={() => navigate(-1)}
                            disabled={isLoading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className={cx('submitBtn')}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className={cx('btn-loading')}>
                                    <span className={cx('spinner')} />
                                    Đang xử lý...
                                </span>
                            ) : (
                                <>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
                                    Đăng tin ngay
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default CreatePostPage;
