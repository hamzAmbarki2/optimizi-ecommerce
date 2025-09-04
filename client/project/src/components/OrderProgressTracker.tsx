import React from 'react';
import { Clock, CheckCircle, Package, Truck, Star, AlertCircle } from 'lucide-react';

interface OrderProgressTrackerProps {
  currentStatus: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  timestamps?: {
    pending?: string;
    confirmed?: string;
    preparing?: string;
    out_for_delivery?: string;
    delivered?: string;
    cancelled?: string;
  };
  compact?: boolean;
}

export default function OrderProgressTracker({ 
  currentStatus, 
  timestamps = {}, 
  compact = false 
}: OrderProgressTrackerProps) {
  const steps = [
    {
      status: 'pending',
      label: 'Commande passée',
      description: 'Votre commande a été reçue',
      icon: Clock,
      color: 'yellow'
    },
    {
      status: 'confirmed',
      label: 'Confirmée',
      description: 'Commande confirmée et en cours de traitement',
      icon: CheckCircle,
      color: 'blue'
    },
    {
      status: 'preparing',
      label: 'En préparation',
      description: 'Votre commande est en cours de préparation',
      icon: Package,
      color: 'gray'
    },
    {
      status: 'out_for_delivery',
      label: 'En livraison',
      description: 'Votre commande est en route',
      icon: Truck,
      color: 'primary'
    },
    {
      status: 'delivered',
      label: 'Livrée',
      description: 'Commande livrée avec succès',
      icon: Star,
      color: 'green'
    }
  ];

  // Handle cancelled status
  if (currentStatus === 'cancelled') {
    return (
      <div className="flex items-center justify-center p-6 bg-red-50 dark:bg-red-900/20 rounded-soft-lg border border-red-200 dark:border-red-800">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="font-semibold text-red-800 dark:text-red-300 mb-1">Commande annulée</h3>
          <p className="text-sm text-red-600 dark:text-red-400">
            Cette commande a été annulée
            {timestamps.cancelled && (
              <span className="block mt-1">
                le {new Date(timestamps.cancelled).toLocaleString('fr-FR')}
              </span>
            )}
          </p>
        </div>
      </div>
    );
  }

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.status === currentStatus);
  };

  const currentStepIndex = getCurrentStepIndex();

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'current';
    return 'pending';
  };

  const getStepStyles = (stepIndex: number, color: string) => {
    const status = getStepStatus(stepIndex);
    
    if (status === 'completed') {
      return {
        iconBg: 'bg-green-100 dark:bg-green-900/30',
        iconColor: 'text-green-600 dark:text-green-400',
        textColor: 'text-green-800 dark:text-green-300',
        lineColor: 'bg-green-500'
      };
    }
    
    if (status === 'current') {
      const colorMap = {
        yellow: {
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          textColor: 'text-yellow-800 dark:text-yellow-300',
          lineColor: 'bg-yellow-500'
        },
        blue: {
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          iconColor: 'text-blue-600 dark:text-blue-400',
          textColor: 'text-blue-800 dark:text-blue-300',
          lineColor: 'bg-blue-500'
        },
        gray: {
          iconBg: 'bg-gray-100 dark:bg-gray-800/50',
          iconColor: 'text-gray-600 dark:text-gray-400',
          textColor: 'text-gray-800 dark:text-gray-300',
          lineColor: 'bg-gray-500'
        },
        primary: {
          iconBg: 'bg-primary-100 dark:bg-primary-900/30',
          iconColor: 'text-primary-600 dark:text-primary-400',
          textColor: 'text-primary-800 dark:text-primary-300',
          lineColor: 'bg-primary-500'
        },
        green: {
          iconBg: 'bg-green-100 dark:bg-green-900/30',
          iconColor: 'text-green-600 dark:text-green-400',
          textColor: 'text-green-800 dark:text-green-300',
          lineColor: 'bg-green-500'
        }
      };
      return colorMap[color as keyof typeof colorMap] || colorMap.gray;
    }
    
    return {
      iconBg: 'bg-gray-100 dark:bg-gray-700',
      iconColor: 'text-gray-400 dark:text-gray-500',
      textColor: 'text-gray-500 dark:text-gray-400',
      lineColor: 'bg-gray-300 dark:bg-gray-600'
    };
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {steps.map((step, index) => {
          const styles = getStepStyles(index, step.color);
          const Icon = step.icon;
          const status = getStepStatus(index);
          
          return (
            <React.Fragment key={step.status}>
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                ${styles.iconBg} ${status === 'current' ? 'ring-2 ring-offset-2 ring-current ring-opacity-50' : ''}
              `}>
                <Icon className={`w-4 h-4 ${styles.iconColor}`} />
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 w-8 transition-all duration-300 ${
                  status === 'completed' ? styles.lineColor : 'bg-gray-300 dark:bg-gray-600'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {steps.map((step, index) => {
        const styles = getStepStyles(index, step.color);
        const Icon = step.icon;
        const status = getStepStatus(index);
        const timestamp = timestamps[step.status as keyof typeof timestamps];
        
        return (
          <div key={step.status} className="flex items-start space-x-4">
            <div className="flex flex-col items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                ${styles.iconBg} ${status === 'current' ? 'ring-2 ring-offset-2 dark:ring-offset-gray-800 ring-current ring-opacity-50 scale-110' : ''}
              `}>
                <Icon className={`w-5 h-5 ${styles.iconColor}`} />
              </div>
              {index < steps.length - 1 && (
                <div className={`w-0.5 h-12 mt-2 transition-all duration-300 ${
                  status === 'completed' ? styles.lineColor : 'bg-gray-300 dark:bg-gray-600'
                }`} />
              )}
            </div>
            
            <div className="flex-1 min-w-0 pb-8">
              <div className="flex items-center justify-between mb-1">
                <h3 className={`font-semibold transition-colors ${styles.textColor}`}>
                  {step.label}
                </h3>
                {timestamp && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(timestamp).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                )}
              </div>
              <p className={`text-sm transition-colors ${
                status === 'pending' ? 'text-gray-500 dark:text-gray-400' : styles.textColor
              }`}>
                {step.description}
              </p>
              {status === 'current' && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                    <span className="text-xs font-medium">En cours</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}