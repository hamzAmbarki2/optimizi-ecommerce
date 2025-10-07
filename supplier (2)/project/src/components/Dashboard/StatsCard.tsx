import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
  gradient: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
  gradient
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {change && (
            <div className="flex items-center">
              <span
                className={`text-sm font-medium ${
                  changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {changeType === 'increase' ? '+' : '-'}{change}
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-16 h-16 rounded-2xl ${gradient} flex items-center justify-center shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;