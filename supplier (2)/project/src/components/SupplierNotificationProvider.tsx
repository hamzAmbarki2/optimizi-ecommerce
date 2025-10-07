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
      
      // Initialize the enhanced notification servic
      supplierNotificationService.initialize();
      
      // Check if email service is configured
      const configStatus = supplierNotificationService.getConfigStatus();
      if (!configStatus.isConfigured) {
        console.warn('⚠️ [SupplierNotificationProvider] Enhanced email service not configured:', configStatus.missingFields);
        console.warn('📧 Please configure the following in your .env file:');
        console.warn('   - VITE_EMAIL_BACKEND_URL (email backend server URL)');
        console.warn('   - VITE_SUPPLIER_SUPPORT_EMAIL (your support email)');
        console.warn('📖 See SUPPLIER_NOTIFICATION_SETUP.md for detailed instructions');
      } else {
        console.log('✅ [SupplierNotificationProvider] Enhanced email service configured successfully');
        console.log('🔗 [SupplierNotificationProvider] Backend URL:', configStatus.currentValues.backendUrl);
        console.log('📧 [SupplierNotificationProvider] Support Email:', configStatus.currentValues.supportEmail);
      }
      
      // Initialize comprehensive order monitoring for this supplier
      const cleanupOrderMonitoring = orderNotificationTrigger.initializeOrderMonitoring(fournisseur.id);
      
      // Cleanup function
      return () => {
        console.log(`🧹 [SupplierNotificationProvider] Cleaning up comprehensive notifications for: ${fournisseur.name}`);
        cleanupOrderMonitoring();
      };
    } else {
      console.log('⏸️ [SupplierNotificationProvider] Waiting for authentication and supplier data...');
      console.log('📊 [SupplierNotificationProvider] Current state:', {
        hasUser: !!currentUser,
        hasUserData: !!userData,
        hasFournisseur: !!fournisseur,
        fournisseurId: fournisseur?.id || 'none'
      });
    }
  }, [currentUser, userData, fournisseur]);

  return <>{children}</>;
};