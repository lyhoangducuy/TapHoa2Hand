import React, { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./Header.module.scss";
// Thêm icon FiLogIn cho nút đăng nhập
import { FiSearch, FiBell, FiMessageSquare, FiUser, FiPlusCircle, FiLogIn } from 'react-icons/fi';
import Sidebar from "../Sidebar/Sidebar";
const cx = classNames.bind(styles);

// ==========================================
// BẢN THIẾT KẾ 1: PC
// ==========================================
const DesktopHeader = () => (
    <div className={cx("inner-desktop")}>
        
        {/* Bọc Sidebar và Logo */}
        <div className={cx("header-left")}>
            <Sidebar />
            <div className={cx("logo")}>
                <span className={cx("logo-text")}>TapHoa<span className={cx("highlight")}>2Hand</span></span>
            </div>
        </div>

        <div className={cx("search-wrapper")}>
            <input type="text" placeholder="Tìm kiếm đồ cũ giá hời tại Huế..." className={cx("search-input")} />
            <button className={cx("search-btn")}><FiSearch /></button>
        </div>

        <div className={cx("actions")}>
            <div className={cx("action-item")}>
                <FiBell className={cx("icon")} /><span>Thông báo</span>
            </div>
            <div className={cx("action-item")}>
                <FiMessageSquare className={cx("icon")} /><span>Nhắn tin</span>
            </div>
            <div className={cx("action-item")}>
                <FiUser className={cx("icon")} /><span>Cá nhân</span>
            </div>
        </div>

        {/* Khu vực nút Đăng nhập và Đăng tin */}
        <div className={cx("btn-group")}>
            <button className={cx("login-btn")}>
                <FiLogIn className={cx("icon-login")} />
                <span>Đăng nhập</span>
            </button>

            <button className={cx("post-btn")}>
                <FiPlusCircle className={cx("icon-post")} />
                <span>ĐĂNG TIN</span>
            </button>
        </div>
        
    </div>
);

// ==========================================
// BẢN THIẾT KẾ 2: MOBILE
// ==========================================
const MobileHeader = () => (
    <div className={cx("inner-mobile")}>
        <div className={cx("mobile-top-row")}>
            
            <div className={cx("header-left")}>
                <Sidebar />
                <div className={cx("logo")}>
                    <span className={cx("logo-text")}>TapHoa<span className={cx("highlight")}>2Hand</span></span>
                </div>
            </div>

            <div className={cx("mobile-actions")}>
                <FiBell className={cx("icon-mobile")} />
                <FiMessageSquare className={cx("icon-mobile")} />
                <FiUser className={cx("icon-mobile")} />
            </div>
        </div>

        <div className={cx("search-wrapper", "mobile-search")}>
            <input type="text" placeholder="Bạn muốn tìm mua gì hôm nay?" className={cx("search-input")} />
            <button className={cx("search-btn")}><FiSearch /></button>
        </div>
    </div>
);

function Header() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkDevice = () => { setIsMobile(window.innerWidth < 768); };
        checkDevice();
        window.addEventListener("resize", checkDevice);
        return () => window.removeEventListener("resize", checkDevice);
    }, []);

    return (  
        <header className={cx("wrapper", { "wrapper-mobile": isMobile })}>
            {isMobile ? <MobileHeader /> : <DesktopHeader />}
        </header>
    );
}

export default Header;