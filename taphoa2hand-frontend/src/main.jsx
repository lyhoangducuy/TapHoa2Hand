// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import '@coreui/coreui/dist/css/coreui.min.css'; // BẮT BUỘC CÓ
import 'bootstrap/dist/css/bootstrap.min.css';   // Cần thiết để các class d-flex, mb-4 hoạt động
import App from './App.jsx'
// import './index.css' // Bỏ comment nếu có file css global

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)