// File: /home/ubuntu/project-bolt/project/public/firebase-messaging-sw.js

// Firebase Messaging Service Worker
// This service worker handles background notifications

importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js" );
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js" );

// Initialize Firebase in the service worker
const firebaseConfig = {
  apiKey: "AIzaSyC5GFe23pkjn08q86V4uSBD_bTbIpV8FEI",
  authDomain: "optimizihaha.firebaseapp.com",
  projectId: "optimizihaha",
  storageBucket: "optimizihaha.firebasestorage.app",
  messagingSenderId: "421493955351",
  appId: "1:421493955351:web:76770b68464bc88dc1f552",
  measurementId: "G-VG7RHZ85Q4"
};

firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging object
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message:", payload);

  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification",
    icon: payload.notification?.icon || "/favicon.ico",
    badge: "/favicon.ico",
    tag: payload.data?.tag || "default",
    data: payload.data || {},
    actions: [
      {
        action: "view",
        title: "View",
        icon: "/favicon.ico"
      },
      {
        action: "dismiss",
        title: "Dismiss",
        icon: "/favicon.ico"
      }
    ],
    requireInteraction: true,
    silent: false
  };

  // Show the notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click events
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);

  event.notification.close();

  if (event.action === "view") {
    // Open the app or navigate to specific page
    const urlToOpen = event.notification.data?.url || "/";
    
    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
          // Check if there's already a window/tab open with the target URL
          for (const client of clientList) {
            if (client.url === urlToOpen && "focus" in client) {
              return client.focus();
            }
          }
          
          // If no existing window/tab, open a new one
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  } else if (event.action === "dismiss") {
    // Just close the notification (already done above)
    console.log("Notification dismissed");
  } else {
    // Default action (clicking the notification body)
    const urlToOpen = event.notification.data?.url || "/";
    
    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && "focus" in client) {
              return client.focus();
            }
          }
          
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Handle push events (for custom push notifications)
self.addEventListener("push", (event) => {
  console.log("Push event received:", event);

  if (event.data) {
    const data = event.data.json();
    const title = data.title || "New Notification";
    const options = {
      body: data.body || "You have a new notification",
      icon: data.icon || "/favicon.ico",
      badge: "/favicon.ico",
      tag: data.tag || "default",
      data: data.data || {},
      requireInteraction: data.requireInteraction || false
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

// Handle service worker installation
self.addEventListener("install", (event) => {
  console.log("Firebase Messaging Service Worker installed");
  self.skipWaiting();
});

// Handle service worker activation
self.addEventListener("activate", (event) => {
  console.log("Firebase Messaging Service Worker activated");
  event.waitUntil(self.clients.claim());
});

// Handle message events from the main thread
self.addEventListener("message", (event) => {
  console.log("Service Worker received message:", event.data);
  
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { title, options } = event.data;
    self.registration.showNotification(title, options);
  }
});

