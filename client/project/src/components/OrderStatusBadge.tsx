import React from 'react';
import { Clock, CheckCircle, Package, Truck, Star, AlertCircle } from 'lucide-react';

interface OrderStatusBadgeProps {
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export default function OrderStatusBadge({ status, size = 'md', showIcon = true }: OrderStatusBadgeProps) {
  const statusConfig = {
    pending: {
      type: 'warning',
      label: 'En attente',
      icon: Clock,
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      textColor: 'text-yellow-800 dark:text-yellow-300',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      iconColor: 'text-yellow-600 dark:text-yellow-400'
    },
    confirmed: {
      type: 'info',
      label: 'Confirmée',
      icon: CheckCircle,
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-800 dark:text-blue-300',
      borderColor: 'border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    preparing: {
      type: 'secondary',
      label: 'En préparation',
      icon: Package,
      bgColor: 'bg-gray-100 dark:bg-gray-800/50',
      textColor: 'text-gray-800 dark:text-gray-300',
      borderColor: 'border-gray-200 dark:border-gray-700',
      iconColor: 'text-gray-600 dark:text-gray-400'
    },
    out_for_delivery: {
      type: 'primary',
      label: 'En livraison',
      icon: Truck,
      bgColor: 'bg-primary-100 dark:bg-primary-900/30',
      textColor: 'text-primary-800 dark:text-primary-300',
      borderColor: 'border-primary-200 dark:border-primary-800',
      iconColor: 'text-primary-600 dark:text-primary-400'
    },
    delivered: {
      type: 'success',
      label: 'Livrée',
      icon: Star,
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-800 dark:text-green-300',
      borderColor: 'border-green-200 dark:border-green-800',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    cancelled: {
      type: 'error',
      label: 'Annulée',
      icon: AlertCircle,
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      textColor: 'text-red-800 dark:text-red-300',
      borderColor: 'border-red-200 dark:border-red-800',
      iconColor: 'text-red-600 dark:text-red-400'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span className={`
      inline-flex items-center gap-1.5 font-medium rounded-full border
      ${config.bgColor} ${config.textColor} ${config.borderColor}
      ${sizeClasses[size]}
    `}>
      {showIcon && <Icon className={`${iconSizes[size]} ${config.iconColor}`} />}
      {config.label}
    </span>
  );
}