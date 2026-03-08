import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
useEffect(() => {
  fetch("http://localhost:8080/api/test")
    .then(res => res.text())
    .then(console.log);
}, []);
