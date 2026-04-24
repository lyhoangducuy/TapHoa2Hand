import React, { useState, useEffect } from "react";
import { getAllCategories } from "../../../services/categoryService";
import { getAllPayments } from "../../../services/paymentsService";
import { getAllPostsType } from "../../../services/postTypeService";
import { createPost } from "../../../services/postService";
import classNames from 'classnames/bind';
import styles from './CreatePostPage.module.scss';

const cx = classNames.bind(styles);

function CreatePostPage() {
    const [categories, setCategories] = useState([]);
    const [payments, setPayments] = useState([]);
    const [postTypes, setPostTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [images, setImages] = useState([]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
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

            // Optional: Thêm code reset form hoặc chuyển trang (redirect) ở đây sau khi tạo thành công

        } catch (error) {
            console.error("Lỗi khi tạo bài", error);
            alert("Tạo bài viết thất bại, vui lòng kiểm tra console!");
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className={cx('wrapper')}>
            <h2 className={cx('pageTitle')}>Đăng Tin Tạp Hóa 2Hand</h2>
            <form onSubmit={handleSubmit}>

                {/* --- THÔNG TIN CƠ BẢN --- */}
                <fieldset className={cx('fieldset')}>
                    <legend className={cx('legend')}>Thông tin cơ bản</legend>
                    <div className={cx('formGroup')}>
                        <label>Loại tin:</label>
                        <select 
                            className={cx('inputControl')} 
                            name="postTypeName" 
                            value={formData.postTypeName} 
                            onChange={handleBasicChange}
                            required
                        >
                            {postTypes.map((type) => (
                                <option key={type.name} value={type.name}>
                                    {type.displayName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={cx('formGroup')}>
                        <label>Tiêu đề:</label>
                        <input className={cx('inputControl')} name="title" value={formData.title} onChange={handleBasicChange} required />
                    </div>
                    <div className={cx('formGroup')}>
                        <label>Giá (VNĐ):</label>
                        <input className={cx('inputControl')} type="number" name="price" value={formData.price} onChange={handleBasicChange} required />
                    </div>
                </fieldset>

                {/* --- DANH MỤC --- */}
                <fieldset className={cx('fieldset')}>
                    <legend className={cx('legend')}>Danh mục</legend>
                    <div className={cx('checkboxGroup')}>
                        {categories.map((cat) => (
                            <label key={cat.id} className={cx('checkboxLabel')}>
                                <input
                                    type="checkbox"
                                    onChange={() => handleCategoryToggle(cat.id)}
                                /> {cat.name}
                            </label>
                        ))}
                    </div>
                </fieldset>

                {/* --- THANH TOÁN --- */}
                <fieldset className={cx('fieldset')}>
                    <legend className={cx('legend')}>Phương thức thanh toán chấp nhận</legend>
                    <div className={cx('checkboxGroup')}>
                        {(payments || []).map((pay) => (
    <label key={pay.name} className={cx('checkboxLabel')}>
        <input
            type="checkbox"
            checked={formData.acceptedPaymentMethods.some(p => p.name === pay.name)}
            onChange={() => handlePaymentToggle(pay)}
        />
        {pay.description}
    </label>
))}
                    </div>
                </fieldset>

                {/* --- CHI TIẾT SẢN PHẨM --- */}
                <fieldset className={cx('fieldset')}>
                    <legend className={cx('legend')}>Chi tiết sản phẩm</legend>
                    <div className={cx('grid2Cols')}>
                        <div className={cx('formGroup')}><label>Thương hiệu:</label> <input className={cx('inputControl')} name="brand" value={formData.postDetail.brand} onChange={handleDetailChange} /></div>
                        <div className={cx('formGroup')}><label>Model:</label> <input className={cx('inputControl')} name="model" value={formData.postDetail.model} onChange={handleDetailChange} /></div>
                        <div className={cx('formGroup')}><label>Tình trạng:</label> <input className={cx('inputControl')} name="itemCondition" value={formData.postDetail.itemCondition} onChange={handleDetailChange} placeholder="Ví dụ: Mới 90%" /></div>
                        <div className={cx('formGroup')}><label>Thời gian đã sử dụng:</label> <input className={cx('inputControl')} name="usedDuration" value={formData.postDetail.usedDuration} onChange={handleDetailChange} placeholder="Ví dụ: 6 tháng" /></div>
                    </div>
                    <div className={cx('formGroup')}><label>Lý do bán:</label> <input className={cx('inputControl')} name="reasonForSelling" value={formData.postDetail.reasonForSelling} onChange={handleDetailChange} /></div>
                    <div className={cx('formGroup')}>
                        <label>Mô tả chi tiết:</label>
                        <textarea className={cx('textareaControl')} name="description" value={formData.postDetail.description} onChange={handleDetailChange} rows="4"></textarea>
                    </div>
                </fieldset>

                {/* --- ĐỊA CHỈ --- */}
                <fieldset className={cx('fieldset')}>
                    <legend className={cx('legend')}>Địa chỉ người bán</legend>
                    <div className={cx('grid2Cols')}>
                        <div className={cx('formGroup')}><label>Tỉnh / Thành phố:</label> <input className={cx('inputControl')} name="city" value={formData.postAddress.city} onChange={handleAddressChange} /></div>
                        <div className={cx('formGroup')}><label>Quận / Huyện / Phường / Xã:</label> <input className={cx('inputControl')} name="ward" value={formData.postAddress.ward} onChange={handleAddressChange} /></div>
                    </div>
                    <div className={cx('formGroup')}><label>Số nhà / Tên đường:</label> <input className={cx('inputControl')} name="street" value={formData.postAddress.street} onChange={handleAddressChange} /></div>
                </fieldset>

                {/* --- HÌNH ẢNH --- */}
                <fieldset className={cx('fieldset')}>
                    <legend className={cx('legend')}>Hình ảnh sản phẩm</legend>
                    <div className={cx('formGroup')}>
                        <input
                            className={cx('fileInput')}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <small className={cx('helperText')}>Bạn có thể chọn nhiều ảnh cùng lúc.</small>
                    </div>
                </fieldset>

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