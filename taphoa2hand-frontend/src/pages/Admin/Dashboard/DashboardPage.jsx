import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './DashboardPage.module.scss';
import CIcon from '@coreui/icons-react';
import { cilPeople, cilGrid, cilCart, cilTag, cilBell } from '@coreui/icons';
import {
    CRow,
    CCol,
    CCard,
    CCardBody,
    CCardHeader,
    CSpinner,
} from '@coreui/react';
import { getAdminDashboardStats } from '../../../services/dashboardService';

const cx = classNames.bind(styles);

function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getAdminDashboardStats();
                setStats(response.result);
            } catch (err) {
                console.error('Lỗi khi lấy số liệu dashboard:', err);
                setError('Không thể tải dữ liệu thống kê.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const cards = [
        {
            title: 'Người dùng',
            value: stats?.totalUsers ?? 0,
            icon: cilPeople,
            className: 'card-blue',
            description: 'Tổng số tài khoản',
        },
        {
            title: 'Tin đăng',
            value: stats?.totalPosts ?? 0,
            icon: cilGrid,
            className: 'card-green',
            description: 'Tin đăng đang hoạt động',
        },
        {
            title: 'Đơn hàng',
            value: stats?.totalOrders ?? 0,
            icon: cilCart,
            className: 'card-yellow',
            description: 'Tổng số đơn hàng',
        },
        {
            title: 'Danh mục',
            value: stats?.totalCategories ?? 0,
            icon: cilTag,
            className: 'card-red',
            description: 'Danh mục sản phẩm',
        },
    ];

    return (
        <div className={cx('dashboard-wrapper')}>
            <div className={cx('header-row')}>
                <h1 className={cx('page-title')}>Bảng điều khiển</h1>
            </div>

            {loading ? (
                <div className={cx('loading-wrapper')}>
                    <CSpinner />
                </div>
            ) : error ? (
                <div className={cx('error-message')}>{error}</div>
            ) : (
                <>
                    <CRow className="mb-4">
                        {cards.map((card) => (
                            <CCol key={card.title} xs={12} md={6} xl={3} className="mb-4">
                                <CCard className={cx('stat-card', card.className)}>
                                    <CCardBody className={cx('stat-body')}>
                                        <div className={cx('stat-top')}>
                                            <div className={cx('icon-wrapper')}>
                                                <CIcon icon={card.icon} size="xl" />
                                            </div>
                                            <div className={cx('stat-value')}>{card.value}</div>
                                        </div>
                                        <div className={cx('stat-label')}>{card.title}</div>
                                        <div className={cx('stat-description')}>{card.description}</div>
                                    </CCardBody>
                                </CCard>
                            </CCol>
                        ))}
                    </CRow>

                    <CRow>
                        <CCol xs={12} xl={6} className="mb-4">
                            <CCard className={cx('table-card')}>
                                <CCardHeader className={cx('card-header-custom')}>
                                    <strong>Tiêu điểm Dashboard</strong>
                                </CCardHeader>
                                <CCardBody>
                                    <div className={cx('info-box')}>
                                        <CIcon icon={cilBell} size="xl" />
                                        <div>
                                            <p className={cx('info-title')}>Tổng phản hồi</p>
                                            <p className={cx('info-value')}>{stats?.totalFeedbacks ?? 0}</p>
                                        </div>
                                    </div>
                                </CCardBody>
                            </CCard>
                        </CCol>
                        <CCol xs={12} xl={6} className="mb-4">
                            <CCard className={cx('table-card')}>
                                <CCardHeader className={cx('card-header-custom')}>
                                    <strong>Banner hiện tại</strong>
                                </CCardHeader>
                                <CCardBody>
                                    <div className={cx('info-box')}>
                                        <CIcon icon={cilGrid} size="xl" />
                                        <div>
                                            <p className={cx('info-title')}>Số banner</p>
                                            <p className={cx('info-value')}>{stats?.totalBanners ?? 0}</p>
                                        </div>
                                    </div>
                                </CCardBody>
                            </CCard>
                        </CCol>
                    </CRow>
                </>
            )}
        </div>
    );
}

export default DashboardPage;