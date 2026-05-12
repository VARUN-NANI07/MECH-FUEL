import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/Landing/LandingPage';
import FuelOrder from './pages/FuelService/FuelOrder';
import ServiceRequest from './pages/MechanicalService/ServiceRequest';
import ServiceCheckout from './pages/MechanicalService/ServiceCheckout'; // ✅ added
import AdminDashboard from './pages/Admin/AdminDashboard'; // ✅ added
import ProviderDashboard from './pages/Provider/ProviderDashboard';
import Dashboard from './pages/Dashboard'; // ✅ User dashboard
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import MapPage from './pages/MapPage'; // 👈 already added
import ProtectedRoute from './components/auth/ProtectedRoute'; // ✅ added
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

          {/* ✅ User Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* ✅ Admin Dashboard Route */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/provider/dashboard"
            element={
              <ProtectedRoute>
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/receiver/dashboard"
            element={
              <ProtectedRoute>
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
