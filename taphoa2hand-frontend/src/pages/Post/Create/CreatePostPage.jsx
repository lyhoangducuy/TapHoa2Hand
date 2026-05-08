import React, { useState, useEffect } from "react";
import { getAllCategories } from "../../../services/categoryService";
import { getAllPayments } from "../../../services/paymentsService";
import { getAllPostsType } from "../../../services/postTypeService";
import { createPost } from "../../../services/postService";
import classNames from 'classnames/bind';
import styles from './CreatePostPage.module.scss';
import BasicInfoSection from "./components/BasicInfoSection";
import CategoriesSection from "./components/CategoriesSection";
import PaymentMethodsSection from "./components/PaymentMethodsSection";
import ProductDetailsSection from "./components/ProductDetailsSection";
import AddressSection from "./components/AddressSection";
import ImageUploadSection from "./components/ImageUploadSection";

const cx = classNames.bind(styles);

function CreatePostPage() {
    const [categories, setCategories] = useState([]);
    const [payments, setPayments] = useState([]);
    const [postTypes, setPostTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [images, setImages] = useState([]);
    
    // Field errors state
    const [fieldErrors, setFieldErrors] = useState({});

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
            street: ""
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const categoryRes = await getAllCategories();
                setCategories(categoryRes.result || []);

                const paymentRes = await getAllPayments();
                setPayments(paymentRes || []);

                const postTypeRes = await getAllPostsType();
                setPostTypes(postTypeRes || []);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu nền", error);
            }
        };
        fetchData();
    }, []);

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

    const index = currentList.findIndex((p) => p.name === payment.name);

    if (index > -1) {
        currentList.splice(index, 1);
    } else {
        currentList.push({
            name: payment.name,
            description: payment.description
        });
    }

    setFormData({
        ...formData,
        acceptedPaymentMethods: currentList
    });
};

    const handleFileChange = (e) => {
        setImages(e.target.files);
    };

    const validateForm = () => {
        const errors = {};

        // Validate basic fields
        if (!formData.title.trim()) {
            errors.title = "Tiêu đề không được để trống";
        } else if (formData.title.trim().length < 5) {
            errors.title = "Tiêu đề phải có ít nhất 5 ký tự";
        }

        if (!formData.price) {
            errors.price = "Giá không được để trống";
        } else if (formData.price <= 0) {
            errors.price = "Giá phải lớn hơn 0";
        }

        // Validate categories
        if (formData.listCategoriesId.length === 0) {
            errors.categories = "Phải chọn ít nhất 1 danh mục";
        }

        // Validate payment methods
        if (formData.acceptedPaymentMethods.length === 0) {
            errors.payments = "Phải chọn ít nhất 1 phương thức thanh toán";
        }

        // Validate product details
        if (!formData.postDetail.description.trim()) {
            errors.description = "Mô tả chi tiết không được để trống";
        } else if (formData.postDetail.description.trim().length < 10) {
            errors.description = "Mô tả chi tiết phải có ít nhất 10 ký tự";
        }

        if (!formData.postDetail.itemCondition.trim()) {
            errors.itemCondition = "Tình trạng sản phẩm không được để trống";
        }

        // Validate address
        if (!formData.postAddress.city.trim()) {
            errors.city = "Tỉnh / Thành phố không được để trống";
        }

        if (!formData.postAddress.ward.trim()) {
            errors.ward = "Quận / Huyện / Phường / Xã không được để trống";
        }

        if (!formData.postAddress.street.trim()) {
            errors.street = "Số nhà / Tên đường không được để trống";
        }

        // Validate images
        if (!images || images.length === 0) {
            errors.images = "Phải chọn ít nhất 1 hình ảnh";
        } else if (images.length > 10) {
            errors.images = "Chỉ có thể chọn tối đa 10 hình ảnh";
        }

        return errors;
    };

    const showError = (message, errorArray = []) => {
        setErrorMessage(message);
        setErrorList(errorArray);
        setShowErrorModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        // Clear errors if validation passes
        setFieldErrors({});

        setIsLoading(true);

        try {
            const mappedPayments = formData.acceptedPaymentMethods.map(pay => pay.name);

            const payload = {
                title: formData.title,
                price: Number(formData.price),
                postTypeName: formData.postTypeName,
                listCategoriesId: formData.listCategoriesId,
                listAcceptedPaymentMethodsValue: mappedPayments,
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
                    street: formData.postAddress.street
                }
            };

            const response = await createPost(payload, images);
            alert("Tạo bài viết thành công!");
            console.log("Success:", response);

            // Optional: Reset form or redirect after success
            setFormData({
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
                    street: ""
                }
            });
            setImages([]);

        } catch (error) {
            console.error("Lỗi khi tạo bài", error);
            const errorMsg = error.response?.data?.message || "Tạo bài viết thất bại";
            alert(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className={cx('wrapper')}>
            <h2 className={cx('pageTitle')}>Đăng Tin Tạp Hóa 2Hand</h2>
            <form onSubmit={handleSubmit}>
                <BasicInfoSection
                    formData={formData}
                    postTypes={postTypes}
                    fieldErrors={fieldErrors}
                    onBasicChange={handleBasicChange}
                />

                <CategoriesSection
                    categories={categories}
                    listCategoriesId={formData.listCategoriesId}
                    fieldErrors={fieldErrors}
                    onCategoryToggle={handleCategoryToggle}
                />

                <PaymentMethodsSection
                    payments={payments}
                    acceptedPaymentMethods={formData.acceptedPaymentMethods}
                    fieldErrors={fieldErrors}
                    onPaymentToggle={handlePaymentToggle}
                />

                <ProductDetailsSection
                    postDetail={formData.postDetail}
                    fieldErrors={fieldErrors}
                    onDetailChange={handleDetailChange}
                />

                <AddressSection
                    postAddress={formData.postAddress}
                    fieldErrors={fieldErrors}
                    onAddressChange={handleAddressChange}
                />

                <ImageUploadSection
                    images={images}
                    fieldErrors={fieldErrors}
                    onFileChange={handleFileChange}
                />

                <button
                    type="submit"
                    className={cx('submitBtn')}
                    disabled={isLoading}
                >
                    {isLoading ? "Đang xử lý..." : "Tạo bài đăng"}
                </button>
            </form>
        </div>
    );
}

export default CreatePostPage;