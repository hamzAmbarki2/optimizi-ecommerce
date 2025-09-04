// File: /home/ubuntu/project-bolt/project/src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { StockDecrementProvider } from './components/StockDecrementProvider';
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
import EmailTest from './pages/EmailTest';

function App() {
  return (
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
                  <Layout>
                    <Dashboard />
                  </Layout>
                </StockDecrementProvider>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <StockDecrementProvider>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </StockDecrementProvider>
              </ProtectedRoute>
            } />
            
            <Route path="/products" element={
              <ProtectedRoute>
                <StockDecrementProvider>
                  <Layout>
                    <Products />
                  </Layout>
                </StockDecrementProvider>
              </ProtectedRoute>
            } />
            
            <Route path="/categories" element={
              <ProtectedRoute>
                <StockDecrementProvider>
                  <Layout>
                    <Categories />
                  </Layout>
                </StockDecrementProvider>
              </ProtectedRoute>
            } />
            
            <Route path="/orders" element={
              <ProtectedRoute>
                <StockDecrementProvider>
                  <Layout>
                    <Orders />
                  </Layout>
                </StockDecrementProvider>
              </ProtectedRoute>
            } />
            
            <Route path="/notifications" element={
              <ProtectedRoute>
                <StockDecrementProvider>
                  <Layout>
                    <Notifications />
                  </Layout>
                </StockDecrementProvider>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <StockDecrementProvider>
                  <Layout>
                    <Profile />
                  </Layout>
                </StockDecrementProvider>
              </ProtectedRoute>
            } />
            
            <Route path="/fournisseur" element={
              <ProtectedRoute>
                <StockDecrementProvider>
                  <Layout>
                    <Fournisseur />
                  </Layout>
                </StockDecrementProvider>
              </ProtectedRoute>
            } />
            
            <Route path="/email-test" element={
              <ProtectedRoute>
                <StockDecrementProvider>
                  <Layout>
                    <EmailTest />
                  </Layout>
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
  );
}

export default App;
