import { useState, useEffect } from 'react';
import { DashboardService } from '../services/dashboardService';
import { OrderService } from '../services/orderService';
import { DashboardStats, MonthlyData } from '../models';

export const useDashboard = (fournisseurId: string | null) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!fournisseurId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard stats
      const dashboardStats = await DashboardService.getDashboardStats(fournisseurId);
      setStats(dashboardStats);

      // Fetch orders for charts and recent orders
      const orders = await OrderService.getOrdersByFournisseur(fournisseurId);
      
      // Get recent orders (last 5)
      const recentOrdersData = orders.slice(0, 5);
      setRecentOrders(recentOrdersData);

      // Generate monthly data for charts
      const monthlyStats = DashboardService.generateMonthlyData(orders);
      setMonthlyData(monthlyStats);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fournisseurId]);

  return {
    stats,
    monthlyData,
    recentOrders,
    loading,
    error,
    refetch: fetchDashboardData
  };
};