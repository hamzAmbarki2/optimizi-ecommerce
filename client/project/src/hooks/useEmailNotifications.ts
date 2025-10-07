import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useOrders } from './useOrders';
import { emailService } from '../services/emailService';

/**
 * Hook to automatically send email notifications when order status changes
 * This hook monitors order status changes and sends appropriate emails
 */
export const useEmailNotifications = () => {
  const { state } = useApp();
  const { orders } = useOrders(state.user?.id);

  useEffect(() => {
    // Initialize email service when component mounts
    emailService.initialize();
  }, []);

  useEffect(() => {
    if (!state.isAuthenticated || !state.user || orders.length === 0) {
      return;
    }

    // Check if EmailJS is properly configured
    if (!emailService.isConfigured()) {
      console.warn('EmailJS is not properly configured. Please set up your EmailJS credentials.');
      return;
    }

    // Monitor order status changes
    // In a real application, this would be handled by a backend service
    // For this demo, we'll simulate it by checking recent orders
    const recentOrders = orders.filter(order => {
      const orderDate = new Date(order.updatedAt);
      const now = new Date();
      const timeDiff = now.getTime() - orderDate.getTime();
      const hoursDiff = timeDiff / (1000 * 3600);
      
      // Consider orders updated in the last 24 hours as "recent"
      return hoursDiff < 24;
    });

    // Load sent email tracking map from localStorage to avoid duplicates across sessions
    const storageKey = state.user?.id ? `optimizi:${state.user.id}:sentEmails` : 'optimizi:guest:sentEmails';
    let sentMap: Record<string, boolean> = {};
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) sentMap = JSON.parse(raw);
    } catch (err) {
      console.warn('Failed to read sent emails map:', err);
    }

    recentOrders.forEach(async (order) => {
      try {
        const sendKey = `${order.id}:${order.status}`;
        // Skip if we've already sent this order status notification
        if (sentMap[sendKey]) return;

        // Format delivery address for email
        const deliveryAddress = `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.postalCode}, ${order.deliveryAddress.country}`;
        
        // Build items string and lightweight list for template
        const itemsString = order.items
          .map(i => `- ${i.quantity} x ${i.productName} — TND${i.unitPrice.toFixed(2)}`)
          .join('\n');

        // Send email notification
        await emailService.sendOrderNotification({
          userEmail: order.userEmail,
          userName: order.userName,
          orderId: order.id,
          status: order.status,
          total: order.total,
          itemCount: order.items.length,
          deliveryAddress: deliveryAddress,
          paymentMethod: order.paymentMethod,
          userPhone: order.userPhone,
          orderNotes: order.orderNotes,
          orderItemsString: itemsString
        });

        // Mark as sent and persist
        sentMap[sendKey] = true;
        try { localStorage.setItem(storageKey, JSON.stringify(sentMap)); } catch (err) { console.warn('Failed to persist sent emails map:', err); }
      } catch (error) {
        console.error('Failed to send email notification for order:', order.id, error);
      }
    });
  }, [orders, state.isAuthenticated, state.user]);

  return {
    isEmailConfigured: emailService.isConfigured(),
    sendOrderNotification: emailService.sendOrderNotification.bind(emailService),
    sendContactEmail: emailService.sendContactFormEmail.bind(emailService)
  };
};