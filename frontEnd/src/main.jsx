import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/Index.css'  // Updated import path
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
