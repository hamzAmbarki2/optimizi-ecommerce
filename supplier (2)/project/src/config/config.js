// File: /home/ubuntu/project-bolt/project/src/config/config.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: "AIzaSyC5GFe23pkjn08q86V4uSBD_bTbIpV8FEI",
    authDomain: "optimizihaha.firebaseapp.com",
    projectId: "optimizihaha",
    storageBucket: "optimizihaha.firebasestorage.app",
    messagingSenderId: "421493955351",
    appId: "1:421493955351:web:76770b68464bc88dc1f552",
    measurementId: "G-VG7RHZ85Q4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Firebase Cloud Messaging (FCM)
let messaging = null;
try {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    messaging = getMessaging(app);
  }
} catch (error) {
  console.warn('Firebase Messaging not supported in this environment:', error);
}

export { messaging };

// Firebase Cloud Messaging configuration
export const FCM_CONFIG = {
  vapidKey: "BKxvxhk5f8L9pQfRiCoHkTtSrhKpwHhnkzyTwHdLEo6pjfBzMjfqg8L9pQfRiCoHkTtSrhKpwHhnkzyTwHdLEo6p" // Replace with your actual VAPID key
};

// Request FCM token
export const requestFCMToken = async () => {
  if (!messaging) {
    console.warn('Firebase Messaging not available');
    return null;
  }

  // Check if notification permission is granted before requesting token
  if ('Notification' in window && Notification.permission !== 'granted') {
    console.warn('Notification permission not granted, skipping FCM token request');
    return null;
  }
  try {
    const token = await getToken(messaging, {
      vapidKey: FCM_CONFIG.vapidKey
    });
    
    if (token) {
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('No registration token available.');
      return null;
    }
  } catch (error) {
    console.warn('An error occurred while retrieving token (may be due to permission settings):', error);
    return null;
  }
};

// Listen for foreground messages
export const onForegroundMessage = (callback) => {
  if (!messaging) {
    console.warn('Firebase Messaging not available');
    return () => {};
  }

  return onMessage(messaging, (payload) => {
    console.log('Message received in foreground:', payload);
    callback(payload);
  });
};

// Network status management
export const enableFirebaseNetwork = async () => {
  try {
    await enableNetwork(db);
    console.log('Firebase network enabled');
  } catch (error) {
    console.error('Error enabling Firebase network:', error);
  }
};

export const disableFirebaseNetwork = async () => {
  try {
    await disableNetwork(db);
    console.log('Firebase network disabled');
  } catch (error) {
    console.error('Error disabling Firebase network:', error);
  }
};

// Connection state monitoring
export const monitorFirebaseConnection = (callback) => {
  // This is a simple implementation - in production you might want to use
  // Firebase's built-in connection monitoring
  const checkConnection = () => {
    callback(navigator.onLine);
  };

  window.addEventListener('online', checkConnection);
  window.addEventListener('offline', checkConnection);
  
  // Initial check
  checkConnection();

  // Return cleanup function
  return () => {
    window.removeEventListener('online', checkConnection);
    window.removeEventListener('offline', checkConnection);
  };
};

// Export the app instance
export default app;
