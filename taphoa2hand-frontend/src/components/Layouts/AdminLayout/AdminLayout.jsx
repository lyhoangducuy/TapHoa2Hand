import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar/Sidebar';
import Header from './Header/Header';

const AdminLayout = ({ children }) => {
  const [sidebarShow, setSidebarShow] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  // Theo dõi kích thước màn hình để co giãn Layout chuẩn xác
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>
      <Sidebar visible={sidebarShow} onVisibleChange={setSidebarShow} />
      
      {/* Tính toán padding tự động: Nếu Sidebar đang mở VÀ KHÔNG PHẢI điện thoại thì mới đẩy nội dung sang 256px */}
      <div 
        className="wrapper d-flex flex-column min-vh-100 bg-light"
        style={{ 
          paddingLeft: sidebarShow && !isMobile ? '256px' : '0',
          transition: 'padding-left 0.3s ease-in-out' // Hiệu ứng trượt mượt mà
        }}
      >
        <Header onToggleSidebar={() => setSidebarShow(!sidebarShow)} />
        
        <div className="body flex-grow-1 px-4 mt-4 mb-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;