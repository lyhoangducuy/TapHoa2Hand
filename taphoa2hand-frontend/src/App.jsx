import React, { Fragment } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// 1. Nhớ import đủ cả 3 mảng routes nhé
import { publicRoutes, privateRoutes, adminRoutes } from './routes/AppRoutes'; 
import DefaultLayout from './components/Layouts/DefaultLayout/DefaultLayout';
// 2. Import "Chú bảo vệ" đã tạo ở bước trước
import { ProtectedRoute } from './components/ProtectedRoute';
import ChatBox from './pages/ChatBox/ChatBox';

function App() {
    // Viết một hàm helper nhỏ để xử lý logic Render giúp code bên dưới siêu sạch
    const renderRoute = (route, index, isPrivate = false, requireAdmin = false) => {
        // --- Giữ nguyên logic Layout cũ của bạn ---
        let Layout = DefaultLayout;
        if (route.layout) {
            Layout = route.layout;
        } else if (route.layout === null) {
            Layout = Fragment;
        }
        
        const Page = route.component;
        
        // Gói Component vào trong Layout
        let Element = (
            <Layout>
                <Page />
            </Layout>
        );

        // --- Thêm logic Bảo vệ (ProtectedRoute) ---
        // Nếu route này cần bảo vệ (Private hoặc Admin), ta bọc Element vào trong ProtectedRoute
        if (isPrivate || requireAdmin) {
            Element = (
                <ProtectedRoute requireAdmin={requireAdmin}>
                    {Element}
                </ProtectedRoute>
            );
        }

        return <Route key={index} path={route.path} element={Element} />;
    };

    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* 1. Những trang ai cũng vào được (Home, Login, Search...) */}
                    {publicRoutes.map((route, index) => renderRoute(route, index))}

                    {/* 2. Những trang bắt buộc Đăng nhập (Profile, Chat, Order...) */}
                    {privateRoutes.map((route, index) => renderRoute(route, index, true, false))}

                    {/* 3. Những trang bắt buộc là Admin (Dashboard, UserAdmin...) */}
                    {adminRoutes.map((route, index) => renderRoute(route, index, false, true))}
                </Routes>
                <ChatBox />
            </div>
        </Router>
    );
}

export default App;