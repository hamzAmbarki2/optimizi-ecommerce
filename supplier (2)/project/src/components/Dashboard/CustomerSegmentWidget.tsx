import React, { useState } from 'react';
import { CustomerSegment } from '../../types/customerSegments';
import { UsersIcon, StarIcon, UserPlusIcon, HeartIcon } from '@heroicons/react/24/outline';
import CustomerSegmentDetailModal from './CustomerSegmentDetailModal';
import { useCustomerSegments } from '../../hooks/useCustomerSegments';

interface CustomerSegmentWidgetProps {
  segments: CustomerSegment[];
  loading?: boolean;
  showInsights?: boolean;
  fournisseurId?: string | null;
  enableDetailView?: boolean;
}

const CustomerSegmentWidget: React.FC<CustomerSegmentWidgetProps> = ({ 
  segments, 
  loading, 
  showInsights = false,
  fournisseurId = null,
  enableDetailView = false
}) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { analytics } = useCustomerSegments(fournisseurId);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getSegmentIcon = (segment: string) => {
    switch (segment) {
      case 'High Value':
        return <StarIcon className="h-5 w-5 text-yellow-500" />;
      case 'Medium Value':
        return <HeartIcon className="h-5 w-5 text-purple-500" />;
      case 'Low Value':
        return <UsersIcon className="h-5 w-5 text-blue-500" />;
      case 'New Customers':
        return <UserPlusIcon className="h-5 w-5 text-green-500" />;
      default:
        return <UsersIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'High Value':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
      case 'Medium Value':
        return 'bg-gradient-to-r from-purple-400 to-purple-500';
      case 'Low Value':
        return 'bg-gradient-to-r from-blue-400 to-blue-500';
      case 'New Customers':
        return 'bg-gradient-to-r from-green-400 to-green-500';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  const getSegmentBgColor = (segment: string) => {
    switch (segment) {
      case 'High Value':
        return 'bg-yellow-500';
      case 'Medium Value':
        return 'bg-purple-500';
      case 'Low Value':
        return 'bg-blue-500';
      case 'New Customers':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const totalCustomers = segments.reduce((sum, segment) => sum + segment.count, 0);
  const totalRevenue = segments.reduce((sum, segment) => sum + segment.revenue, 0);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Customer Segments</h3>
        <UsersIcon className="h-6 w-6 text-blue-500" />
      </div>
      
      {segments.length === 0 || totalCustomers === 0 ? (
        <div className="text-center py-8">
          <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No customer data available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {segments.map((segment, index) => {
            const customerPercentage = totalCustomers > 0 ? (segment.count / totalCustomers) * 100 : 0;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getSegmentIcon(segment.segment)}
                    <span className="font-medium text-gray-900">{segment.segment}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{segment.count} customers</p>
                    <p className="text-xs text-gray-600">{segment.revenue.toFixed(2)} TND</p>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getSegmentBgColor(segment.segment)} transition-all duration-500`}
                      style={{ width: `${customerPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>{customerPercentage.toFixed(1)}% of customers</span>
                    <span>{segment.percentage.toFixed(1)}% of revenue</span>
                  </div>
                </div>
              </div>
            );
          })}
          
          <div className="pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
                <p className="text-2xl font-bold text-blue-700">{totalCustomers}</p>
                <p className="text-sm text-blue-600 font-medium">Total Customers</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
                <p className="text-2xl font-bold text-green-700">{totalRevenue.toFixed(0)} TND</p>
                <p className="text-sm text-green-600 font-medium">Total Revenue</p>
              </div>
            </div>
            
            {showInsights && segments.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-600 font-medium mb-1">Quick Insight:</p>
                <p className="text-sm text-gray-800">
                  {segments[0]?.count > 0 && (
                    `Your ${segments[0].segment.toLowerCase()} customers (${segments[0].count}) generate ${segments[0].percentage.toFixed(1)}% of total revenue.`
                  )}
                </p>
              </div>
            )}
            
            {enableDetailView && (
              <div className="mt-4">
                <button
                  onClick={() => setShowDetailModal(true)}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2 rounded-xl hover:bg-blue-50 transition-all duration-200 border border-blue-200 hover:border-blue-300"
                >
                  View Detailed Analysis
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Detail Modal */}
      <CustomerSegmentDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        segments={segments}
        analytics={analytics}
      />
    </div>
  );
};

export default CustomerSegmentWidget;