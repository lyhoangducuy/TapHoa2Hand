import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Sidebar.module.scss';
import { CSidebar, CSidebarBrand, CSidebarNav, CNavItem, CNavTitle, CSidebarToggler } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSpeedometer, cilBasket, cilPeople,cilImage, cilList, cilWarning } from '@coreui/icons';

const cx = classNames.bind(styles);

const Sidebar = ({ visible, onVisibleChange }) => {
  const location = useLocation();

  return (
    <CSidebar
      className={cx('sidebar-container')}
      position="fixed"
      visible={visible}
      onVisibleChange={onVisibleChange}
    >
      <CSidebarBrand className="d-none d-md-flex">
        <div className={cx('logo')}>
          <span className={cx('logo-text')}>TAPHOA<span className={cx('highlight')}>2HAND</span></span>
        </div>
      </CSidebarBrand>

      <CSidebarNav>
        <CNavTitle>Hệ thống</CNavTitle>

        {/* Tách CNavItem và Link ra riêng biệt để không bị lồng thẻ <a> */}
        <CNavItem>
          <Link to="/admin/statistics" className={`nav-link ${location.pathname === '/admin/statistics' ? 'active' : ''}`}>
            <CIcon icon={cilSpeedometer} customClassName="nav-icon" /> Dashboard
          </Link>
        </CNavItem>

        <CNavTitle>Quản lý nội dung</CNavTitle>
        <CNavItem>
          <Link to="/admin/posts" className={`nav-link ${location.pathname === '/admin/posts' ? 'active' : ''}`}>
            <CIcon icon={cilBasket} customClassName="nav-icon" /> Bài đăng
          </Link>
        </CNavItem>

        <CNavItem>
          <Link to="/admin/users" className={`nav-link ${location.pathname === '/admin/users' ? 'active' : ''}`}>
            <CIcon icon={cilPeople} customClassName="nav-icon" /> Người dùng
          </Link>
        </CNavItem>
        <CNavItem>
          <Link to="/admin/categories" className={`nav-link ${location.pathname === '/admin/categories' ? 'active' : ''}`}>
            <CIcon icon={cilPeople} customClassName="nav-icon" /> Danh muc
          </Link>
        </CNavItem>
        <CNavItem>
          <Link to="/admin/banners" className={`nav-link ${location.pathname === '/admin/banners' ? 'active' : ''}`}>
            <CIcon icon={cilImage} customClassName="nav-icon" /> Banner
          </Link>
        </CNavItem>
        <CNavItem>
          <Link to="/admin/orders" className={`nav-link ${location.pathname.startsWith('/admin/orders') ? 'active' : ''}`}>
            <CIcon icon={cilList} customClassName="nav-icon" /> Đơn hàng
          </Link>
        </CNavItem>
        <CNavItem>
          <Link to="/admin/notifications" className={`nav-link ${location.pathname === '/admin/notifications' ? 'active' : ''}`}>
            <CIcon icon={cilPeople} customClassName="nav-icon" /> Thông báo
          </Link>
        </CNavItem>
        <CNavItem>
          <Link to="/admin/feedbacks" className={`nav-link ${location.pathname === '/admin/feedbacks' ? 'active' : ''}`}>
            <CIcon icon={cilPeople} customClassName="nav-icon" /> Đánh giá
          </Link>
        </CNavItem>
        <CNavItem>
          <Link to="/admin/reports" className={`nav-link ${location.pathname === '/admin/reports' ? 'active' : ''}`}>
            <CIcon icon={cilWarning} customClassName="nav-icon" /> Báo cáo
          </Link>
        </CNavItem>
      </CSidebarNav>

      <CSidebarToggler className="d-none d-lg-flex" onClick={() => onVisibleChange(!visible)} />
    </CSidebar>
  );
};

export default Sidebar;