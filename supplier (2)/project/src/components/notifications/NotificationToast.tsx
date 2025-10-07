// File: /home/ubuntu/project-bolt/project/src/components/notifications/NotificationToast.tsx

import React, { useEffect, useState } from 'react';
import { Transition } from '@headlessui/react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
  BellIcon
} from '@heroicons/react/24/outline';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'notification';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationToastProps {
  notification: ToastNotification;
  onClose: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  const [show, setShow] = useState(true);
  const [progress, setProgress] = useState(100);

  const duration = notification.duration || 5000;

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 100);

    // Auto dismiss timer
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(() => onClose(notification.id), 300);
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [notification.id, duration, onClose]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose(notification.id), 300);
  };

  const getIcon = () => {
    const iconClass = "h-6 w-6";
    switch (notification.type) {
      case 'success':
        return <CheckCircleIcon className={`${iconClass} text-green-500`} />;
      case 'error':
        return <XCircleIcon className={`${iconClass} text-red-500`} />;
      case 'warning':
        return <ExclamationTriangleIcon className={`${iconClass} text-yellow-500`} />;
      case 'info':
        return <InformationCircleIcon className={`${iconClass} text-blue-500`} />;
      case 'notification':
        return <BellIcon className={`${iconClass} text-purple-500`} />;
      default:
        return <InformationCircleIcon className={`${iconClass} text-blue-500`} />;
    }
  };

  const getColors = () => {
    switch (notification.type) {
      case 'success':
        return {
          border: 'border-green-200',
          bg: 'bg-green-50',
          progress: 'bg-green-500',
          accent: 'bg-green-500'
        };
      case 'error':
        return {
          border: 'border-red-200',
          bg: 'bg-red-50',
          progress: 'bg-red-500',
          accent: 'bg-red-500'
        };
      case 'warning':
        return {
          border: 'border-yellow-200',
          bg: 'bg-yellow-50',
          progress: 'bg-yellow-500',
          accent: 'bg-yellow-500'
        };
      case 'info':
        return {
          border: 'border-blue-200',
          bg: 'bg-blue-50',
          progress: 'bg-blue-500',
          accent: 'bg-blue-500'
        };
      case 'notification':
        return {
          border: 'border-purple-200',
          bg: 'bg-purple-50',
          progress: 'bg-purple-500',
          accent: 'bg-purple-500'
        };
      default:
        return {
          border: 'border-blue-200',
          bg: 'bg-blue-50',
          progress: 'bg-blue-500',
          accent: 'bg-blue-500'
        };
    }
  };

  const colors = getColors();

  return (
    <Transition
      show={show}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2 scale-95"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0 scale-100"
      leave="transition ease-in duration-200"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-95"
    >
      <div className={`max-w-sm w-full bg-white shadow-xl rounded-2xl pointer-events-auto ring-1 ring-black ring-opacity-5 border-2 ${colors.border} overflow-hidden relative`}>
        {/* Progress bar */}
        <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full">
          <div 
            className={`h-full ${colors.progress} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Accent line */}
        <div className={`absolute left-0 top-1 bottom-0 w-1 ${colors.accent}`} />

        <div className={`p-4 ${colors.bg}`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="p-1 bg-white rounded-full shadow-sm">
                {getIcon()}
              </div>
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-semibold text-gray-900">
                {notification.title}
              </p>
              <p className="mt-1 text-sm text-gray-700 leading-relaxed">
                {notification.message}
              </p>
              
              {/* Action button */}
              {notification.action && (
                <div className="mt-3">
                  <button
                    onClick={notification.action.onClick}
                    className={`text-sm font-medium ${colors.progress.replace('bg-', 'text-')} hover:underline focus:outline-none`}
                  >
                    {notification.action.label}
                  </button>
                </div>
              )}
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="bg-white rounded-full p-1 inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 shadow-sm hover:shadow-md"
                onClick={handleClose}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
};

export default NotificationToast;
