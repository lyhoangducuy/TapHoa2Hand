import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './app/AuthProvider';
import AppRoutes from './routes/routes';
import Header from './components/layout/Header'; // <-- Import Header vừa tạo

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                {/* Header được đặt ở đây để hiển thị trên mọi trang */}
                <Header />
                
                {/* Phần nội dung chính (các Pages) sẽ render bên dưới Header */}
                <main style={{ minHeight: '80vh', padding: '20px' }}>
                    <AppRoutes />
                </main>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;