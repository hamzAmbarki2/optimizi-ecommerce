import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/config';
import { DashboardStats, MonthlyData } from '../models';

export class DashboardService {
  static async getDashboardStats(fournisseurId: string): Promise<DashboardStats> {
    // Fetch products for this fournisseur
    const productsQuery = query(
      collection(db, 'products'),
      where('FournisseurId', '==', fournisseurId)
    );
    const productsSnapshot = await getDocs(productsQuery);
    
    // Fetch orders for this fournisseur
    const ordersQuery = query(
      collection(db, 'subOrders'),
      where('fournisseurId', '==', fournisseurId)
    );
    const ordersSnapshot = await getDocs(ordersQuery);
    
    // Calculate revenue from paid orders only
    let totalRevenue = 0;
    const orders = ordersSnapshot.docs.map(doc => doc.data());
    const paidOrders = orders.filter(order => order.paymentStatus === 'paid');
    paidOrders.forEach(order => {
      totalRevenue += order.total || 0;
    });

    // Get unique customers who have placed orders
    const uniqueCustomers = new Set(orders.map(order => order.userId));

    return {
      totalProducts: productsSnapshot.size,
      totalOrders: ordersSnapshot.size,
      totalRevenue,
      totalCustomers: uniqueCustomers.size
    };
  }

  static generateMonthlyData = (orders: any[]): MonthlyData[] => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const monthlyStats: { [key: string]: { sales: number; orders: number } } = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      monthlyStats[monthKey] = { sales: 0, orders: 0 };
    }

    // Process orders
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const monthKey = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
      
      if (monthlyStats[monthKey]) {
        monthlyStats[monthKey].orders += 1;
        if (order.paymentStatus === 'paid') {
          monthlyStats[monthKey].sales += order.total || 0;
        }
      }
    });

    // Convert to array format for charts
    return Object.keys(monthlyStats).map(key => {
      const [year, month] = key.split('-');
      const monthName = monthNames[parseInt(month)];
      return {
        name: monthName,
        sales: Math.round(monthlyStats[key].sales),
        orders: monthlyStats[key].orders
      };
    });
  };
}
// Export the function for use in other components
export const generateMonthlyData = DashboardService.generateMonthlyData;