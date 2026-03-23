import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/AuthProvider';

const Header = () => {
    // Lấy trạng thái đăng nhập, thông tin user và hàm logout từ Context
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        // Gọi hàm logout từ AuthProvider
        await logout();
        // Sau khi đăng xuất, chuyển hướng người dùng về trang đăng nhập
        navigate('/login');
    };

    // CSS styles nội bộ (bạn có thể đưa ra file CSS riêng sau)
    const styles = {
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 30px',
            backgroundColor: '#343a40',
            color: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        },
        logo: {
            color: 'white',
            textDecoration: 'none',
            fontSize: '20px',
            fontWeight: 'bold'
        },
        navRight: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
        },
        link: {
            color: '#f8f9fa',
            textDecoration: 'none',
            fontSize: '16px'
        },
        userInfo: {
            color: '#ffc107', // Màu vàng nổi bật
            fontWeight: '500'
        },
        logoutBtn: {
            padding: '6px 15px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
        }
    };

    return (
        <header style={styles.header}>
            <div>
                <Link to="/" style={styles.logo}>🛒 Tạp Hóa 2Hand</Link>
            </div>
            
            <div style={styles.navRight}>
                {isAuthenticated ? (
                    // Nếu đã đăng nhập thì hiện Tên user và Nút Đăng xuất
                    <>
                        <span style={styles.userInfo}>Xin chào, {user?.username || 'Bạn'}!</span>
                        <button onClick={handleLogout} style={styles.logoutBtn}>
                            Đăng xuất
                        </button>
                    </>
                ) : (
                    // Nếu chưa đăng nhập thì hiện Link Đăng nhập / Đăng ký
                    <>
                        <Link to="/login" style={styles.link}>Đăng nhập</Link>
                        <Link to="/register" style={styles.link}>Đăng ký</Link>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;