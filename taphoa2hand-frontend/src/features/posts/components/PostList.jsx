import React, { useState, useEffect } from 'react';
import { postsApi } from '../api/postsApi';
import PostItem from './PostItem';

const PostList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const response = await postsApi.getAllPosts();
                console.log("QUAN TRỌNG - Dữ liệu BE trả về là:", response);
                
                // Trích xuất mảng result từ response của BE
                // Tùy cách cấu hình axiosClient mà response có thể đã là data luôn, bạn log ra check thử nhé
                // ... (phần code trên giữ nguyên)
console.log("QUAN TRỌNG - Dữ liệu BE trả về là:", response);

// --- BẮT ĐẦU SỬA TỪ ĐÂY ---
let data = [];
if (Array.isArray(response)) {
    // Trường hợp 1: axiosClient đã bóc sẵn data, response chính là cái mảng luôn
    data = response; 
} else if (response?.result) {
    // Trường hợp 2: Backend trả về cục object có chứa biến result
    data = response.result; 
} else if (response?.data?.result) {
    // Trường hợp 3: Nguyên gốc của axios chưa qua xử lý
    data = response.data.result; 
}

// Log thêm 1 phát nữa để chắc chắn mình đã "bắt" đúng cái mảng
console.log("Mảng dữ liệu sau khi bóc tách:", data);

setPosts(data);
// --- KẾT THÚC PHẦN SỬA ---
            } catch (err) {
                console.error("Lỗi khi tải bài viết:", err);
                setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau!');
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '20px' }}>Đang tải danh sách... ⏳</div>;
    if (error) return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;
    if (posts.length === 0) return <div style={{ textAlign: 'center' }}>Hiện chưa có bài đăng nào.</div>;

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {posts.map(post => (
                <PostItem key={post.id} post={post} />
            ))}
        </div>
    );
};

export default PostList;