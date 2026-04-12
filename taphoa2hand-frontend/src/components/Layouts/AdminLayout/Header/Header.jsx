import React from 'react';
import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import { 
  CHeader, CContainer, CHeaderNav, CNavLink, CNavItem, CHeaderToggler,
  CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem, CDropdownDivider, CBadge 
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { 
  cilMenu, cilBell, cilEnvelopeOpen, cilUser, 
  cilSettings, cilLockLocked, cilAccountLogout 
} from '@coreui/icons';

const cx = classNames.bind(styles);

const Header = ({ onToggleSidebar }) => {
  return (
    <CHeader position="sticky" className={cx('header-wrapper', 'mb-4')}>
      <CContainer fluid>
        
        <CHeaderToggler className="ps-1" onClick={onToggleSidebar}>
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>

        <CHeaderNav className="d-none d-md-flex me-auto ms-2">
          <CNavItem><CNavLink href="/admin/dashboard" className={cx('nav-link-custom')}>Bảng điều khiển</CNavLink></CNavItem>
          <CNavItem><CNavLink href="/admin/users" className={cx('nav-link-custom')}>Người dùng</CNavLink></CNavItem>
          <CNavItem><CNavLink href="/admin/settings" className={cx('nav-link-custom')}>Cài đặt</CNavLink></CNavItem>
        </CHeaderNav>

        <CHeaderNav>
          <CNavItem>
            <CNavLink href="#">
              <div className={cx('icon-wrapper')}>
                <CIcon icon={cilBell} size="lg" />
                <CBadge color="danger" shape="rounded-pill" className={cx('badge-dot')}>
                  3
                </CBadge>
              </div>
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="#">
              <div className={cx('icon-wrapper')}>
                <CIcon icon={cilEnvelopeOpen} size="lg" />
              </div>
            </CNavLink>
          </CNavItem>
        </CHeaderNav>

        <CHeaderNav className="ms-3">
          <CDropdown variant="nav-item">
            <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
              <div className={cx('user-profile')}>
                <div className={cx('user-info', 'd-none d-md-flex')}>
                  <span className={cx('name')}>Admin Lee</span>
                  <span className={cx('role')}>Quản trị viên</span>
                </div>
                <div className={cx('avatar')}>
                   <CIcon icon={cilUser} size="lg" />
                </div>
              </div>
            </CDropdownToggle>
            
            <CDropdownMenu className="pt-0" placement="bottom-end">
              <CDropdownItem href="#">
                <CIcon icon={cilUser} className="me-2" /> Thông tin cá nhân
              </CDropdownItem>
              <CDropdownItem href="/admin/settings">
                <CIcon icon={cilSettings} className="me-2" /> Cài đặt hệ thống
              </CDropdownItem>
              <CDropdownDivider />
              <CDropdownItem href="#">
                <CIcon icon={cilLockLocked} className="me-2" /> Khóa màn hình
              </CDropdownItem>
              <CDropdownItem href="/" className="text-danger">
                <CIcon icon={cilAccountLogout} className="me-2" /> Đăng xuất
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </CHeaderNav>

      </CContainer>
    </CHeader>
  );
};

export default Header;