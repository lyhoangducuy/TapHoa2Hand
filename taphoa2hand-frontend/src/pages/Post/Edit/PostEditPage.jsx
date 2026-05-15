import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import { 
    FiX, 
    FiUploadCloud, 
    FiSave, 
    FiChevronLeft, 
    FiInfo, 
    FiMapPin, 
    FiCheckCircle,
    FiList
} from 'react-icons/fi';

import styles from './PostEditPage.module.scss';
import { getAllCategories } from '../../../services/categoryService';
import { getAllPayments } from '../../../services/paymentsService';
import { getPostDetail, editPost } from '../../../services/postService'; 
import { getAllPostStatuses } from '../../../services/postStatus';
import AddressSection from '../Create/components/AddressSection';

const cx = classNames.bind(styles);

function PostEditPage() {
    const { postId } = useParams();
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [payments, setPayments] = useState([]);
    const [statuses, setStatuses] = useState([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]); 
    const [newImagePreviews, setNewImagePreviews] = useState([]);

    const [formData, setFormData] = useState({
        title: "",
        price: "",
        status: "",
        retainedImageUrls: [], 
        listCategoriesId: [],
        listAcceptedPaymentMethodsValue: [],
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
            wardCode: "",
        },
    });

    useEffect(() => {
        const initData = async () => {
            try {
                const [catRes, payRes, statusRes, postRes] = await Promise.all([
                    getAllCategories(),
                    getAllPayments(),
                    getAllPostStatuses(),
                    getPostDetail(postId)
                ]);

                setCategories(catRes.result || []);
                setPayments(payRes.result || []);
                setStatuses(statusRes.result || []);

                if (postRes.result) {
                    const data = postRes.result;
                    
                    // FIX LỖI ẢNH: Quét rộng các trường hợp trả về của API
                    let oldImages = [];
                    const apiImages = data.imageUrls || data.images || data.postImages || []; // Bắt nhiều tên biến
                    
                    if (apiImages.length > 0) {
                        oldImages = apiImages.map(img => {
                            if (typeof img === 'string') return img; // Nếu là mảng string
                            // Nếu là mảng Object, quét các key phổ biến chứa link ảnh
                            return img.url || img.imageUrl || img.path || img.link || "";
                        }).filter(url => url !== ""); // Lọc bỏ các URL rỗng
                    }

                    setFormData({
                        title: data.title || "",
                        price: data.price || "",
                        status: data.status || "",
                        retainedImageUrls: oldImages, 
                        listCategoriesId: data.categories?.map(c => c.id.toString()) || [],
                        listAcceptedPaymentMethodsValue: data.paymentMethods?.map(p => p.value) || [],
                        postDetail: { ...data.postDetail },
                        postAddress: {
                            city: data.postAddress?.city || "",
                            ward: data.postAddress?.ward || "",
                            street: data.postAddress?.street || "",
                            provinceCode: "",
                            wardCode: "",
                        },
                    });
                }
            } catch (error) {
                console.error("Lỗi khởi tạo:", error);
            }
        };
        initData();
    }, [postId]);

    const handleBasicChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNestedChange = (e, section) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [section]: { ...prev[section], [name]: value }
        }));
    };

    const patchPostAddress = useCallback((patch) => {
        setFormData((prev) => ({
            ...prev,
            postAddress: { ...prev.postAddress, ...patch },
        }));
    }, []);

    const handleToggle = (id, field) => {
        const idStr = id.toString();
        setFormData(prev => {
            const list = prev[field];
            const newList = list.includes(idStr) 
                ? list.filter(i => i !== idStr) 
                : [...list, idStr];
            return { ...prev, [field]: newList };
        });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
        
        const previews = files.map(file => URL.createObjectURL(file));
        setNewImagePreviews(prev => [...prev, ...previews]);
    };

    const removeOldImage = (url) => {
        setFormData(prev => ({
            ...prev,
            retainedImageUrls: prev.retainedImageUrls.filter(u => u !== url)
        }));
    };

    const removeNewImage = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.retainedImageUrls.length === 0 && selectedFiles.length === 0) {
            alert("Vui lòng giữ lại hoặc thêm ít nhất 1 ảnh!");
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                ...formData,
                postAddress: {
                    city: formData.postAddress.city,
                    ward: formData.postAddress.ward,
                    street: formData.postAddress.street,
                },
            };
            await editPost(postId, payload, selectedFiles);
            alert("Cập nhật bài đăng thành công!");
            navigate('/post-detail/' + postId);
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
            alert("Cập nhật thất bại, vui lòng kiểm tra lại!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cx('edit-container')}>
            <header className={cx('edit-header')}>
                <button type="button" onClick={() => navigate(-1)} className={cx('btn-back')}>
                    <FiChevronLeft /> Quay lại
                </button>
                <h2 className={cx('title')}>Chỉnh sửa bài đăng</h2>
            </header>

            <form onSubmit={handleSubmit} className={cx('edit-form')}>
                
                {/* CỘT TRÁI: NỘI DUNG CHÍNH (Thông tin, Chi tiết, Hình ảnh) */}
                <div className={cx('col-left')}>
                    <section className={cx('card')}>
                        <div className={cx('card-title')}><FiInfo /> Thông tin cơ bản</div>
                        <div className={cx('input-group')}>
                            <label>Tiêu đề bài đăng</label>
                            <input name="title" value={formData.title} onChange={handleBasicChange} required placeholder="Ví dụ: iPhone 13 Pro Max còn mới..." />
                        </div>
                        <div className={cx('input-group')}>
                            <label>Giá bán (VNĐ)</label>
                            <input type="number" name="price" value={formData.price} onChange={handleBasicChange} required />
                        </div>
                    </section>

                    <section className={cx('card')}>
                        <div className={cx('card-title')}><FiList /> Chi tiết & Mô tả</div>
                        <div className={cx('row-2')}>
                            <div className={cx('input-group')}>
                                <label>Thương hiệu</label>
                                <input placeholder="Ví dụ: Apple, Samsung..." name="brand" value={formData.postDetail.brand} onChange={(e) => handleNestedChange(e, 'postDetail')} />
                            </div>
                            <div className={cx('input-group')}>
                                <label>Dòng máy (Model)</label>
                                <input placeholder="Ví dụ: iPhone 13 Pro Max..." name="model" value={formData.postDetail.model} onChange={(e) => handleNestedChange(e, 'postDetail')} />
                            </div>
                        </div>

                        <div className={cx('row-2')}>
                            <div className={cx('input-group')}>
                                <label>Tình trạng (%)</label>
                                <input placeholder="Ví dụ: 99%, Chưa kích hoạt..." name="itemCondition" value={formData.postDetail.itemCondition} onChange={(e) => handleNestedChange(e, 'postDetail')} />
                            </div>
                            <div className={cx('input-group')}>
                                <label>Thời gian đã sử dụng</label>
                                <input placeholder="Ví dụ: 6 tháng" name="usedDuration" value={formData.postDetail.usedDuration} onChange={(e) => handleNestedChange(e, 'postDetail')} />
                            </div>
                        </div>

                        <div className={cx('input-group')}>
                            <label>Lý do bán</label>
                            <input placeholder="Ví dụ: Lên đời máy mới, kẹt tiền..." name="reasonForSelling" value={formData.postDetail.reasonForSelling} onChange={(e) => handleNestedChange(e, 'postDetail')} />
                        </div>

                        <div className={cx('input-group')}>
                            <label>Mô tả chi tiết</label>
                            <textarea placeholder="Viết mô tả chi tiết về sản phẩm (phụ kiện đi kèm, lỗi nếu có)..." name="description" value={formData.postDetail.description} onChange={(e) => handleNestedChange(e, 'postDetail')} rows={6} />
                        </div>
                    </section>

                    <section className={cx('card')}>
                        <div className={cx('card-title')}><FiUploadCloud /> Hình ảnh sản phẩm</div>
                        <div className={cx('image-grid')}>
                            {/* Ảnh cũ */}
                            {formData.retainedImageUrls.map((url, idx) => (
                                <div key={`old-${idx}`} className={cx('img-box')}>
                                    <img src={url} alt="old" />
                                    <button type="button" className={cx('btn-del')} onClick={() => removeOldImage(url)}><FiX /></button>
                                    <span className={cx('badge')}>Hiện tại</span>
                                </div>
                            ))}
                            {/* Ảnh mới */}
                            {newImagePreviews.map((url, idx) => (
                                <div key={`new-${idx}`} className={cx('img-box', 'is-new')}>
                                    <img src={url} alt="new" />
                                    <button type="button" className={cx('btn-del')} onClick={() => removeNewImage(idx)}><FiX /></button>
                                    <span className={cx('badge')}>Mới thêm</span>
                                </div>
                            ))}
                            {/* Nút upload */}
                            <label className={cx('upload-trigger')}>
                                <FiUploadCloud size={28} />
                                <span>Thêm ảnh</span>
                                <input type="file" multiple onChange={handleFileChange} hidden accept="image/*" />
                            </label>
                        </div>
                    </section>
                </div>

                {/* CỘT PHẢI: THIẾT LẬP PHỤ & NÚT LƯU */}
                <div className={cx('col-right')}>
                    
                    {/* Chuyển Trạng thái sang cột phải */}
                    <section className={cx('card')}>
                        <div className={cx('card-title')}><FiCheckCircle /> Trạng thái hiển thị</div>
                        <div className={cx('status-options')}>
                            {statuses.map(s => (
                                <label key={s.code} className={cx('status-item', { active: formData.status === s.code })}>
                                    <input type="radio" name="status" value={s.code} checked={formData.status === s.code} onChange={handleBasicChange} />
                                    {s.displayName}
                                </label>
                            ))}
                        </div>
                    </section>

                    <section className={cx('card')}>
                        <div className={cx('card-title')}>Phân loại & Thanh toán</div>
                        <div className={cx('label-min')}>Danh mục sản phẩm</div>
                        <div className={cx('chip-group')}>
                            {categories.map(c => (
                                <label key={c.id} className={cx('chip', { selected: formData.listCategoriesId.includes(c.id.toString()) })}>
                                    <input type="checkbox" onChange={() => handleToggle(c.id, 'listCategoriesId')} checked={formData.listCategoriesId.includes(c.id.toString())} />
                                    {c.name}
                                </label>
                            ))}
                        </div>
                        <div className={cx('label-min')}>Phương thức thanh toán</div>
                        <div className={cx('chip-group')}>
                            {payments.map(p => (
                                <label key={p.value} className={cx('chip', { selected: formData.listAcceptedPaymentMethodsValue.includes(p.value) })}>
                                    <input type="checkbox" onChange={() => handleToggle(p.value, 'listAcceptedPaymentMethodsValue')} checked={formData.listAcceptedPaymentMethodsValue.includes(p.value)} />
                                    {p.label}
                                </label>
                            ))}
                        </div>
                    </section>

                    <section className={cx('card')}>
                        <div className={cx('card-title')}><FiMapPin /> Địa chỉ người bán</div>
                        <AddressSection
                            embedded
                            postAddress={formData.postAddress}
                            fieldErrors={{}}
                            onAddressChange={(e) => handleNestedChange(e, 'postAddress')}
                            onPostAddressPatch={patchPostAddress}
                        />
                    </section>

                    {/* Dính Nút Submit ở cuối cột phải */}
                    <div className={cx('sticky-action')}>
                        <button type="submit" className={cx('btn-submit')} disabled={isLoading}>
                            {isLoading ? "Đang xử lý..." : <><FiSave /> Lưu thay đổi</>}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default PostEditPage;