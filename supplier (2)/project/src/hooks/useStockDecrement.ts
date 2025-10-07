import { useEffect, useRef } from 'react';
import { masterOrderService } from '../services/masterOrderService';

export const useStockDecrement = (fournisseurId: string | null) => {
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!fournisseurId) {
      console.log('🔄 [useStockDecrement] No fournisseurId provided, skipping stock decrement listener');
      return;
    }

    console.log(`🔄 [useStockDecrement] Setting up stock decrement listener for fournisseur: ${fournisseurId}`);

    // Clean up any existing listener
    if (unsubscribeRef.current) {
      console.log('🧹 [useStockDecrement] Cleaning up existing stock decrement listener');
      unsubscribeRef.current();
    }

    // Initialize the stock decrement listener
    unsubscribeRef.current = masterOrderService.initializeStockDecrementListener(fournisseurId);

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        console.log('🧹 [useStockDecrement] Cleaning up stock decrement listener on unmount');
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [fournisseurId]);

  return {
    // This hook doesn't return any state, it just manages the listener
    isListening: !!unsubscribeRef.current
  };
};

