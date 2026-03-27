import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Leads from './pages/Leads';
import AIMentor from './pages/AIMentor';
import DashboardLayout from './layouts/DashboardLayout';
import Pages from './pages/Pages';
import Funnels from './pages/Funnels';
import Marketing from './pages/Marketing';
import Products from './pages/Products';
import Checkout from './pages/Checkout';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          } />
          <Route path="/pages" element={
            <DashboardLayout>
              <Pages />
            </DashboardLayout>
          } />
          <Route path="/funnels" element={
            <DashboardLayout>
              <Funnels />
            </DashboardLayout>
          } />
          <Route path="/leads" element={
            <DashboardLayout>
              <Leads />
            </DashboardLayout>
          } />
          <Route path="/clients" element={
            <DashboardLayout>
              <Clients />
            </DashboardLayout>
          } />
          <Route path="/marketing" element={
            <DashboardLayout>
              <Marketing />
            </DashboardLayout>
          } />
          <Route path="/products" element={
            <DashboardLayout>
              <Products />
            </DashboardLayout>
          } />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/ai-mentor" element={
            <DashboardLayout>
              <AIMentor />
            </DashboardLayout>
          } />
          <Route path="/settings" element={
            <DashboardLayout>
              <div className="card">
                <h2>Configurações</h2>
                <p>Perfil do usuário e configurações da plataforma em breve.</p>
              </div>
            </DashboardLayout>
          } />

          {/* Direct all unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
