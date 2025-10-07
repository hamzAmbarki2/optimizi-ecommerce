// File: /home/ubuntu/project-bolt/project/src/components/notifications/ToastContainer.tsx

import React, { useState, useCallback, useEffect } from 'react';
import NotificationToast, { ToastNotification } from './NotificationToast';

interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ 
  position = 'top-right',
  maxToasts = 5 
}) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = useCallback((toast: Omit<ToastNotification, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastNotification = { ...toast, id };
    
    setToasts(prev => {
      const updatedToasts = [newToast, ...prev];
      // Limit the number of toasts
      return updatedToasts.slice(0, maxToasts);
    });

    // Play notification sound (optional)
    if ('Audio' in window) {
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        audio.volume = 0.1;
        audio.play().catch(() => {}); // Ignore errors
      } catch (error) {
        // Ignore audio errors
      }
    }
  }, [maxToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const getPositionClasses = () => {
    const baseClasses = 'fixed z-50 pointer-events-none';
    const spacing = 'p-4 space-y-4';
    
    switch (position) {
      case 'top-left':
        return `${baseClasses} top-0 left-0 ${spacing}`;
      case 'top-center':
        return `${baseClasses} top-0 left-1/2 transform -translate-x-1/2 ${spacing}`;
      case 'top-right':
        return `${baseClasses} top-0 right-0 ${spacing}`;
      case 'bottom-left':
        return `${baseClasses} bottom-0 left-0 ${spacing}`;
      case 'bottom-center':
        return `${baseClasses} bottom-0 left-1/2 transform -translate-x-1/2 ${spacing}`;
      case 'bottom-right':
        return `${baseClasses} bottom-0 right-0 ${spacing}`;
      default:
        return `${baseClasses} top-0 right-0 ${spacing}`;
    }
  };

  const getAnimationDirection = () => {
    return position.includes('bottom') ? 'flex-col-reverse' : 'flex-col';
  };

  // Expose addToast function globally
  useEffect(() => {
    (window as any).showToast = addToast;
    return () => {
      delete (window as any).showToast;
    };
  }, [addToast]);

  // Keyboard shortcuts for dismissing toasts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && toasts.length > 0) {
        // Remove the most recent toast
        const latestToast = toasts[0];
        if (latestToast) {
          removeToast(latestToast.id);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toasts, removeToast]);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className={getPositionClasses()}
      style={{ maxWidth: '420px', minWidth: '320px' }}
    >
      <div className={`flex ${getAnimationDirection()}`}>
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className="pointer-events-auto"
            style={{
              zIndex: 1000 - index, // Ensure proper stacking
            }}
          >
            <NotificationToast
              notification={toast}
              onClose={removeToast}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;

// Enhanced helper functions for showing different types of toasts
export const showToast = (toast: Omit<ToastNotification, 'id'>) => {
  if ((window as any).showToast) {
    (window as any).showToast(toast);
  }
};

export const showSuccessToast = (title: string, message: string, action?: ToastNotification['action']) => {
  showToast({
    type: 'success',
    title,
    message,
    action,
    duration: 4000
  });
};

export const showErrorToast = (title: string, message: string, action?: ToastNotification['action']) => {
  showToast({
    type: 'error',
    title,
    message,
    action,
    duration: 6000
  });
};

export const showWarningToast = (title: string, message: string, action?: ToastNotification['action']) => {
  showToast({
    type: 'warning',
    title,
    message,
    action,
    duration: 5000
  });
};

export const showInfoToast = (title: string, message: string, action?: ToastNotification['action']) => {
  showToast({
    type: 'info',
    title,
    message,
    action,
    duration: 4000
  });
};

export const showNotificationToast = (title: string, message: string, action?: ToastNotification['action']) => {
  showToast({
    type: 'notification',
    title,
    message,
    action,
    duration: 5000
  });
};
