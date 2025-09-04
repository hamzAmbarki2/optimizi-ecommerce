import React from 'react';
import { useState } from 'react';
import { DashboardMetrics } from '../../types/dashboard';
import KPICard from './KPICard';
import KPIDetailModal from './KPIDetailModal';
import { KPIDetailService } from '../../services/kpiDetailService';
import {
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  StarIcon,
  ExclamationTriangleIcon,
  ArchiveBoxIcon,
  BanknotesIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';

interface KPIGridProps {
  metrics: DashboardMetrics;
  loading?: boolean;
}

const KPIGrid: React.FC<KPIGridProps> = ({ metrics, loading }) => {
  const [selectedKPI, setSelectedKPI] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const handleKPIClick = (kpiId: string, kpiData: any) => {
    const details = KPIDetailService.getKPIDetails(kpiId, metrics);
    if (details) {
      setSelectedKPI({
        ...kpiData,
        id: kpiId,
        details
      });
      setShowModal(true);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="bg-white rounded-3xl p-6 shadow-lg animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="w-16 h-16 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const kpiCards = [
    // Basic Metrics
    {
      id: 'total-products',
      title: 'Total Products',
      value: metrics.totalProducts,
      change: '12%',
      changeType: 'increase' as const,
      icon: <ShoppingBagIcon className="h-8 w-8 text-white" />,
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      description: 'Active products in catalog',
      hasDetails: true
    },
    {
      id: 'total-orders',
      title: 'Total Orders',
      value: metrics.totalOrders,
      change: '8%',
      changeType: 'increase' as const,
      icon: <ClipboardDocumentListIcon className="h-8 w-8 text-white" />,
      gradient: 'bg-gradient-to-br from-green-500 to-green-600',
      description: 'Orders received',
      hasDetails: true
    },
    {
      id: 'total-revenue',
      title: 'Total Revenue',
      value: `${metrics.totalRevenue.toFixed(2)} TND`,
      change: `${metrics.revenueGrowth.toFixed(1)}%`,
      changeType: metrics.revenueGrowth >= 0 ? 'increase' as const : 'decrease' as const,
      icon: <CurrencyDollarIcon className="h-8 w-8 text-white" />,
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
      description: 'Revenue from paid orders',
      hasDetails: true
    },
    {
      id: 'total-customers',
      title: 'Total Customers',
      value: metrics.totalCustomers,
      change: `${metrics.customerGrowth.toFixed(1)}%`,
      changeType: metrics.customerGrowth >= 0 ? 'increase' as const : 'decrease' as const,
      icon: <UsersIcon className="h-8 w-8 text-white" />,
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
      description: 'Unique customers',
      hasDetails: true
    },

    // Advanced Metrics
    {
      id: 'average-order-value',
      title: 'Avg Order Value',
      value: `${metrics.averageOrderValue.toFixed(2)} TND`,
      change: '5%',
      changeType: 'increase' as const,
      icon: <ChartBarIcon className="h-8 w-8 text-white" />,
      gradient: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      description: 'Average value per order',
      hasDetails: true
    },
    {
      id: 'conversion-rate',
      title: 'Conversion Rate',
      value: `${metrics.conversionRate.toFixed(1)}%`,
      change: '2%',
      changeType: 'increase' as const,
      icon: <ArrowTrendingUpIcon className="h-8 w-8 text-white" />,
      gradient: 'bg-gradient-to-br from-teal-500 to-teal-600',
      description: 'Visitors to customers',
      hasDetails: true
    },
    {
      id: 'customer-retention',
      title: 'Customer Retention',
      value: `${metrics.customerRetentionRate.toFixed(1)}%`,
      change: '3%',
      changeType: 'increase' as const,
      icon: <UsersIcon className="h-8 w-8 text-white" />,
      gradient: 'bg-gradient-to-br from-pink-500 to-pink-600',
      description: 'Repeat customers',
      hasDetails: true
    },
    {
      id: 'fulfillment-rate',
      title: 'Fulfillment Rate',
      value: `${metrics.fulfillmentRate.toFixed(1)}%`,
      change: '1%',
      changeType: 'increase' as const,
      icon: <ClockIcon className="h-8 w-8 text-white" />,
      gradient: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
      description: 'Successfully delivered orders',
      hasDetails: true
    },

    // Performance Metrics
    {
      id: 'avg-delivery-time',
      title: 'Avg Delivery Time',
      value: `${metrics.averageDeliveryTime.toFixed(1)} days`,
      change: '-0.5 days',
      changeType: 'increase' as const,
      icon: <ClockIcon className="h-8 w-8 text-white" />,
      gradient: 'bg-gradient-to-br from-amber-500 to-amber-600',
      description: 'Average time to deliver'
    },
    {
      id: 'satisfaction-score',
      title: 'Satisfaction Score',
      value: `${metrics.customerSatisfactionScore.toFixed(1)}%`,
      change: '2%',
      changeType: 'increase' as const,
      icon: <StarIcon className="h-8 w-8 text-white" />,
      gradient: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      description: 'Customer satisfaction'
    },
    {
      id: 'low-stock-products',
      title: 'Low Stock Alert',
      value: metrics.lowStockProducts,
      change: metrics.lowStockProducts > 0 ? 'Action needed' : 'All good',
      changeType: metrics.lowStockProducts > 0 ? 'decrease' as const : 'increase' as const,
      icon: <ExclamationTriangleIcon className="h-8 w-8 text-white" />,
      gradient: 'bg-gradient-to-br from-red-500 to-red-600',
      description: 'Products running low'
    },
    {
      id: 'gross-margin',
      title: 'Gross Margin',
      value: `${metrics.grossMargin.toFixed(1)}%`,
      change: '1%',
      changeType: 'increase' as const,
      icon: <BanknotesIcon className="h-8 w-8 text-white" />,
      gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      description: 'Profit margin percentage'
    }
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {kpiCards.map((kpi) => (
          <KPICard
            key={kpi.id}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            changeType={kpi.changeType}
            icon={kpi.icon}
            gradient={kpi.gradient}
            description={kpi.description}
            hasDetails={kpi.hasDetails}
            onClick={kpi.hasDetails ? () => handleKPIClick(kpi.id, kpi) : undefined}
          />
        ))}
      </div>

      {/* KPI Detail Modal */}
      <KPIDetailModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        kpi={selectedKPI}
      />
    </>
  );
};

export default KPIGrid;