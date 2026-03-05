import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Leads from './pages/Leads';
import AIMentor from './pages/AIMentor';
import DashboardLayout from './layouts/DashboardLayout';

function App() {
  return (
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
        <Route path="/clients" element={
          <DashboardLayout>
            <Clients />
          </DashboardLayout>
        } />
        <Route path="/leads" element={
          <DashboardLayout>
            <Leads />
          </DashboardLayout>
        } />
        <Route path="/mentor" element={
          <DashboardLayout>
            <AIMentor />
          </DashboardLayout>
        } />
        <Route path="/sales" element={
          <DashboardLayout>
            <Dashboard /> {/* Sales can reuse metrics or be unique */}
          </DashboardLayout>
        } />
        <Route path="/settings" element={
          <DashboardLayout>
            <div className="card">
              <h2>Settings</h2>
              <p>User profile and platform settings coming soon.</p>
            </div>
          </DashboardLayout>
        } />

        {/* Direct all unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
