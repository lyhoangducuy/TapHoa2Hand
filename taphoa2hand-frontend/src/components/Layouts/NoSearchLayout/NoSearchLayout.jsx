import React from 'react';
import classNames from "classnames/bind";
import styles from "./NoSearchLayout.module.scss";
import HeaderNoSearch from '../Components/HeaderNoSearch/HeaderNoSearch';
import { BottomNav, Footer } from '../Components';

const cx = classNames.bind(styles);

function NoSearchLayout({ children }) {
    return (  
        <div className={cx("app-wrapper")}>
            <HeaderNoSearch />
            
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

export default NoSearchLayout;
