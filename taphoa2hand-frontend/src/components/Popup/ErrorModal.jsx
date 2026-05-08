import React from 'react';
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton } from '@coreui/react';
import './ErrorModal.scss';

const ErrorModal = ({ visible, onClose, title, message, errors }) => {
  return (
    <CModal 
      visible={visible} 
      onClose={onClose} 
      alignment="center" 
      backdrop="static"
      className="error-modal"
    >
      <CModalHeader onClose={onClose} className="error-header">
        <CModalTitle>{title || 'Lỗi'}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {message && <p className="error-message">{message}</p>}
        {errors && errors.length > 0 && (
          <ul className="error-list">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color="danger" onClick={onClose}>
          Đóng
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default ErrorModal;
