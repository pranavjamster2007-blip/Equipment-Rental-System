/**
 * App.jsx / App.tsx
 * Main Application Routing and Context Provider Wrapper
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';

import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import EquipmentPage from './pages/EquipmentPage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import BookingsPage from './pages/BookingsPage.jsx';
import RentalsPage from './pages/RentalsPage.jsx';
import InspectionsPage from './pages/InspectionsPage.jsx';
import PaymentsPage from './pages/PaymentsPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import ProjectDocsPage from './pages/ProjectDocsPage.jsx';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

// Protected Route Wrapper
function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth() as { user: any; loading: boolean };

  if (loading) {
    return <LoadingSpinner text="Checking authentication status..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col text-gray-800 font-sans antialiased">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/equipment"
                element={
                  <ProtectedRoute>
                    <EquipmentPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/categories"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
                    <CategoriesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <BookingsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/rentals"
                element={
                  <ProtectedRoute>
                    <RentalsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/inspections"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
                    <InspectionsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/payments"
                element={
                  <ProtectedRoute>
                    <PaymentsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/users"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <UsersPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/project-docs"
                element={
                  <ProtectedRoute>
                    <ProjectDocsPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center text-xs text-gray-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>
                <strong>Equipment Rental System</strong> • 2nd Year Computer Science / IT Internal Mark Project #20
              </div>
              <div className="text-[11px] text-gray-400">
                Stack: ReactJS • Node.js (Express) • MongoDB/Mongoose • JWT
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
