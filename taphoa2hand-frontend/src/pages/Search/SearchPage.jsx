import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import classNames from "classnames/bind";
// Bạn có thể import thẳng file scss của HomePage nếu muốn dùng chung CSS
import styles from "./SearchPage.module.scss"; 
import { FiRefreshCcw } from 'react-icons/fi';

import { searchPosts } from "../../services/postService";
import { getAllCategories } from "../../services/categoryService";

// Hàm format thời gian
const formatTimeAgo = (dateString) => {
    if (!dateString) return '';

    const now = new Date();
    const postDate = new Date(dateString);

    if (isNaN(postDate.getTime())) return '';

    const diffInMs = now - postDate;
    const diffInSeconds = diffInMs / 1000;
    const diffInMinutes = diffInSeconds / 60;
    const diffInHours = diffInMinutes / 60;

    if (diffInSeconds < 60) {
        return `${Math.floor(diffInSeconds)} giây trước`;
    } else if (diffInMinutes < 60) {
        return `${Math.floor(diffInMinutes)} phút trước`;
    } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} giờ trước`;
    } else {
        return postDate.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(10000000); // Max 10 triệu VND
    const [sortBy, setSortBy] = useState(""); // "" = mặc định, "price_asc", "price_desc"
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    
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

    // Sync price range sliders
    useEffect(() => {
        if (minPrice > maxPrice) {
            setMinPrice(maxPrice);
        }
    }, [maxPrice, minPrice]);

    const formatPriceValue = (value) => {
        return Number(value).toLocaleString('vi-VN');
    };

    const parsePriceInput = (value) => {
        const numeric = Number(value.replace(/\D/g, ''));
        return Number.isNaN(numeric) ? 0 : numeric;
    };

    const handleMinPriceInput = (value) => {
        const parsed = parsePriceInput(value);
        const valid = Math.min(parsed, maxPrice);
        setMinPrice(valid);
    };

    const handleMaxPriceInput = (value) => {
        const parsed = parsePriceInput(value);
        const valid = Math.max(parsed, minPrice);
        setMaxPrice(valid);
    };

    // Hàm xử lý chọn nhanh ngày
    const getDateString = (date) => {
        return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
    };

    const setToday = () => {
        const today = new Date();
        setDateFrom(getDateString(today));
        setDateTo(getDateString(today));
    };

    const setYesterday = () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        setDateFrom(getDateString(yesterday));
        setDateTo(getDateString(yesterday));
    };

    const setLast7Days = () => {
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        setDateFrom(getDateString(sevenDaysAgo));
        setDateTo(getDateString(today));
    };

    const setLast30Days = () => {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        setDateFrom(getDateString(thirtyDaysAgo));
        setDateTo(getDateString(today));
    };

    const clearDateFilter = () => {
        setDateFrom("");
        setDateTo("");
    };

    // Hàm gọi API dùng chung
    const fetchSearchResults = async (targetPage = 0, currentKeyword = keyword) => {
        setIsLoading(true);
        try {
            console.log("Searching with params:", {
                keyword: currentKeyword,
                location,
                categoryId,
                postType,
                minPrice: minPrice === 0 ? null : minPrice,
                maxPrice: maxPrice === 10000000 ? null : maxPrice,
                dateFrom,
                dateTo,
                sortBy,
                page: targetPage,
                size: 10
            });

            const data = await searchPosts(
                currentKeyword, 
                location, 
                categoryId, 
                postType, 
                minPrice === 0 ? null : minPrice, 
                maxPrice === 10000000 ? null : maxPrice,
                dateFrom,
                dateTo,
                sortBy, 
                targetPage, 
                10
            );
            
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
            <form onSubmit={handleSearchSubmit} className={cx('search-form')}>
                {/* Hàng 1: Từ khóa và địa điểm */}
                <div className={cx('form-row')}>
                    <div className={cx('form-group', 'keyword-group')}>
                        <label>Từ khóa</label>
                        <input 
                            type="text" placeholder="Nhập từ khóa tìm kiếm..." value={keyword}
                            onChange={(e) => setKeyword(e.target.value)} 
                        />
                    </div>
                    <div className={cx('form-group', 'location-group')}>
                        <label>Địa điểm</label>
                        <input 
                            type="text" placeholder="Tỉnh, thành phố..." value={location}
                            onChange={(e) => setLocation(e.target.value)} 
                        />
                    </div>
                </div>

                {/* Hàng 2: Price và Date */}
                <div className={cx('form-row')}>
                    <div className={cx('form-group', 'price-group')}>
                        <div className={cx('price-header')}>
                            <label>Khoảng giá: {formatPriceValue(minPrice)}đ - {formatPriceValue(maxPrice)}đ</label>
                            <button 
                                type="button" 
                                className={cx('reset-price-btn')}
                                onClick={() => {
                                    setMinPrice(0);
                                    setMaxPrice(10000000);
                                }}
                                title="Đặt lại khoảng giá"
                            >
                                <FiRefreshCcw size={16} />
                            </button>
                        </div>
                        <div className={cx('price-inputs')}>
                            <div className={cx('price-field')}>
                                <input
                                    type="text"
                                    value={formatPriceValue(minPrice)}
                                    onChange={(e) => handleMinPriceInput(e.target.value)}
                                    placeholder="Min"
                                />
                                <span>đ</span>
                            </div>
                            <div className={cx('price-field')}>
                                <input
                                    type="text"
                                    value={formatPriceValue(maxPrice)}
                                    onChange={(e) => handleMaxPriceInput(e.target.value)}
                                    placeholder="Max"
                                />
                                <span>đ</span>
                            </div>
                        </div>
                        <div className={cx('price-range')}>
                            <input 
                                type="range" 
                                min="0" 
                                max="10000000" 
                                step="100000"
                                value={minPrice}
                                onChange={(e) => setMinPrice(Number(e.target.value))} 
                                className={cx('price-slider')}
                            />
                            <input 
                                type="range" 
                                min="0" 
                                max="10000000" 
                                step="100000"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(Number(e.target.value))} 
                                className={cx('price-slider')}
                            />
                        </div>
                    </div>
                    <div className={cx('form-group', 'date-group')}>
                        <label>Ngày đăng</label>
                        <div className={cx('date-inputs')}>
                            <input 
                                type="date" 
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)} 
                                placeholder="Từ ngày"
                            />
                            <span className={cx('date-separator')}>đến</span>
                            <input 
                                type="date" 
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)} 
                                placeholder="Đến ngày"
                            />
                        </div>
                        <div className={cx('quick-date-buttons')}>
                            <button type="button" onClick={setToday} className={cx('quick-date-btn')}>Hôm nay</button>
                            <button type="button" onClick={setYesterday} className={cx('quick-date-btn')}>Hôm qua</button>
                            <button type="button" onClick={setLast7Days} className={cx('quick-date-btn')}>7 ngày</button>
                            <button type="button" onClick={setLast30Days} className={cx('quick-date-btn')}>30 ngày</button>
                            <button type="button" onClick={clearDateFilter} className={cx('clear-date-btn')}>Xóa</button>
                        </div>
                    </div>
                </div>

                <div className={cx('form-row', 'bottom-row')}>
                    <div className={cx('form-group', 'category-group')}>
                        <label>Danh mục</label>
                        <select 
                            value={categoryId} 
                            onChange={(e) => setCategoryId(e.target.value)} 
                        >
                            <option value="">Tất cả danh mục</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className={cx('form-group', 'type-group')}>
                        <label>Loại tin</label>
                        <select 
                            value={postType} 
                            onChange={(e) => setPostType(e.target.value)} 
                        >
                            <option value="">Tất cả loại</option>
                            <option value="SELL">Tin rao bán</option>
                            <option value="BUY">Tin cần mua</option>
                        </select>
                    </div>
                    <div className={cx('form-group', 'sort-group')}>
                        <label>Sắp xếp</label>
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)} 
                        >
                            <option value="">Mặc định</option>
                            <option value="price_asc">Giá: Thấp đến cao</option>
                            <option value="price_desc">Giá: Cao đến thấp</option>
                        </select>
                    </div>
                    <button type="submit" disabled={isLoading} className={cx('search-button')}>
                        {isLoading ? 'Đang tìm...' : 'Tìm kiếm'}
                    </button>
                </div>
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
                                                {post.postType && (
                                                    <span className={cx('type-badge', post.postType.name?.toLowerCase() || 'sell')}>
                                                        {post.postType.displayName || post.postType.name || 'Tin rao bán'}
                                                    </span>
                                                )}
                                                {post.status && (
                                                    <span className={cx('status-badge', post.status.name?.toLowerCase() || 'available')}>
                                                        {post.status.displayName || post.status.name || 'Đang bán'}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className={cx('post-title')}>{post.title}</h3>
                                            <p className={cx('price')}>
                                                {post.price?.toLocaleString('vi-VN')} đ
                                            </p>
                                            <p className={cx('post-time')}>{formatTimeAgo(post.createdAt)}</p>

                                            {/* Payment methods */}
                                            {post.acceptedPaymentMethods && post.acceptedPaymentMethods.length > 0 && (
                                                <div className={cx('payments')}>
                                                    {post.acceptedPaymentMethods.map((pm) => (
                                                        <span key={pm.name} className={cx('payment-badge')}>
                                                            {pm.description || pm.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
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