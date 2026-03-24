import React, { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./Sidebar.module.scss";
import { FiMenu, FiX, FiSmartphone, FiMonitor, FiHome, FiTruck, FiShoppingBag, FiCoffee, FiChevronRight } from 'react-icons/fi';

const cx = classNames.bind(styles);

const categories = [
    { id: 1, name: "Điện thoại", icon: <FiSmartphone /> },
    { id: 2, name: "Đồ điện tử", icon: <FiMonitor /> },
    { id: 3, name: "Bất động sản", icon: <FiHome /> },
    { id: 4, name: "Xe cộ", icon: <FiTruck /> },
    { id: 5, name: "Thời trang", icon: <FiShoppingBag /> },
    { id: 6, name: "Gia dụng", icon: <FiCoffee /> },
];

function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <>
            {/* 1. NÚT ĐỂ MỞ SIDEBAR (Đã được CSS chìm vào Header) */}
            <button className={cx("toggle-btn")} onClick={() => setIsOpen(true)}>
                <FiMenu className={cx("menu-icon")} />
            </button>

            {/* 2. LỚP PHỦ MÀN ĐEN (OVERLAY) */}
            <div 
                className={cx("overlay", { "show": isOpen })} 
                onClick={() => setIsOpen(false)}
            ></div>

            {/* 3. SIDEBAR PANEL (NGĂN KÉO) */}
            <aside className={cx("sidebar-panel", { "open": isOpen })}>
                <div className={cx("sidebar-header")}>
                    <div className={cx("logo")}>
                        <span className={cx("logo-text")}>TapHoa<span className={cx("highlight")}>2Hand</span></span>
                    </div>
                    <button className={cx("close-btn")} onClick={() => setIsOpen(false)}>
                        <FiX />
                    </button>
                </div>

                <div className={cx("sidebar-content")}>
                    <h3 className={cx("title")}>Khám phá danh mục</h3>
                    <ul className={cx("category-list")}>
                        {categories.map((item) => (
                            <li key={item.id} className={cx("category-item")}>
                                <div className={cx("item-left")}>
                                    <span className={cx("icon")}>{item.icon}</span>
                                    <span className={cx("text")}>{item.name}</span>
                                </div>
                                <FiChevronRight className={cx("arrow-icon")} />
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;