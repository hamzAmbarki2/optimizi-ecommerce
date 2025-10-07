// File: /home/ubuntu/project-bolt/project/src/services/browserNotificationService.ts

import { AppNotification } from "../models";

export class BrowserNotificationService {
  private static instance: BrowserNotificationService;
  private permission: NotificationPermission = "default";
  private isSupported: boolean = false;

  constructor() {
    this.isSupported = "Notification" in window;
    if (this.isSupported) {
      this.permission = Notification.permission;
    }
  }

  static getInstance(): BrowserNotificationService {
    if (!BrowserNotificationService.instance) {
      BrowserNotificationService.instance = new BrowserNotificationService();
    }
    return BrowserNotificationService.instance;
  }

  // Check if notifications are supported
  isNotificationSupported(): boolean {
    return this.isSupported;
  }

  // Get current permission status
  getPermission(): NotificationPermission {
    return this.permission;
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      console.warn("Notifications are not supported in this browser");
      return "denied";
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return "denied";
    }
  }

  // Show a browser notification
  showNotification(
    title: string,
    options: NotificationOptions & {
      onClick?: () => void;
      onClose?: () => void;
      onError?: (error: Event) => void;
    } = {}
  ): Notification | null {
    if (!this.isSupported || this.permission !== "granted") {
      console.warn("Cannot show notification: not supported or permission denied");
      return null;
    }

    const {
      onClick,
      onClose,
      onError,
      ...notificationOptions
    } = options;

    const notification = new Notification(title, {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      ...notificationOptions
    });

    // Set up event handlers
    if (onClick) {
      notification.onclick = (event) => {
        onClick();
        notification.close();
      };
    }

    if (onClose) {
      notification.onclose = onClose;
    }

    if (onError) {
      notification.onerror = onError;
    }

    return notification;
  }

  // Show notification for new order
  showOrderNotification(notification: AppNotification): Notification | null {
    const title = "🛍️ New Order Received!";
    const body = notification.message;
    
    return this.showNotification(title, {
      body,
      tag: `order-${notification.orderId}`,
      requireInteraction: true,
      actions: [
        {
          action: "view",
          title: "View Order"
        },
        {
          action: "dismiss",
          title: "Dismiss"
        }
      ],
      data: {
        notificationId: notification.id,
        orderId: notification.orderId,
        type: "order"
      },
      onClick: () => {
        window.focus();
        if (notification.orderId) {
          window.location.href = `/orders?highlight=${notification.orderId}`;
        }
      }
    });
  }

  // Show notification for payment update
  showPaymentNotification(notification: AppNotification): Notification | null {
    const isPaid = notification.data?.newPaymentStatus === "paid";
    const isFailed = notification.data?.newPaymentStatus === "failed";
    
    const title = isPaid ? "💰 Payment Received!" : 
                  isFailed ? "❌ Payment Failed" : 
                  "⏳ Payment Update";
    
    return this.showNotification(title, {
      body: notification.message,
      tag: `payment-${notification.orderId}`,
      requireInteraction: isFailed,
      data: {
        notificationId: notification.id,
        orderId: notification.orderId,
        type: "payment"
      },
      onClick: () => {
        window.focus();
        if (notification.orderId) {
          window.location.href = `/orders?highlight=${notification.orderId}`;
        }
      }
    });
  }

  // Show notification for system updates
  showSystemNotification(notification: AppNotification): Notification | null {
    return this.showNotification("⚙️ System Update", {
      body: notification.message,
      tag: `system-${notification.id}`,
      requireInteraction: false,
      data: {
        notificationId: notification.id,
        type: "system"
      },
      onClick: () => {
        window.focus();
        window.location.href = "/notifications";
      }
    });
  }

  // Show notification for product updates
  showProductNotification(notification: AppNotification): Notification | null {
    return this.showNotification("📦 Product Update", {
      body: notification.message,
      tag: `product-${notification.data?.productId || notification.id}`,
      requireInteraction: false,
      data: {
        notificationId: notification.id,
        productId: notification.data?.productId,
        type: "product"
      },
      onClick: () => {
        window.focus();
        window.location.href = "/products";
      }
    });
  }

  // Show notification based on type
  showNotificationByType(notification: AppNotification): Notification | null {
    switch (notification.type) {
      case "order":
        return this.showOrderNotification(notification);
      case "payment":
        return this.showPaymentNotification(notification);
      case "system":
        return this.showSystemNotification(notification);
      case "product":
        return this.showProductNotification(notification);
      default:
        return this.showNotification(notification.title, {
          body: notification.message,
          tag: notification.id,
          onClick: () => {
            window.focus();
            window.location.href = "/notifications";
          }
        });
    }
  }

  // Close all notifications with a specific tag
  closeNotificationsByTag(tag: string): void {
    // Note: There's no direct way to close notifications by tag in the browser API
    // This is a limitation of the Notification API
    console.log(`Attempting to close notifications with tag: ${tag}`);
  }

  // Check if notification with tag already exists
  hasNotificationWithTag(tag: string): boolean {
    // Note: There's no direct way to check existing notifications in the browser API
    // This would require maintaining a local registry
    return false;
  }

  // Show multiple notifications (with rate limiting)
  showMultipleNotifications(
    notifications: AppNotification[],
    maxNotifications: number = 3,
    delay: number = 1000
  ): void {
    const limitedNotifications = notifications.slice(0, maxNotifications);
    
    limitedNotifications.forEach((notification, index) => {
      setTimeout(() => {
        this.showNotificationByType(notification);
      }, index * delay);
    });

    // If there are more notifications, show a summary
    if (notifications.length > maxNotifications) {
      const remainingCount = notifications.length - maxNotifications;
      setTimeout(() => {
        this.showNotification("📢 More Notifications", {
          body: `You have ${remainingCount} more notification${remainingCount > 1 ? "s" : ""}`,
          tag: "notification-summary",
          onClick: () => {
            window.focus();
            window.location.href = "/notifications";
          }
        });
      }, limitedNotifications.length * delay);
    }
  }

  // Register service worker for background notifications
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!("serviceWorker" in navigator)) {
      console.warn("Service Workers are not supported");
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      console.log("Service Worker registered successfully:", registration);
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return null;
    }
  }

  // Send message to service worker
  sendMessageToServiceWorker(message: any): void {
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    }
  }

  // Initialize the notification service
  async initialize(): Promise<boolean> {
    try {
      // Register service worker
      await this.registerServiceWorker();
      
      // Request permission if not already granted
      if (this.permission === "default") {
        await this.requestPermission();
      }

      return this.permission === "granted";
    } catch (error) {
      console.error("Error initializing browser notification service:", error);
      return false;
    }
  }
}

