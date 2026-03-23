import React from 'react';
import { useAuth } from '../app/AuthProvider';

const HomePage = () => {
    const { isAuthenticated, user } = useAuth();

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Chào mừng đến với Tạp hóa 2Hand</h1>
            
            {isAuthenticated ? (
                <div>
                    <p>Chào bạn <strong>{user?.fullName || user?.username}</strong>, chúc bạn mua sắm vui vẻ!</p>
                    {/* Ở đây sau này bạn sẽ render danh sách sản phẩm */}
                </div>
            ) : (
                <div>
                    <p>Vui lòng đăng nhập để xem thông tin chi tiết và đặt hàng.</p>
                </div>
            )}
        </div>
    );
};

export default HomePage;