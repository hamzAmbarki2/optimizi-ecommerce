import { useEffect, useState } from 'react';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '../config.js';

export const useOrderRealTimeSync = (orderId) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const orderRef = doc(db, 'orders', orderId);
    
    const unsubscribe = onSnapshot(
      orderRef,
      (doc) => {
        if (doc.exists()) {
          const orderData = { id: doc.id, ...doc.data() };
          setOrder(orderData);
          setError(null);
        } else {
          setError('Order not found');
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to order updates:', error);
        setError('Failed to load order updates');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orderId]);

  return { order, loading, error };
};

export const useOrdersRealTimeSync = (userId) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // For simplicity, we'll listen to all orders and filter client-side
    // In a production app, you'd want to use a query with where clause
    const ordersRef = collection(db, 'orders');
    
    const unsubscribe = onSnapshot(
      ordersRef,
      (snapshot) => {
        const allOrders = [];
        snapshot.forEach((doc) => {
          const orderData = { id: doc.id, ...doc.data() };
          if (orderData.userId === userId) {
            allOrders.push(orderData);
          }
        });
        
        // Sort by creation date (newest first)
        allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setOrders(allOrders);
        setError(null);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to orders updates:', error);
        setError('Failed to load orders updates');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { orders, loading, error };
};

