import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { getActiveBanners } from '../../services/bannerService';

// Import CSS mặc định của Swiper
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
 // File CSS của riêng bạn nếu cần

export default function BannerSlider() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Giả lập gọi API lấy danh sách Banner từ Backend
        const fetchBanners = async () => {
            try {
                const response = await getActiveBanners();
                if (response && response.code === 1000) {
                    setBanners(response.result || []);
                }
            } catch (error) {
                console.error("Lỗi lấy banner:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, []);

    if (loading) return <div className="skeleton-banner">Đang tải banner...</div>;
    
    // Nếu không có banner nào đang active thì ẩn luôn khu vực này
    if (banners.length === 0) return null;

    return (
        <div className="banner-container" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            <Swiper
                modules={[Autoplay, Pagination, Navigation]}
                spaceBetween={0} // Khoảng cách giữa các ảnh
                slidesPerView={1} // Hiện 1 ảnh 1 lúc
                loop={true}       // Chạy lặp lại vô tận
                autoplay={{
                    delay: 3000,  // Tự động chuyển sau 3 giây
                    disableOnInteraction: false, // Vẫn tự chạy sau khi user vuốt
                }}
                pagination={{ clickable: true }} // Dấu chấm ở dưới
                navigation={true} // Nút Next/Prev
                style={{ borderRadius: '12px', overflow: 'hidden' }} // Bo góc cho đẹp
            >
                {banners.map((banner) => (
                    <SwiperSlide key={banner.id}>
                        <a href={banner.targetUrl || '#'} style={{ display: 'block' }}>
                            <img 
                                src={banner.imageDesktop} 
                                alt={banner.title || 'Banner quảng cáo'} 
                                style={{ width: '100%', height: '300px', objectFit: 'cover' }}
                            />
                        </a>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}