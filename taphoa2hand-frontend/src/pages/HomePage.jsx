import React from 'react';
import { useAuth } from '../app/AuthProvider';
import PostList from '../features/posts/components/PostList';

const HomePage = () => {
    const { isAuthenticated, user } = useAuth();

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Chào mừng đến với Tạp hóa 2Hand</h1>
            
            {isAuthenticated ? (
                <div>
                    <p>Chào bạn <strong>{user?.fullName || user?.username}</strong>, chúc bạn mua sắm vui vẻ!</p>
                    <PostList />
                </div>
            ) : (
                <div>
                    <p>Vui lòng đăng nhập để xem thông tin chi tiết và đặt hàng.</p>
                    <PostList />
                </div>
            )}
        </div>
    );
};

export default HomePage;