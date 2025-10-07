// Dashboard-specific types
export interface KPICard {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: string;
  gradient: string;
  description?: string;
  trend?: number[];
  format?: 'currency' | 'percentage' | 'number' | 'duration';
}

export interface DashboardMetrics {
  // Basic metrics
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  
  // Advanced metrics
  averageOrderValue: number;
  conversionRate: number;
  customerRetentionRate: number;
  topSellingProducts: TopProduct[];
  revenueGrowth: number;
  orderGrowth: number;
  customerGrowth: number;
  
  // Performance metrics
  fulfillmentRate: number;
  averageDeliveryTime: number;
  customerSatisfactionScore: number;
  returnRate: number;
  
  // Inventory metrics
  lowStockProducts: number;
  outOfStockProducts: number;
  inventoryTurnover: number;
  
  // Financial metrics
  grossMargin: number;
  netProfit: number;
  operatingExpenses: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  image: string;
}

export interface RevenueBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface CustomerSegment {
  segment: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface TimeSeriesData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
  averageOrderValue: number;
}