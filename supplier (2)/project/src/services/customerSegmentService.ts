import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/config';
import { CustomerSegment } from '../types/customerSegments';

export class CustomerSegmentService {
  static async getCustomerSegments(fournisseurId: string): Promise<CustomerSegment[]> {
    try {
      const ordersQuery = query(
        collection(db, 'subOrders'),
        where('fournisseurId', '==', fournisseurId)
      );
      
      const ordersSnapshot = await getDocs(ordersQuery);
      const orders = ordersSnapshot.docs.map(doc => doc.data());
      
      // Filter paid orders only
      const paidOrders = orders.filter(order => order.paymentStatus === 'paid');
      
      // Group orders by customer
      const customerData = new Map();
      
      paidOrders.forEach(order => {
        const customerId = order.userId;
        if (!customerData.has(customerId)) {
          customerData.set(customerId, {
            orders: 0,
            revenue: 0,
            email: order.userEmail,
            name: order.userName
          });
        }
        
        const data = customerData.get(customerId);
        data.orders += 1;
        data.revenue += order.total || 0;
      });

      // Define segment thresholds
      const HIGH_VALUE_THRESHOLD = 300; // lowered to surface segments
      const MEDIUM_VALUE_THRESHOLD = 100;
      const NEW_CUSTOMER_MAX_ORDERS = 1;

      const segments = {
        'High Value': { count: 0, revenue: 0, color: '#F59E0B' },
        'Medium Value': { count: 0, revenue: 0, color: '#8B5CF6' },
        'Low Value': { count: 0, revenue: 0, color: '#3B82F6' },
        'New Customers': { count: 0, revenue: 0, color: '#10B981' }
      };

      const totalRevenue = Array.from(customerData.values()).reduce((sum, data) => sum + data.revenue, 0);

      // Categorize customers
      customerData.forEach(data => {
        if (data.revenue >= HIGH_VALUE_THRESHOLD) {
          segments['High Value'].count += 1;
          segments['High Value'].revenue += data.revenue;
        } else if (data.revenue >= MEDIUM_VALUE_THRESHOLD) {
          segments['Medium Value'].count += 1;
          segments['Medium Value'].revenue += data.revenue;
        } else if (data.orders > NEW_CUSTOMER_MAX_ORDERS) {
          segments['Low Value'].count += 1;
          segments['Low Value'].revenue += data.revenue;
        } else {
          segments['New Customers'].count += 1;
          segments['New Customers'].revenue += data.revenue;
        }
      });

      // Convert to array format with percentages
      return Object.entries(segments).map(([segment, data]) => ({
        segment,
        count: data.count,
        revenue: data.revenue,
        percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
        color: data.color
      }));
    } catch (error) {
      console.error('Error calculating customer segments:', error);
      return [];
    }
  }

  static async getCustomerAnalytics(fournisseurId: string) {
    try {
      const segments = await this.getCustomerSegments(fournisseurId);
      
      const analytics = {
        totalCustomers: segments.reduce((sum, segment) => sum + segment.count, 0),
        totalRevenue: segments.reduce((sum, segment) => sum + segment.revenue, 0),
        averageOrderValue: 0,
        retentionRate: 0
      };

      // Calculate average order value
      const ordersQuery = query(
        collection(db, 'subOrders'),
        where('fournisseurId', '==', fournisseurId),
        where('paymentStatus', '==', 'paid')
      );
      
      const ordersSnapshot = await getDocs(ordersQuery);
      const totalOrders = ordersSnapshot.size;
      
      if (totalOrders > 0) {
        analytics.averageOrderValue = analytics.totalRevenue / totalOrders;
      }

      // Calculate retention rate (customers with more than 1 order)
      const repeatCustomers = segments.find(s => s.segment === 'High Value')?.count || 0 +
                             segments.find(s => s.segment === 'Medium Value')?.count || 0 +
                             segments.find(s => s.segment === 'Low Value')?.count || 0;
      
      if (analytics.totalCustomers > 0) {
        analytics.retentionRate = (repeatCustomers / analytics.totalCustomers) * 100;
      }

      return {
        segments,
        analytics
      };
    } catch (error) {
      console.error('Error getting customer analytics:', error);
      return {
        segments: [],
        analytics: {
          totalCustomers: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          retentionRate: 0
        }
      };
    }
  }

  static getSegmentInsights(segments: CustomerSegment[]) {
    const insights = [];
    
    const highValueSegment = segments.find(s => s.segment === 'High Value');
    const newCustomersSegment = segments.find(s => s.segment === 'New Customers');
    const totalCustomers = segments.reduce((sum, s) => sum + s.count, 0);

    if (highValueSegment && highValueSegment.percentage > 20) {
      insights.push({
        type: 'positive',
        message: `${highValueSegment.percentage.toFixed(1)}% of revenue comes from high-value customers`,
        recommendation: 'Focus on retaining these valuable customers with loyalty programs'
      });
    }

    if (newCustomersSegment && totalCustomers > 0) {
      const newCustomerPercentage = (newCustomersSegment.count / totalCustomers) * 100;
      if (newCustomerPercentage > 40) {
        insights.push({
          type: 'opportunity',
          message: `${newCustomerPercentage.toFixed(1)}% are new customers`,
          recommendation: 'Implement onboarding campaigns to convert new customers to repeat buyers'
        });
      }
    }

    return insights;
  }
}