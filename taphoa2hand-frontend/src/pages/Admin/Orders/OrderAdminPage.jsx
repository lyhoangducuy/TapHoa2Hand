import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormInput,
  CPagination,
  CPaginationItem,
  CSpinner,
} from '@coreui/react';
import styles from './OrderAdminPage.module.scss';
import orderService from '../../../services/orderService';

const cx = classNames.bind(styles);

const formatCurrency = (amount) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount || 0);

const formatDateTime = (value) => {
  if (!value) return '---';
  return new Date(value).toLocaleString('vi-VN');
};

const OrderAdminPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const fetchOrders = async (page) => {
    try {
      setLoading(true);
      const res = await orderService.getAdminOrders(page, 10);
      if (res?.data?.code === 1000) {
        setOrders(res.data.result.content || []);
        setTotalPages(res.data.result.totalPages || 1);
      }
    } catch (error) {
      console.error('Lỗi lấy danh sách đơn hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const value = searchText.trim().toLowerCase();
    if (!value) return true;
    return (
      order.id?.toLowerCase().includes(value) ||
      order.buyerId?.toLowerCase().includes(value) ||
      order.sellerId?.toLowerCase().includes(value) ||
      order.status?.name?.toLowerCase().includes(value)
    );
  });

  const renderPaginationItems = () => {
    const items = [];
    for (let i = 0; i < totalPages; i += 1) {
      items.push(
        <CPaginationItem
          key={i}
          active={i === currentPage}
          onClick={() => setCurrentPage(i)}
          style={{ cursor: 'pointer' }}
        >
          {i + 1}
        </CPaginationItem>,
      );
    }
    return items;
  };

  return (
    <div className={cx('order-page')}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold m-0">Quản lý đơn hàng</h3>
        <CFormInput
          className={cx('search-input')}
          placeholder="Tìm kiếm theo ID, người mua, người bán, trạng thái..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: '380px' }}
        />
      </div>

      <CCard className="shadow-sm border-0">
        <CCardHeader className="bg-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <span>Danh sách đơn hàng</span>
            <span className="text-secondary">Trang {currentPage + 1}/{totalPages}</span>
          </div>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className={cx('loader')}>
              <CSpinner />
              <span>Đang tải đơn hàng...</span>
            </div>
          ) : (
            <>
              <CTable hover responsive align="middle" className="mb-0 border">
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell>ID</CTableHeaderCell>
                    <CTableHeaderCell>Người mua</CTableHeaderCell>
                    <CTableHeaderCell>Người bán</CTableHeaderCell>
                    <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                    <CTableHeaderCell>Thanh toán</CTableHeaderCell>
                    <CTableHeaderCell>Tổng tiền</CTableHeaderCell>
                    <CTableHeaderCell>Ngày tạo</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Hành động</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <CTableRow key={order.id}>
                        <CTableDataCell className={cx('order-id')}>
                          {order.id}
                        </CTableDataCell>
                        <CTableDataCell>{order.buyerId || '---'}</CTableDataCell>
                        <CTableDataCell>{order.sellerId || '---'}</CTableDataCell>
                        <CTableDataCell>{order.status?.displayName || order.status?.name || '---'}</CTableDataCell>
                        <CTableDataCell>{order.paymentMethod?.description || order.paymentMethod?.name || '---'}</CTableDataCell>
                        <CTableDataCell>{formatCurrency(order.totalAmount)}</CTableDataCell>
                        <CTableDataCell>{formatDateTime(order.createdAt)}</CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CButton
                            color="info"
                            size="sm"
                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                          >
                            Xem chi tiết
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan={8} className="text-center text-muted py-4">
                        Không tìm thấy đơn hàng.
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>

              {totalPages > 1 && (
                <div className="d-flex justify-content-end mt-4">
                  <CPagination>
                    <CPaginationItem
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                    >
                      Trước
                    </CPaginationItem>
                    {renderPaginationItems()}
                    <CPaginationItem
                      disabled={currentPage === totalPages - 1}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                    >
                      Sau
                    </CPaginationItem>
                  </CPagination>
                </div>
              )}
            </>
          )}
        </CCardBody>
      </CCard>
    </div>
  );
};

export default OrderAdminPage;
