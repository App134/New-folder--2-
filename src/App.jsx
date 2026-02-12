import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './App.css';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DataEntryPage from './pages/DataEntryPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import UserPage from './pages/UserPage';
import GoogleSheetPage from './pages/GoogleSheetPage';

import MobileLayout from './components/layout/MobileLayout';
import PhonePeHome from './pages/phonepe/PhonePeHome';
import PhonePeWealth from './pages/phonepe/PhonePeWealth';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data-entry"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DataEntryPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <UserPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <TransactionHistoryPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/google-sheet"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <GoogleSheetPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />


        {/* PhonePe Simulation App */}
        <Route path="/phonepe" element={<ProtectedRoute><MobileLayout /></ProtectedRoute>}>
          <Route index element={<PhonePeHome />} />
          <Route path="wealth" element={<PhonePeWealth />} />
          <Route path="history" element={<div className="p-4 text-center text-slate-500">Transaction History (Coming Soon)</div>} />
        </Route>

        {/* Redirect any unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <div className="app-container">
            <AnimatedRoutes />
          </div>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
