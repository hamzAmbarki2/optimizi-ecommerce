import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFournisseur } from '../hooks/useFournisseur';
import { useStockDecrement } from '../hooks/useStockDecrement';
import { InventoryNotificationService } from '../services/inventoryNotificationService';

interface StockDecrementProviderProps {
  children: React.ReactNode;
}

export const StockDecrementProvider: React.FC<StockDecrementProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const { fournisseur } = useFournisseur();
  
  // Initialize stock decrement listener when fournisseur is available
  useStockDecrement(fournisseur?.id || null);

  useEffect(() => {
    if (currentUser && fournisseur) {
      console.log(`🔄 [StockDecrementProvider] Stock decrement listener active for fournisseur: ${fournisseur.name} (${fournisseur.id})`);
      
      // Initialize inventory monitoring
      const cleanupInventoryMonitoring = InventoryNotificationService.initializeInventoryMonitoring(
        fournisseur.id,
        fournisseur.name
      );
      
      return cleanupInventoryMonitoring;
    }
  }, [currentUser, fournisseur]);

  return <>{children}</>;
};

