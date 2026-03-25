import React from 'react';
// // Trỏ đến file BottomNav vừa tạo
import classNames from "classnames/bind";
import styles from "./DefaultLayout.module.scss";
import { BottomNav, Footer, Header } from '../Components';

const cx = classNames.bind(styles);

function DefaultLayout({ children }) {
    return (  
        <div className={cx("app-wrapper")}>
            <Header />
            
            {/* Phần thân chứa danh sách sản phẩm / nội dung thay đổi */}
            <main className={cx("main-container")}>
                {children}
            </main>

            <Footer />
            
            {/* Thanh điều hướng đáy (Chỉ hiện trên Mobile nhờ CSS) */}
            <BottomNav />
        </div>
    );
}

export default DefaultLayout;