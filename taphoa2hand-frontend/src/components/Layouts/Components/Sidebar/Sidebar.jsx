import React, { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./Sidebar.module.scss";
import { 
    FiMenu, FiX, FiSmartphone, FiMonitor, FiHome, 
    FiTruck, FiShoppingBag, FiCoffee, FiChevronRight, FiList 
} from 'react-icons/fi';// Nhớ sửa lại đường dẫn import cho đúng với project của bạn
import { getAllCategories } from "../../../../services/categoryService";

const cx = classNames.bind(styles);

// Hàm hỗ trợ tự động chọn icon dựa theo tên danh mục trả về từ API
const getCategoryIcon = (categoryName) => {
    if (!categoryName) return <FiList />; // Icon mặc định
    
    const name = categoryName.toLowerCase();
    if (name.includes("điện thoại")) return <FiSmartphone />;
    if (name.includes("điện tử") || name.includes("công nghệ")) return <FiMonitor />;
    if (name.includes("bất động sản") || name.includes("nhà")) return <FiHome />;
    if (name.includes("xe")) return <FiTruck />;
    if (name.includes("thời trang") || name.includes("quần áo")) return <FiShoppingBag />;
    if (name.includes("gia dụng")) return <FiCoffee />;
    
    return <FiList />; // Icon mặc định cho các danh mục khác
};

function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [categories, setCategories] = useState([]); // Chứa danh sách danh mục từ API

    // Xử lý scroll body khi mở Sidebar
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

    // Gọi API lấy danh mục khi component vừa render
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const responseData = await getAllCategories();
                // Tùy thuộc vào cấu trúc ApiResponse của Spring Boot. 
                // Nếu backend trả về format: { code, message, result: [...] } thì dùng responseData.result
                // Nếu service của bạn đã tự bóc tách ra mảng rồi thì chỉ cần setCategories(responseData)
                setCategories(responseData.result || responseData); 
            } catch (error) {
                console.error("Lỗi khi tải danh mục:", error);
            }
        };

        fetchCategories();
    }, []);

    return (
        <>
            {/* 1. NÚT ĐỂ MỞ SIDEBAR */}
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
                                    {/* Render icon động */}
                                    <span className={cx("icon")}>{getCategoryIcon(item.name)}</span>
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