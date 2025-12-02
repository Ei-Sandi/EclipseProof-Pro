import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './components/pages/LandingPage';
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';
import ProverDashboardPage from './components/pages/ProverDashboardPage';
import VerifierPage from './components/pages/VerifierPage';

export default function EclipseProofApp() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-white">
          <Navbar />

          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify" element={<VerifierPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ProverDashboardPage />
                </ProtectedRoute>
              }
            />
          </Routes>

          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}