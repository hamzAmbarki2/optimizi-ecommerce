import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFournisseur } from '../hooks/useFournisseur';
import { useAdvancedDashboard } from '../hooks/useAdvancedDashboard';
import KPIGrid from '../components/Dashboard/KPIGrid';
import KPIInsightsPanel from '../components/Dashboard/KPIInsightsPanel';
import TopProductsWidget from '../components/Dashboard/TopProductsWidget';
import RevenueBreakdownChart from '../components/Dashboard/RevenueBreakdownChart';
import CustomerSegmentWidget from '../components/Dashboard/CustomerSegmentWidget';
import NotificationPreferencesWidget from '../components/notifications/NotificationPreferencesWidget';
import NotificationAnalytics from '../components/notifications/NotificationAnalytics';
import { useEnhancedNotifications } from '../hooks/useEnhancedNotifications';
import {
  ChartBarIcon,
  ArrowPathIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Dashboard: React.FC = () => {
  const { userData } = useAuth();
  const { fournisseur, updateFournisseur } = useFournisseur();
  const [deliveryMinutes, setDeliveryMinutes] = useState<number>(fournisseur?.estimatedDeliveryMinutes || 30);
  const { 
    metrics, 
    revenueBreakdown, 
    customerSegments, 
    recentOrders,
    monthlyData,
    loading, 
    error, 
    refreshData 
  } = useAdvancedDashboard(fournisseur?.id || null);
  
  const { stats: notificationStats } = useEnhancedNotifications(fournisseur?.id || null);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-red-600">{error}</div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {userData?.fullName}!
            </h1>
            <p className="text-blue-100 text-lg">
              Here's your comprehensive business overview with advanced analytics.
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={refreshData}
              className="inline-flex items-center px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Refresh
            </button>
          </div>
          <div className="hidden md:block">
            <ChartBarIcon className="h-16 w-16 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Delivery Time Setting */}
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Estimated Delivery Time</h3>
            <p className="text-sm text-gray-600">Shown to customers on product cards and during checkout.</p>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="number"
              min={5}
              max={240}
              value={deliveryMinutes}
              onChange={(e) => setDeliveryMinutes(parseInt(e.target.value || '0', 10))}
              className="w-24 px-3 py-2 border border-gray-300 rounded-xl"
            />
            <span className="text-gray-700">minutes</span>
            <button
              onClick={() => updateFournisseur({ estimatedDeliveryMinutes: deliveryMinutes })}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced KPI Grid */}
      <KPIGrid metrics={metrics} loading={loading} />

      {/* Business Insights Panel */}
      <KPIInsightsPanel metrics={metrics} />

      {/* Advanced Analytics Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        <TopProductsWidget products={metrics.topSellingProducts} loading={loading} />
        <RevenueBreakdownChart data={revenueBreakdown} loading={loading} />
        <CustomerSegmentWidget 
          segments={customerSegments} 
          loading={loading} 
          showInsights={true}
          fournisseurId={fournisseur?.id || null}
          enableDetailView={true}
        />
      </div>

      {/* Notification Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <NotificationPreferencesWidget 
          fournisseurId={fournisseur?.id || ''} 
          compact={true}
        />
        <div className="lg:col-span-2">
          {notificationStats && (
            <NotificationAnalytics stats={notificationStats} loading={loading} />
          )}
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Sales Overview (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}
                formatter={(value, name) => [`${value} TND`, 'Sales']}
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Monthly Orders (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}
                formatter={(value, name) => [value, 'Orders']}
              />
              <Bar dataKey="orders" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center">
            <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No recent orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.userName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {order.total?.toFixed(2)} TND
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'preparing'
                          ? 'bg-orange-100 text-orange-800'
                          : order.status === 'out_for_delivery'
                          ? 'bg-purple-100 text-purple-800'
                          : order.status === 'delivered'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        order.paymentStatus === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : order.paymentStatus === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;