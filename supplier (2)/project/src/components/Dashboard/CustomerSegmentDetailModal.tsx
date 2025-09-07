import React from 'react';
import { XMarkIcon, UsersIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import { CustomerSegment } from '../../types/customerSegments';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface CustomerSegmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  segments: CustomerSegment[];
  analytics: {
    totalCustomers: number;
    totalRevenue: number;
    averageOrderValue: number;
    retentionRate: number;
  };
}

const CustomerSegmentDetailModal: React.FC<CustomerSegmentDetailModalProps> = ({
  isOpen,
  onClose,
  segments,
  analytics
}) => {
  if (!isOpen) return null;

  const getSegmentRecommendations = (segment: CustomerSegment) => {
    switch (segment.segment) {
      case 'High Value':
        return [
          'Implement VIP loyalty programs with exclusive benefits',
          'Provide dedicated customer support channels',
          'Offer early access to new products',
          'Send personalized product recommendations'
        ];
      case 'Medium Value':
        return [
          'Create targeted upselling campaigns',
          'Offer bundle deals to increase order value',
          'Implement referral incentives',
          'Send regular engagement emails'
        ];
      case 'Low Value':
        return [
          'Focus on retention with special offers',
          'Improve product recommendations',
          'Gather feedback to understand barriers',
          'Offer loyalty points for repeat purchases'
        ];
      case 'New Customers':
        return [
          'Create comprehensive onboarding sequences',
          'Offer first-time buyer discounts',
          'Send educational content about products',
          'Follow up with satisfaction surveys'
        ];
      default:
        return [];
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100">
          <p className="font-semibold text-gray-900">{data.segment}</p>
          <p className="text-blue-600">{data.count} customers</p>
          <p className="text-green-600">${data.revenue.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <UsersIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Customer Segments Analysis</h2>
              <p className="text-gray-600 mt-1">Detailed breakdown of your customer base</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 font-medium">Total Customers</p>
                <p className="text-3xl font-bold text-blue-700">{analytics.totalCustomers}</p>
              </div>
              <UsersIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-green-700">${analytics.totalRevenue.toFixed(0)}</p>
              </div>
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 font-medium">Avg Order Value</p>
                <p className="text-3xl font-bold text-purple-700">${analytics.averageOrderValue.toFixed(2)}</p>
              </div>
              <ArrowTrendingUpIcon className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 font-medium">Retention Rate</p>
                <p className="text-3xl font-bold text-yellow-700">{analytics.retentionRate.toFixed(1)}%</p>
              </div>
              <ArrowTrendingUpIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Charts */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={segments}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="count"
                    >
                      {segments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Segment</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={segments}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="segment" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Segment Details */}
          <div className="space-y-6">
            {segments.map((segment, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{segment.segment}</h3>
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Customers</p>
                    <p className="text-2xl font-bold text-gray-900">{segment.count}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${segment.revenue.toFixed(2)}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Revenue Share</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${segment.percentage}%`,
                        backgroundColor: segment.color
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{segment.percentage.toFixed(1)}%</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Recommendations:</p>
                  <ul className="space-y-1">
                    {getSegmentRecommendations(segment).slice(0, 2).map((rec, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-start">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSegmentDetailModal;