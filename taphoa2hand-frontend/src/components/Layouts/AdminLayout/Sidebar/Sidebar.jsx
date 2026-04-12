import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Sidebar.module.scss';
import { CSidebar, CSidebarBrand, CSidebarNav, CNavItem, CNavTitle, CSidebarToggler } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSpeedometer, cilBasket, cilPeople, cilSettings, cilChartLine } from '@coreui/icons';

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
        <CNavItem as={Link} to="/admin" active={location.pathname === '/admin'}>
          <CIcon icon={cilSpeedometer} customClassName="nav-icon" /> Dashboard
        </CNavItem>

        <CNavTitle>Quản lý nội dung</CNavTitle>
        <CNavItem as={Link} to="/admin/posts" active={location.pathname === '/admin/posts'}>
          <CIcon icon={cilBasket} customClassName="nav-icon" /> Quản lý bài đăng
        </CNavItem>
        <CNavItem as={Link} to="/admin/users" active={location.pathname === '/admin/users'}>
          <CIcon icon={cilPeople} customClassName="nav-icon" /> Người dùng
        </CNavItem>

        <CNavTitle>Báo cáo & Cài đặt</CNavTitle>
        <CNavItem as={Link} to="/admin/analytics" active={location.pathname === '/admin/analytics'}>
          <CIcon icon={cilChartLine} customClassName="nav-icon" /> Thống kê doanh thu
        </CNavItem>
        <CNavItem as={Link} to="/admin/settings" active={location.pathname === '/admin/settings'}>
          <CIcon icon={cilSettings} customClassName="nav-icon" /> Cấu hình hệ thống
        </CNavItem>
      </CSidebarNav>
      
      <CSidebarToggler className="d-none d-lg-flex" onClick={() => onVisibleChange(!visible)} />
    </CSidebar>
  );
};

export default Sidebar;