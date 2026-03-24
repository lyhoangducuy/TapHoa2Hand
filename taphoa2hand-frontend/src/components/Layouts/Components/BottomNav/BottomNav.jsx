import React from 'react';
import classNames from 'classnames/bind';
import styles from './BottomNav.module.scss'; // Phải import đúng tên file SCSS của bạn
import { FiHome, FiFileText, FiPlus, FiMessageSquare, FiUser } from 'react-icons/fi'; // Nhớ cài react-icons

const cx = classNames.bind(styles);

function BottomNav() {
    return (
        // BẮT BUỘC PHẢI DÙNG cx('tên-class') THÌ NÓ MỚI NHẬN CSS
        <div className={cx('bottom-nav')}>
            
            <div className={cx('nav-item', 'active')}>
                <FiHome className={cx('icon')} />
                <span>Trang chủ</span>
            </div>
            
            <div className={cx('nav-item')}>
                <FiFileText className={cx('icon')} />
                <span>Quản lý tin</span>
            </div>

            {/* Nút Đăng tin lồi lên */}
            <div className={cx('nav-item', 'post-btn-wrapper')}>
                <div className={cx('post-btn-circle')}>
                    <FiPlus className={cx('plus-icon')} />
                </div>
                <span className={cx('post-text')}>Đăng tin</span>
            </div>

            <div className={cx('nav-item')}>
                <FiMessageSquare className={cx('icon')} />
                <span>Liên hệ</span>
            </div>
            
            <div className={cx('nav-item')}>
                <FiUser className={cx('icon')} />
                <span>Thêm</span>
            </div>

        </div>
    );
}

export default BottomNav;