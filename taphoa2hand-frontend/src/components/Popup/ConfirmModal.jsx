// src/components/ConfirmModal.jsx
import React from 'react';
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton } from '@coreui/react';

const ConfirmModal = ({ visible, onClose, onConfirm, title, content }) => {
  return (
    <CModal 
      visible={visible} 
      onClose={onClose} 
      alignment="center" 
      backdrop="static" // Tránh việc bấm ra ngoài bị mất popup
    >
      <CModalHeader onClose={onClose}>
        <CModalTitle>{title || 'Xác nhận'}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {content}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" variant="ghost" onClick={onClose}>
          Hủy bỏ
        </CButton>
        <CButton color="danger" onClick={onConfirm}>
          Xác nhận xóa
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default ConfirmModal;