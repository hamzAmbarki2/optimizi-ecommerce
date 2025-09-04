import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFournisseur } from '../hooks/useFournisseur';
import { orderNotificationTrigger } from '../services/orderNotificationTrigger';
import { supplierNotificationService } from '../services/supplierNotificationService';

interface SupplierNotificationProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that automatically sets up supplier notification monitoring
 * when a supplier is authenticated and has a valid fournisseur profile
 */
export const SupplierNotificationProvider: React.FC<SupplierNotificationProviderProps> = ({ 
  children 
}) => {
  const { currentUser, userData } = useAuth();
  const { fournisseur } = useFournisseur();

  useEffect(() => {
    if (currentUser && userData && fournisseur) {
      console.log(`🔄 [SupplierNotificationProvider] Setting up notifications for: ${fournisseur.name} (${fournisseur.id})`);
      
      // Initialize the notification service
      supplierNotificationService.initialize();
      
      // Check if email service is configured
      const configStatus = supplierNotificationService.getConfigStatus();
      if (!configStatus.isConfigured) {
        console.warn('⚠️ [SupplierNotificationProvider] Email service not configured:', configStatus.missingFields);
        console.warn('📧 Please configure VITE_EMAIL_BACKEND_URL in your .env file');
      } else {
        console.log('✅ [SupplierNotificationProvider] Email service configured successfully');
      }
      
      // Initialize order monitoring for this supplier
      const cleanupOrderMonitoring = orderNotificationTrigger.initializeOrderMonitoring(fournisseur.id);
      
      // Cleanup function
      return () => {
        console.log(`🧹 [SupplierNotificationProvider] Cleaning up notifications for: ${fournisseur.name}`);
        cleanupOrderMonitoring();
      };
    } else {
      console.log('⏸️ [SupplierNotificationProvider] Waiting for authentication and supplier data...');
    }
  }, [currentUser, userData, fournisseur]);

  return <>{children}</>;
};