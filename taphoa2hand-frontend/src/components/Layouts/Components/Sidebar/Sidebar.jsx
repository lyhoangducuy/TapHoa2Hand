import React, { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./Sidebar.module.scss";
import { 
    FiMenu, FiX, FiChevronRight 
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { getAllCategories } from "../../../../services/categoryService";

const cx = classNames.bind(styles);

function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [categories, setCategories] = useState([]); // Chứa danh sách danh mục từ API
    const navigate = useNavigate();

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

    // Xử lý khi click vào danh mục
    const handleCategoryClick = (categoryId) => {
        setIsOpen(false); // Đóng sidebar
        navigate(`/search?categoryId=${categoryId}`); // Chuyển đến trang search với category filter
    };

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
                            <li 
                                key={item.id} 
                                className={cx("category-item")}
                                onClick={() => handleCategoryClick(item.id)}
                            >
                                <div className={cx("item-left")}>
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