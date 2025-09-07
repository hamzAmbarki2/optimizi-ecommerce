// File: /home/ubuntu/project-bolt/project/src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TranslationProvider } from './contexts/TranslationContext';
import { StockDecrementProvider } from './components/StockDecrementProvider';
import { SupplierNotificationProvider } from './components/SupplierNotificationProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import ToastContainer from './components/notifications/ToastContainer';

// Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import Notifications from './pages/EnhancedNotifications';
import Profile from './pages/Profile';
import Fournisseur from './pages/Fournisseur';

function App() {
  return (
    <TranslationProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected routes wrapped with StockDecrementProvider */}
            <Route path="/" element={
              <ProtectedRoute>
                <StockDecrementProvider>
                  <SupplierNotificationProvider>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </SupplierNotificationProvider>
                </StockDecrementProvider>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <StockDecrementProvider>
                  <SupplierNotificationProvider>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </SupplierNotificationProvider>
                </StockDecrementProvider>
              </ProtectedRoute>
            } />
            
            <Route path="/products" element={
              <ProtectedRoute>
                <StockDecrementProvider>
                  <SupplierNotificationProvider>
                    <Layout>
                      <Products />
                    </Layout>
                  </SupplierNotificationProvider>
                </StockDecrementProvider>
              </ProtectedRoute>
            } />
            
            <Route path="/categories" element={
              <ProtectedRoute>
                <StockDecrementProvider>
                  <SupplierNotificationProvider>
                    <Layout>
                      <Categories />
                    </Layout>
                  </SupplierNotificationProvider>
                </StockDecrementProvider>
              </ProtectedRoute>
            } />
            
            <Route path="/orders" element={
              <ProtectedRoute>
                <StockDecrementProvider>
                  <SupplierNotificationProvider>
                    <Layout>
                      <Orders />
                    </Layout>
                  </SupplierNotificationProvider>
                </StockDecrementProvider>
              </ProtectedRoute>
            } />
            
            <Route path="/notifications" element={
              <ProtectedRoute>
                <StockDecrementProvider>
                  <SupplierNotificationProvider>
                    <Layout>
                      <Notifications />
                    </Layout>
                  </SupplierNotificationProvider>
                </StockDecrementProvider>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <StockDecrementProvider>
                  <SupplierNotificationProvider>
                    <Layout>
                      <Profile />
                    </Layout>
                  </SupplierNotificationProvider>
                </StockDecrementProvider>
              </ProtectedRoute>
            } />
            
            <Route path="/fournisseur" element={
              <ProtectedRoute>
                <StockDecrementProvider>
                  <SupplierNotificationProvider>
                    <Layout>
                      <Fournisseur />
                    </Layout>
                  </SupplierNotificationProvider>
                </StockDecrementProvider>
              </ProtectedRoute>
            } />
            
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Global Toast Container */}
            <ToastContainer position="top-right" maxToasts={5} />
          </div>
        </Router>
      </AuthProvider>
    </TranslationProvider>
  );
}

export default App;
