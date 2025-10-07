import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  gradient: string;
  description?: string;
  onClick?: () => void;
  hasDetails?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
  gradient,
  description,
  onClick,
  hasDetails = false
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      case 'neutral':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase':
        return '↗';
      case 'decrease':
        return '↘';
      case 'neutral':
        return '→';
      default:
        return '';
    }
  };

  return (
    <div 
      className={`bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group relative ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      }`}
      onClick={onClick}
    >
      {hasDetails && (
        <div className="absolute top-3 right-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
            {title}
          </h3>
          {description && (
            <div className="relative group/tooltip">
              <InformationCircleIcon className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                {description}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl ${gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
          {icon}
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-3xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
          {typeof value === 'number' && value > 999 
            ? value.toLocaleString() 
            : value
          }
        </p>
        
        {change && (
          <div className="flex items-center space-x-1">
            <span className={`text-sm font-medium ${getChangeColor()}`}>
              {getChangeIcon()} {change}
            </span>
            <span className="text-sm text-gray-500">vs last month</span>
          </div>
        )}
        
        {hasDetails && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-blue-600 font-medium">Click for detailed analysis</span>
          </div>
        )}
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl pointer-events-none"></div>
    </div>
  );
};

export default KPICard;