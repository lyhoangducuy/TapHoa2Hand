import React, { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./Footer.module.scss";
import { FiFacebook, FiInstagram, FiYoutube, FiPhone, FiMail } from 'react-icons/fi';

const cx = classNames.bind(styles);

// ==========================================
// BẢN THIẾT KẾ 1: DÀNH CHO MÁY TÍNH (PC)
// ==========================================
const DesktopFooter = () => (
    <div className={cx("inner-desktop")}>
        {/* Cột 1: Thông tin thương hiệu */}
        <div className={cx("col")}>
            <div className={cx("logo")}>
                <span className={cx("logo-text")}>TapHoa<span className={cx("highlight")}>2Hand</span></span>
            </div>
            <p className={cx("desc")}>
                Nền tảng trao đổi, mua bán đồ cũ uy tín, nhanh chóng và đậm chất tình người xứ Huế.
            </p>
        </div>

        {/* Cột 2: Hỗ trợ khách hàng */}
        <div className={cx("col")}>
            <h3 className={cx("title")}>Về chúng tôi</h3>
            <ul className={cx("links")}>
                <li>Giới thiệu TapHoa2Hand</li>
                <li>Quy chế hoạt động</li>
                <li>Chính sách bảo mật</li>
                <li>Giải quyết tranh chấp</li>
            </ul>
        </div>

        {/* Cột 3: Liên hệ & Mạng xã hội */}
        <div className={cx("col")}>
            <h3 className={cx("title")}>Liên hệ</h3>
            <ul className={cx("contact-info")}>
                <li><FiPhone className={cx("icon")} /> 1900 xxxx</li>
                <li><FiMail className={cx("icon")} /> hotro@taphoa2hand.vn</li>
            </ul>
            <div className={cx("socials")}>
                <div className={cx("social-icon")}><FiFacebook /></div>
                <div className={cx("social-icon")}><FiInstagram /></div>
                <div className={cx("social-icon")}><FiYoutube /></div>
            </div>
        </div>
    </div>
);

// ==========================================
// BẢN THIẾT KẾ 2: DÀNH CHO ĐIỆN THOẠI (MOBILE)
// ==========================================
const MobileFooter = () => (
    <div className={cx("inner-mobile")}>
        <div className={cx("logo")}>
            <span className={cx("logo-text")}>TapHoa<span className={cx("highlight")}>2Hand</span></span>
        </div>
        
        {/* Các liên kết quan trọng xếp ngang hoặc dọc */}
        <div className={cx("mobile-links")}>
            <span>Quy chế</span>
            <span>Bảo mật</span>
            <span>Hỗ trợ</span>
        </div>

        <div className={cx("socials")}>
            <div className={cx("social-icon")}><FiFacebook /></div>
            <div className={cx("social-icon")}><FiInstagram /></div>
            <div className={cx("social-icon")}><FiYoutube /></div>
        </div>
    </div>
);

// ==========================================
// COMPONENT CHÍNH
// ==========================================
function Footer() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkDevice = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkDevice();
        window.addEventListener("resize", checkDevice);
        return () => window.removeEventListener("resize", checkDevice);
    }, []);

    return (  
        <footer className={cx("wrapper", { "wrapper-mobile": isMobile })}>
            <div className={cx("container")}>
                {isMobile ? <MobileFooter /> : <DesktopFooter />}
                
                {/* Dòng Copyright chung cho cả 2 bản */}
                <div className={cx("copyright")}>
                    <p>&copy; 2026 TapHoa2Hand. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;