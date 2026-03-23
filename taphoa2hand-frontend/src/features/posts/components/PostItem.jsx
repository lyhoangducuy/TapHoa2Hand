import React from 'react';

const PostItem = ({ post }) => {
    // Xử lý logic hiển thị ảnh: Lấy ảnh đầu tiên trong mảng postImages
    // Lưu ý: Sửa lại domain http://localhost:8080 nếu cần
    const imageUrl = post.postImages && post.postImages.length > 0 
        ? `http://localhost:8080/${post.postImages[0].url}` 
        : 'https://via.placeholder.com/250x150?text=No+Image';

    return (
        <div className="post-card" style={styles.card}>
            <img src={imageUrl} alt={post.title} style={styles.image} />
            <div style={styles.content}>
                <h3 style={styles.title} title={post.title}>
                    {post.title.length > 30 ? post.title.substring(0, 30) + '...' : post.title}
                </h3>
                <p style={styles.price}>{post.price.toLocaleString('vi-VN')} đ</p>
                <p style={styles.status}>Tình trạng: {post.status}</p>
                <button style={styles.button}>Xem chi tiết</button>
            </div>
        </div>
    );
};

// Bạn có thể chuyển đống CSS này sang file App.css hoặc index.css cho gọn nhé
const styles = {
    card: { border: '1px solid #e0e0e0', borderRadius: '8px', width: '240px', overflow: 'hidden', backgroundColor: '#fff' },
    image: { width: '100%', height: '160px', objectFit: 'cover' },
    content: { padding: '12px' },
    title: { fontSize: '1rem', margin: '0 0 8px 0', height: '40px' },
    price: { color: '#d32f2f', fontWeight: 'bold', fontSize: '1.1rem', margin: '0 0 8px 0' },
    status: { fontSize: '0.85rem', color: '#666', marginBottom: '12px' },
    button: { width: '100%', padding: '8px', backgroundColor: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

export default PostItem;