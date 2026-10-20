import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import BlueScrollbar from './components/ui/blue-scrollbar'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <BlueScrollbar />
  </StrictMode>,
)
