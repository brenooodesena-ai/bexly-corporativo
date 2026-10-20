import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import BlueScrollbar from './components/ui/blue-scrollbar'

// Forçar favicon diretamente via DOM para contornar qualquer comportamento do navegador
const setFavicon = () => {
  const existing = document.querySelector("link[rel*='icon']");
  if (existing) existing.remove();
  const link = document.createElement('link');
  link.type = 'image/png';
  link.rel = 'icon';
  link.href = '/favicon-32.png?t=' + Date.now();
  document.head.appendChild(link);
};
setFavicon();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <BlueScrollbar />
  </StrictMode>,
)
