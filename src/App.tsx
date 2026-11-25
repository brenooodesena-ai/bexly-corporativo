import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import AuthCallback from './pages/Auth/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
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
import { AuthProvider } from './context/AuthContext';
import { InstagramAutomationProvider } from './context/InstagramAutomationContext';
import InstagramCallback from './pages/InstagramCallback';
import Settings from './pages/Settings';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InstagramAutomationProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/integrations/instagram/callback" element={<InstagramCallback />} />

              {/* Protected Dashboard Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
          <Route path="/pages" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Pages />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/funnels" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Funnels />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/leads" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Leads />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/clients" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Clients />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/marketing" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Marketing />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/products" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Products />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/ai-mentor" element={
            <ProtectedRoute>
              <DashboardLayout>
                <AIMentor />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Direct all unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </InstagramAutomationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
