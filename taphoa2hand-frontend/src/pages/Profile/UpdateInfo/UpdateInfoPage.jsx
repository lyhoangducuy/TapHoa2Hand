import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './UpdateInfoPage.module.scss';
import { getMyInfo, updateUserInfo } from '../../../services/userService'; 
import { FiUser, FiPhone, FiMapPin, FiSave, FiX, FiMail, FiAtSign } from 'react-icons/fi';

const cx = classNames.bind(styles);

function UpdateProfilePage() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Bổ sung đầy đủ các trường khớp với DTO Backend
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await getMyInfo();
                if (response.data.code === 1000) {
                    const user = response.data.result;
                    setUserId(user.id);
                    setFormData({
                        fullName: user.fullName || '',
                        username: user.username || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        address: user.address || ''
                    });
                }
            } catch (error) {
                console.error("Lỗi khi tải thông tin:", error);
                alert("Không thể tải thông tin. Vui lòng thử lại!");
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId) return;

        setSaving(true);
        try {
            const data = await updateUserInfo(userId, formData);
            
            if (data.code === 1000) {
                alert("Cập nhật thông tin thành công!");
                navigate('/profile');
            } else {
                // Xử lý báo lỗi từ Spring Boot Validator (nếu có)
                alert("Lỗi: " + data.message);
            }
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            alert("Đã xảy ra lỗi hệ thống khi cập nhật!");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className={cx('loading')}>Đang tải dữ liệu...</div>;

    return (
        <div className={cx('wrapper')}>
            <div className={cx('form-card')}>
                <div className={cx('form-header')}>
                    <h2>Chỉnh sửa hồ sơ</h2>
                    <p>Cập nhật thông tin cá nhân của bạn</p>
                </div>

                <form onSubmit={handleSubmit} className={cx('edit-form')}>
                    
                    {/* Họ và tên */}
                    <div className={cx('form-group')}>
                        <label><FiUser className={cx('icon')} /> Họ và tên</label>
                        <input 
                            type="text" 
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Ví dụ: Nguyễn Văn A"
                            required
                            minLength={3}
                            maxLength={50}
                            title="Họ và tên phải từ 3 đến 50 ký tự"
                        />
                    </div>

                    {/* Username */}
                    <div className={cx('form-group')}>
                        <label><FiAtSign className={cx('icon')} /> Tên đăng nhập</label>
                        <input 
                            type="text" 
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Ví dụ: nguyenvana123"
                            required
                            minLength={3}
                            maxLength={50}
                            title="Tên đăng nhập phải từ 3 đến 50 ký tự"
                        />
                    </div>

                    {/* Email */}
                    <div className={cx('form-group')}>
                        <label><FiMail className={cx('icon')} /> Email</label>
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Ví dụ: email@domain.com"
                            required
                        />
                    </div>

                    {/* Số điện thoại */}
                    <div className={cx('form-group')}>
                        <label><FiPhone className={cx('icon')} /> Số điện thoại</label>
                        <input 
                            type="tel" 
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Nhập số điện thoại"
                        />
                    </div>

                    {/* Địa chỉ */}
                    <div className={cx('form-group')}>
                        <label><FiMapPin className={cx('icon')} /> Địa chỉ giao hàng</label>
                        <textarea 
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Nhập địa chỉ chi tiết (Số nhà, đường, phường/xã...)"
                            rows="3"
                        ></textarea>
                    </div>

                    {/* Nút bấm */}
                    <div className={cx('action-buttons')}>
                        <button 
                            type="button" 
                            className={cx('btn-cancel')} 
                            onClick={() => navigate('/profile')}
                            disabled={saving}
                        >
                            <FiX /> Hủy
                        </button>
                        <button 
                            type="submit" 
                            className={cx('btn-save')}
                            disabled={saving}
                        >
                            {saving ? 'Đang lưu...' : <><FiSave /> Lưu thay đổi</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UpdateProfilePage;