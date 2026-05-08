import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import classNames from "classnames/bind";
// Bạn có thể import thẳng file scss của HomePage nếu muốn dùng chung CSS
import styles from "./SearchPage.module.scss"; 

import { searchPosts } from "../../services/postService";
import { getAllCategories } from "../../services/categoryService";

// Hàm format thời gian
const formatTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMs = now - postDate;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
        const hours = Math.floor(diffInHours);
        return `${hours} giờ trước`;
    } else {
        return postDate.toLocaleDateString('vi-VN');
    }
};

function SearchPage() {
    const cx = classNames.bind(styles);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Lấy từ khóa từ thanh tìm kiếm trên Header (nếu có)
    const keywordFromUrl = searchParams.get("keyword") || "";
    const categoryIdFromUrl = searchParams.get("categoryId") || "";

    // Form tìm kiếm
    const [keyword, setKeyword] = useState(keywordFromUrl);
    const [location, setLocation] = useState("");
    const [categoryId, setCategoryId] = useState(categoryIdFromUrl);
    const [postType, setPostType] = useState("");
    
    // Dữ liệu & Phân trang
    const [categories, setCategories] = useState([]);
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false); // Cờ kiểm tra đã call API chưa
    
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Load danh mục khi mới vào trang
    useEffect(() => {
        const fetchCategories = async () => {
            const data = await getAllCategories();
            setCategories(data.result || data);
        };
        fetchCategories();
    }, []);

    // Cập nhật categoryId khi có categoryIdFromUrl
    useEffect(() => {
        if (categoryIdFromUrl) {
            setCategoryId(categoryIdFromUrl);
        }
    }, [categoryIdFromUrl]);

    // Hàm gọi API dùng chung
    const fetchSearchResults = async (targetPage = 0, currentKeyword = keyword) => {
        setIsLoading(true);
        try {
            console.log("Searching with params:", {
                keyword: currentKeyword,
                location,
                categoryId,
                postType,
                page: targetPage,
                size: 10
            });

            const data = await searchPosts(currentKeyword, location, categoryId, postType, targetPage, 10);
            
            console.log("Search response:", data);
            const pageData = data.result; 
            setResults(pageData.content || []);
            setTotalPages(pageData.totalPages || 0);
            setCurrentPage(targetPage);
            setHasSearched(true);

            console.log("Search results:", pageData.content?.length || 0, "posts found");
        } catch (error) {
            console.error("Lỗi tìm kiếm", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Tự động tìm kiếm khi vừa chuyển từ Header sang có kèm keyword hoặc categoryId
    useEffect(() => {
        if (keywordFromUrl || categoryIdFromUrl) {
            fetchSearchResults(0, keywordFromUrl);
        }
    }, [keywordFromUrl, categoryIdFromUrl]);

    // Khi người dùng bấm nút Tìm kiếm trên trang này
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchSearchResults(0, keyword);
    };

    // Khi bấm nút chuyển trang
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchSearchResults(newPage, keyword);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Hàm xử lý khi click vào sản phẩm
    const handleProductClick = (id) => {
        navigate(`/post-detail/${id}`);
    };

    // Tìm tên category từ categoryId
    const getCategoryName = (catId) => {
        const category = categories.find(cat => cat.id === catId);
        return category ? category.name : "";
    };

    return (  
        <div className={cx('wrapper')} style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
            <h2 className={cx('page-title')}>
                {categoryIdFromUrl ? `Tìm kiếm trong danh mục: ${getCategoryName(categoryIdFromUrl)}` : 'Tìm kiếm sản phẩm'}
                {categoryIdFromUrl && (
                    <button 
                        onClick={() => {
                            setCategoryId("");
                            navigate('/search');
                        }}
                        style={{ 
                            marginLeft: "10px", 
                            padding: "5px 10px", 
                            background: "#ff4444", 
                            color: "white", 
                            border: "none", 
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px"
                        }}
                    >
                        Xóa bộ lọc
                    </button>
                )}
            </h2>
            
            {/* Form tìm kiếm */}
            <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "10px", marginBottom: "30px", flexWrap: "wrap" }}>
                <input 
                    type="text" placeholder="Từ khóa..." value={keyword}
                    onChange={(e) => setKeyword(e.target.value)} 
                    style={{ flex: "1 1 300px", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                />
                <input 
                    type="text" placeholder="Địa điểm (Tỉnh, phường...)" value={location}
                    onChange={(e) => setLocation(e.target.value)} 
                    style={{ flex: "1 1 200px", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                />
                <select 
                    value={categoryId} 
                    onChange={(e) => setCategoryId(e.target.value)} 
                    style={{ flex: "1 1 200px", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                >
                    <option value="">Tất cả danh mục</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <select 
                    value={postType} 
                    onChange={(e) => setPostType(e.target.value)} 
                    style={{ flex: "1 1 200px", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                >
                    <option value="">Tất cả loại</option>
                    <option value="SELL">Tin rao bán</option>
                    <option value="BUY">Tin cần mua</option>
                </select>
                <button type="submit" disabled={isLoading} style={{ padding: "10px 20px", cursor: "pointer", background: "#ff9900", color: "#fff", border: "none", borderRadius: "5px", fontWeight: "bold" }}>
                    Tìm kiếm
                </button>
            </form>

            {/* Hiển thị kết quả */}
            <div>
                {isLoading ? (
                    <div className={cx('loading')}>Đang tìm kiếm...</div>
                ) : (
                    <>
                        {hasSearched && results.length === 0 ? (
                            <p style={{ textAlign: "center", color: "#666", marginTop: "50px" }}>
                                Không tìm thấy sản phẩm nào phù hợp với điều kiện của bạn.
                            </p>
                        ) : (
                            <div className={cx('product-grid')}>
                                {results.map((post) => (
                                    <div
                                        key={post.id}
                                        className={cx('product-card')}
                                        onClick={() => handleProductClick(post.id)}
                                    >
                                        <div className={cx('image-wrapper')}>
                                            {post.postImages && post.postImages.length > 0 ? (
                                                <img src={post.postImages[0].imageUrl} alt={post.title} />
                                            ) : (
                                                <div className={cx('no-image')}>Không ảnh</div>
                                            )}
                                        </div>

                                        <div className={cx('info-wrapper')}>
                                            <div className={cx('badges')}>
                                                <span className={cx('status-badge', String(post.status?.name || '').toLowerCase())}>
                                                    {post.status?.displayName || post.status}
                                                </span>
                                            </div>

                                            <h3 className={cx('post-title')}>{post.title}</h3>
                                            <p className={cx('price')}>
                                                {post.price?.toLocaleString('vi-VN')} đ
                                            </p>

                                            <div className={cx('meta-info')}>
                                                <span>{post.viewCount || 0} lượt xem</span>
                                                <span>•</span>
                                                <span>{formatTimeAgo(post.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* UI Phân trang */}
                        {totalPages > 1 && (
                            <div style={{ display: "flex", justifyContent: "center", gap: "15px", marginTop: "40px", alignItems: "center" }}>
                                <button 
                                    disabled={currentPage === 0} 
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    style={{ 
                                        padding: "8px 16px", 
                                        cursor: currentPage === 0 ? "not-allowed" : "pointer",
                                        background: currentPage === 0 ? "#ccc" : "#f1f1f1",
                                        border: "1px solid #ddd",
                                        borderRadius: "5px"
                                    }}
                                >
                                    Trang trước
                                </button>
                                
                                <span style={{ fontWeight: "bold" }}>Trang {currentPage + 1} / {totalPages}</span>
                                
                                <button 
                                    disabled={currentPage === totalPages - 1} 
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    style={{ 
                                        padding: "8px 16px", 
                                        cursor: currentPage === totalPages - 1 ? "not-allowed" : "pointer",
                                        background: currentPage === totalPages - 1 ? "#ccc" : "#f1f1f1",
                                        border: "1px solid #ddd",
                                        borderRadius: "5px"
                                    }}
                                >
                                    Trang sau
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default SearchPage;