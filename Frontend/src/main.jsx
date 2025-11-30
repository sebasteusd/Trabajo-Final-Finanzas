import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 1. IMPORTAR BROWSER ROUTER
import { BrowserRouter } from 'react-router-dom' 
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 2. ENVOLVER LA APP AQUÍ */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)