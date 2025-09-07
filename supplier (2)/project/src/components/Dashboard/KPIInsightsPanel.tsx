import React from 'react';
import { DashboardMetrics } from '../../types/dashboard';
import {
  LightBulbIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface KPIInsightsPanelProps {
  metrics: DashboardMetrics;
}

const KPIInsightsPanel: React.FC<KPIInsightsPanelProps> = ({ metrics }) => {
  const generateInsights = () => {
    const insights = [];

    if (metrics.revenueGrowth > 15) {
      insights.push({
        type: 'success',
        icon: <ArrowTrendingUpIcon className="h-5 w-5" />,
        title: 'Strong Revenue Growth',
        message: `Revenue is growing at ${metrics.revenueGrowth.toFixed(1)}% - well above industry average!`,
        action: 'Consider scaling marketing efforts to maintain momentum.'
      });
    } else if (metrics.revenueGrowth < 0) {
      insights.push({
        type: 'warning',
        icon: <ArrowTrendingDownIcon className="h-5 w-5" />,
        title: 'Revenue Decline',
        message: `Revenue has decreased by ${Math.abs(metrics.revenueGrowth).toFixed(1)}% this month.`,
        action: 'Review pricing strategy and customer feedback immediately.'
      });
    }

    if (metrics.outOfStockProducts > 0) {
      insights.push({
        type: 'alert',
        icon: <ExclamationTriangleIcon className="h-5 w-5" />,
        title: 'Stock Issues',
        message: `${metrics.outOfStockProducts} products are out of stock, ${metrics.lowStockProducts} are running low.`,
        action: 'Prioritize restocking popular items to avoid lost sales.'
      });
    }

    if (metrics.customerRetentionRate > 30) {
      insights.push({
        type: 'success',
        icon: <CheckCircleIcon className="h-5 w-5" />,
        title: 'Excellent Customer Loyalty',
        message: `${metrics.customerRetentionRate.toFixed(1)}% retention rate is above industry benchmark.`,
        action: 'Leverage loyal customers for referral programs.'
      });
    } else if (metrics.customerRetentionRate < 20) {
      insights.push({
        type: 'warning',
        icon: <ExclamationTriangleIcon className="h-5 w-5" />,
        title: 'Low Customer Retention',
        message: `Only ${metrics.customerRetentionRate.toFixed(1)}% of customers return for repeat purchases.`,
        action: 'Implement loyalty programs and improve customer experience.'
      });
    }

    if (metrics.fulfillmentRate < 95) {
      insights.push({
        type: 'alert',
        icon: <ClockIcon className="h-5 w-5" />,
        title: 'Fulfillment Issues',
        message: `${metrics.fulfillmentRate.toFixed(1)}% fulfillment rate is below optimal levels.`,
        action: 'Review shipping processes and partner reliability.'
      });
    }

    if (metrics.averageOrderValue > 100) {
      insights.push({
        type: 'success',
        icon: <ArrowTrendingUpIcon className="h-5 w-5" />,
        title: 'High Order Values',
        message: `Average order value of $${metrics.averageOrderValue.toFixed(2)} indicates strong customer engagement.`,
        action: 'Continue promoting premium products and bundles.'
      });
    }

    if (metrics.conversionRate > 3) {
      insights.push({
        type: 'success',
        icon: <CheckCircleIcon className="h-5 w-5" />,
        title: 'Strong Conversion Rate',
        message: `${metrics.conversionRate.toFixed(1)}% conversion rate is above industry average.`,
        action: 'Document successful strategies for scaling.'
      });
    } else if (metrics.conversionRate < 2) {
      insights.push({
        type: 'warning',
        icon: <ExclamationTriangleIcon className="h-5 w-5" />,
        title: 'Low Conversion Rate',
        message: `${metrics.conversionRate.toFixed(1)}% conversion needs improvement.`,
        action: 'Optimize product pages and checkout process.'
      });
    }

    return insights;
  };

  const insights = generateInsights();

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'alert':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIconStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'alert':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">
      <div className="flex items-center space-x-3 mb-6">
        <LightBulbIcon className="h-8 w-8 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-900">Business Insights & Recommendations</h2>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-8">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4">
            <CheckCircleIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">All Systems Running Smoothly</h3>
          <p className="text-gray-600">Your business metrics are performing well. Keep up the great work!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {insights.map((insight, index) => (
            <div key={index} className={`border rounded-2xl p-6 ${getInsightStyle(insight.type)}`}>
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 ${getIconStyle(insight.type)}`}>
                  {insight.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{insight.title}</h3>
                  <p className="mb-3 leading-relaxed">{insight.message}</p>
                  <div className="bg-white bg-opacity-50 rounded-xl p-3">
                    <p className="text-sm font-medium">
                      <span className="text-gray-600">Recommended Action:</span> {insight.action}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KPIInsightsPanel;
