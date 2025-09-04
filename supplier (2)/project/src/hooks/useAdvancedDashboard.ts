import { useState, useEffect } from 'react';
import { KPIService } from '../services/kpiService';
import { CustomerSegmentService } from '../services/customerSegmentService';
import { DashboardMetrics, RevenueBreakdown, CustomerSegment, TopProduct } from '../types/dashboard';
import { CustomerSegment as CustomerSegmentType } from '../types/customerSegments';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/config';
import { generateMonthlyData } from '../services/dashboardService';

export const useAdvancedDashboard = (fournisseurId: string | null) => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    customerRetentionRate: 0,
    topSellingProducts: [],
    revenueGrowth: 0,
    orderGrowth: 0,
    customerGrowth: 0,
    fulfillmentRate: 0,
    averageDeliveryTime: 0,
    customerSatisfactionScore: 0,
    returnRate: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    inventoryTurnover: 0,
    grossMargin: 0,
    netProfit: 0,
    operatingExpenses: 0
  });
  
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown[]>([]);
  const [customerSegments, setCustomerSegments] = useState<CustomerSegmentType[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentOrders = async (fournisseurId: string) => {
    try {
      const ordersQuery = query(
        collection(db, 'subOrders'),
        where('fournisseurId', '==', fournisseurId)
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const allOrders = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by createdAt and get recent orders
      const sortedOrders = allOrders.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Descending order
      });
      
      const recentOrders = sortedOrders.slice(0, 10);
      setRecentOrders(recentOrders);
      
      // Generate monthly data from all orders
      const monthlyStats = generateMonthlyData(allOrders);
      setMonthlyData(monthlyStats);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    }
  };
  const fetchDashboardData = async () => {
    if (!fournisseurId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [metricsData, revenueData, segmentsData] = await Promise.all([
        KPIService.calculateAdvancedMetrics(fournisseurId),
        KPIService.getRevenueBreakdown(fournisseurId),
        CustomerSegmentService.getCustomerSegments(fournisseurId),
        fetchRecentOrders(fournisseurId)
      ]);

      setMetrics(metricsData);
      setRevenueBreakdown(revenueData);
      setCustomerSegments(segmentsData);
    } catch (err) {
      console.error('Error fetching advanced dashboard data:', err);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fournisseurId]);

  const refreshData = () => {
    fetchDashboardData();
  };

  return {
    metrics,
    revenueBreakdown,
    customerSegments,
    recentOrders,
    monthlyData,
    loading,
    error,
    refreshData
  };
};