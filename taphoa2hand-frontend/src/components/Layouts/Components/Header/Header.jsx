import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./Header.module.scss";
import { FiSearch, FiBell, FiMessageSquare, FiUser, FiPlusCircle, FiLogIn, FiChevronDown, FiSettings, FiPackage, FiLogOut } from 'react-icons/fi';

import Sidebar from "../Sidebar/Sidebar";
import { getMyInfo } from "../../../../services/userService";
import { getToken, removeToken } from "../../../../services/localStorageService";

const cx = classNames.bind(styles);

// --- USER DROPDOWN COMPONENT (Chỉ dùng cho Desktop) ---
const UserDropdown = ({ user, onLogout, onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = React.useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={cx("user-dropdown-container")} ref={dropdownRef}>
            <div className={cx("user-trigger")} onClick={() => setIsOpen(!isOpen)}>
                <div className={cx("avatar-circle")}>
                    {user.avatar ? <img src={user.avatar} alt="AVT" /> : <FiUser />}
                </div>
                <FiChevronDown className={cx("chevron", { open: isOpen })} />
            </div>
            {isOpen && (
                <div className={cx("dropdown-menu")}>
                    <div className={cx("user-header")}>
                        <div className={cx("avatar-large")}>
                            {user.avatar ? <img src={user.avatar} alt="AVT" /> : <FiUser />}
                        </div>
                        <div className={cx("user-info")}>
                            <p className={cx("user-name")}>{user.fullName || "Người dùng"}</p>
                            <p className={cx("user-email")}>{user.email || "Thành viên"}</p>
                        </div>
                    </div>
                    <div className={cx("dropdown-divider")}></div>
                    <div className={cx("dropdown-item")} onClick={() => onNavigate('/profile')}>
                        <FiUser className={cx("item-icon")} /> <span>Trang cá nhân</span>
                    </div>
                    <div className={cx("dropdown-item")} onClick={() => onNavigate('/my-orders')}>
                        <FiPackage className={cx("item-icon")} /> <span>Đơn hàng</span>
                    </div>
                    <div className={cx("dropdown-divider")}></div>
                    <div className={cx("dropdown-item", "logout")} onClick={onLogout}>
                        <FiLogOut className={cx("item-icon")} /> <span>Đăng xuất</span>
                    </div>
                </div>
            )}
        </div>
    );
};

function Header() {
    const [isMobile, setIsMobile] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkDevice = () => setIsMobile(window.innerWidth < 768);
        checkDevice();
        window.addEventListener("resize", checkDevice);
        return () => window.removeEventListener("resize", checkDevice);
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            const token = getToken();
            if (token) {
                try {
                    const res = await getMyInfo();
                    if (res.data.code === 1000) setUser(res.data.result);
                } catch { removeToken(); setUser(null); }
            }
        };
        fetchUser();
    }, []);

    const handleLogout = () => {
        removeToken();
        setUser(null);
        navigate('/');
        window.location.reload();
    };

    return (
        <header className={cx("wrapper", { "wrapper-mobile": isMobile })}>
            {isMobile ? (
                <div className={cx("inner-mobile")}>
                    <div className={cx("mobile-top-row")}>
                        <Sidebar />
                        <div className={cx("logo")} onClick={() => navigate('/')}>
                            <span className={cx("logo-text")}>TapHoa<span className={cx("highlight")}>2Hand</span></span>
                        </div>
                        <div className={cx("mobile-actions")}>
                            <FiBell className={cx("icon-mobile")} />
                        </div>
                    </div>
                    <div className={cx("search-wrapper", "mobile-search")}>
                        <input type="text" placeholder="Tìm mua đồ cũ..." className={cx("search-input")} />
                        <button className={cx("search-btn")}><FiSearch /></button>
                    </div>
                </div>
            ) : (
                <div className={cx("inner-desktop")}>
                    <div className={cx("header-left")}>
                        <Sidebar />
                        <div className={cx("logo")} onClick={() => navigate('/')}>
                            <span className={cx("logo-text")}>TapHoa<span className={cx("highlight")}>2Hand</span></span>
                        </div>
                    </div>
                    <div className={cx("search-wrapper")}>
                        <input type="text" placeholder="Tìm kiếm đồ cũ giá hời tại Huế..." className={cx("search-input")} />
                        <button className={cx("search-btn")}><FiSearch /></button>
                    </div>
                    <div className={cx("actions")}>
                        <div className={cx("action-item")}><FiBell className={cx("icon")} /><span>Thông báo</span></div>
                        <div className={cx("action-item")}><FiMessageSquare className={cx("icon")} /><span>Nhắn tin</span></div>
                    </div>
                    <div className={cx("btn-group")}>
                        {!user && (
                            <button className={cx("login-btn")} onClick={() => navigate('/login')}>
                                <FiLogIn /> <span>Đăng nhập</span>
                            </button>
                        )}
                        <button className={cx("post-btn")} onClick={() => navigate('/post')}>
                            <FiPlusCircle /> <span>ĐĂNG TIN</span>
                        </button>
                        {user && <UserDropdown user={user} onLogout={handleLogout} onNavigate={navigate} />}
                    </div>
                </div>
            )}
        </header>
    );
}

export default Header;