import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/Landing/LandingPage';
import FuelOrder from './pages/FuelService/FuelOrder';
import ServiceRequest from './pages/MechanicalService/ServiceRequest';
import ServiceCheckout from './pages/MechanicalService/ServiceCheckout'; // ✅ added
import AdminDashboard from './pages/Admin/AdminDashboard'; // ✅ added
import Debug from './pages/Debug'; // ✅ Debug page
import DebugLogin from './pages/DebugLogin'; // ✅ Debug login
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import MapPage from './pages/MapPage'; // 👈 already added
import ProtectedRoute from './components/auth/ProtectedRoute'; // ✅ added
import AdminRoute from './components/auth/AdminRoute'; // ✅ added for admin-only routes
import './App.css';
import 'leaflet/dist/leaflet.css';

function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/fuel" element={<FuelOrder />} />
          <Route path="/mechanical" element={<ServiceRequest />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/map" element={<MapPage />} />

          {/* ✅ New Protected Checkout Route */}
          <Route
            path="/service-checkout"
            element={
              <ProtectedRoute>
                <ServiceCheckout />
              </ProtectedRoute>
            }
          />

          {/* ✅ Admin Dashboard Route - Only for admin users */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* 🔧 Debug pages - Remove in production */}
          <Route path="/debug" element={<Debug />} />
          <Route path="/debug-login" element={<DebugLogin />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
