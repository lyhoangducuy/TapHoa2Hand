import React from 'react';
import classNames from 'classnames/bind';
import styles from './DashboardPage.module.scss';
import {
    CRow, CCol, CCard, CCardBody, CCardHeader,
    CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CBadge
} from '@coreui/react';

// Khởi tạo classnames bind với styles module
const cx = classNames.bind(styles);

function DashboardPage() {
    return (
        <div className={cx('dashboard-wrapper')}>
            dashboard
        </div>
    );
}

export default DashboardPage;