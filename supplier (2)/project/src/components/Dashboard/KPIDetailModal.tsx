import React from 'react';
import {
  XMarkIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface KPIDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  kpi: {
    id: string;
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'increase' | 'decrease' | 'neutral';
    icon: React.ReactNode;
    gradient: string;
    description?: string;
    details?: {
      explanation: string;
      calculation: string;
      benchmark: string;
      insights: string[];
      recommendations: string[];
      trendData: Array<{ period: string; value: number }>;
      breakdown?: Array<{ label: string; value: number; percentage: number }>;
      relatedMetrics: Array<{ name: string; value: string; impact: 'positive' | 'negative' | 'neutral' }>;
    };
  };
}

const KPIDetailModal: React.FC<KPIDetailModalProps> = ({ isOpen, onClose, kpi }) => {
  if (!isOpen || !kpi.details) return null;

  const { details } = kpi;

  const getTrendIcon = () => {
    if (!kpi.change) return null;

    switch (kpi.changeType) {
      case 'increase':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />;
      case 'decrease':
        return <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-400" />;
    }
  };

  const getChangeColor = () => {
    switch (kpi.changeType) {
      case 'increase':
        return 'text-green-600 bg-green-50';
      case 'decrease':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive':
        return 'text-green-600 bg-green-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-2xl ${kpi.gradient} flex items-center justify-center shadow-lg`}>
              {kpi.icon}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{kpi.title}</h2>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-4xl font-bold text-gray-900">{kpi.value}</span>
                {kpi.change && (
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getChangeColor()}`}>
                    {getTrendIcon()}
                    <span className="font-semibold">{kpi.change}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-blue-50 rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <InformationCircleIcon className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">What This Metric Means</h3>
              </div>
              <p className="text-blue-800 leading-relaxed">{details.explanation}</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">How It's Calculated</h3>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <code className="text-sm text-gray-700 font-mono">{details.calculation}</code>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Trend Analysis (Last 12 Months)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={details.trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="period" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {details.breakdown && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Breakdown Analysis</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={details.breakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="label" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-yellow-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4">Industry Benchmark</h3>
              <p className="text-yellow-800">{details.benchmark}</p>
            </div>

            <div className="bg-green-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Key Insights</h3>
              <ul className="space-y-3">
                {details.insights.map((insight, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-green-800 text-sm">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-purple-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">Recommendations</h3>
              <ul className="space-y-3">
                {details.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-purple-800 text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Metrics</h3>
              <div className="space-y-3">
                {details.relatedMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-xl">
                    <span className="text-sm font-medium text-gray-900">{metric.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900">{metric.value}</span>
                      <div className={`w-3 h-3 rounded-full ${
                        metric.impact === 'positive' ? 'bg-green-500' :
                        metric.impact === 'negative' ? 'bg-red-500' : 'bg-gray-400'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPIDetailModal;
