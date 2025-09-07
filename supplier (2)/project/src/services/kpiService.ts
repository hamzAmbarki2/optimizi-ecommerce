import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/config';
import { DashboardMetrics, TopProduct, RevenueBreakdown, CustomerSegment, TimeSeriesData } from '../types/dashboard';

export class KPIService {
  static async calculateAdvancedMetrics(fournisseurId: string): Promise<DashboardMetrics> {
    try {
      // Fetch all necessary data
      const [products, orders, categories] = await Promise.all([
        this.getProducts(fournisseurId),
        this.getOrders(fournisseurId),
        this.getCategories(fournisseurId)
      ]);

      // Calculate basic metrics
      const totalProducts = products.length;
      const totalOrders = orders.length;
      const paidOrders = orders.filter(order => order.paymentStatus === 'paid');
      const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const uniqueCustomers = new Set(orders.map(order => order.userId)).size;

      // Calculate advanced metrics
      const averageOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
      const conversionRate = this.calculateConversionRate(orders);
      const customerRetentionRate = this.calculateRetentionRate(orders);
      const topSellingProducts = this.getTopSellingProducts(orders, products);
      
      // Calculate growth rates (comparing last 30 days vs previous 30 days)
      const growthMetrics = this.calculateGrowthMetrics(orders);
      
      // Performance metrics
      const fulfillmentRate = this.calculateFulfillmentRate(orders);
      const averageDeliveryTime = this.calculateAverageDeliveryTime(orders);
      const customerSatisfactionScore = this.calculateSatisfactionScore(orders);
      const returnRate = this.calculateReturnRate(orders);
      
      // Inventory metrics
      const inventoryMetrics = this.calculateInventoryMetrics(products);
      
      // Financial metrics
      const financialMetrics = this.calculateFinancialMetrics(paidOrders, products);

      return {
        totalProducts,
        totalOrders,
        totalRevenue,
        totalCustomers: uniqueCustomers,
        averageOrderValue,
        conversionRate,
        customerRetentionRate,
        topSellingProducts,
        revenueGrowth: growthMetrics.revenueGrowth,
        orderGrowth: growthMetrics.orderGrowth,
        customerGrowth: growthMetrics.customerGrowth,
        fulfillmentRate,
        averageDeliveryTime,
        customerSatisfactionScore,
        returnRate,
        lowStockProducts: inventoryMetrics.lowStock,
        outOfStockProducts: inventoryMetrics.outOfStock,
        inventoryTurnover: inventoryMetrics.turnover,
        grossMargin: financialMetrics.grossMargin,
        netProfit: financialMetrics.netProfit,
        operatingExpenses: financialMetrics.operatingExpenses
      };
    } catch (error) {
      console.error('Error calculating advanced metrics:', error);
      throw new Error('Failed to calculate metrics');
    }
  }

  private static async getProducts(fournisseurId: string) {
    const productsQuery = query(
      collection(db, 'products'),
      where('FournisseurId', '==', fournisseurId)
    );
    const snapshot = await getDocs(productsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  private static async getOrders(fournisseurId: string) {
    const ordersQuery = query(
      collection(db, 'subOrders'),
      where('fournisseurId', '==', fournisseurId)
    );
    const snapshot = await getDocs(ordersQuery);
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sort by createdAt in JavaScript instead of Firestore
    return orders.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Descending order
    });
  }

  private static async getCategories(fournisseurId: string) {
    const categoriesQuery = query(
      collection(db, 'categories'),
      where('FournisseurId', '==', fournisseurId)
    );
    const snapshot = await getDocs(categoriesQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  private static calculateConversionRate(orders: any[]): number {
    // Simplified conversion rate calculation
    // In a real scenario, you'd track visitors vs orders
    const totalVisitors = orders.length * 3; // Assuming 3 visitors per order on average
    return orders.length > 0 ? (orders.length / totalVisitors) * 100 : 0;
  }

  private static calculateRetentionRate(orders: any[]): number {
    const customerOrders = new Map();
    
    orders.forEach(order => {
      const customerId = order.userId;
      if (!customerOrders.has(customerId)) {
        customerOrders.set(customerId, []);
      }
      customerOrders.get(customerId).push(order);
    });

    const repeatCustomers = Array.from(customerOrders.values()).filter(orders => orders.length > 1).length;
    const totalCustomers = customerOrders.size;
    
    return totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;
  }

  private static getTopSellingProducts(orders: any[], products: any[]): TopProduct[] {
    const productSales = new Map();
    
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach((item: any) => {
          const productId = item.productId;
          if (!productSales.has(productId)) {
            productSales.set(productId, { sales: 0, revenue: 0 });
          }
          const current = productSales.get(productId);
          current.sales += item.quantity;
          current.revenue += item.totalPrice;
        });
      }
    });

    return Array.from(productSales.entries())
      .map(([productId, data]) => {
        const product = products.find(p => p.id === productId);
        return {
          id: productId,
          name: product?.title || 'Unknown Product',
          sales: data.sales,
          revenue: data.revenue,
          image: product?.imageURL || ''
        };
      })
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }

  private static calculateGrowthMetrics(orders: any[]) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentOrders = orders.filter(order => new Date(order.createdAt) >= thirtyDaysAgo);
    const previousOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= sixtyDaysAgo && orderDate < thirtyDaysAgo;
    });

    const recentRevenue = recentOrders
      .filter(order => order.paymentStatus === 'paid')
      .reduce((sum, order) => sum + (order.total || 0), 0);
    
    const previousRevenue = previousOrders
      .filter(order => order.paymentStatus === 'paid')
      .reduce((sum, order) => sum + (order.total || 0), 0);

    const recentCustomers = new Set(recentOrders.map(order => order.userId)).size;
    const previousCustomers = new Set(previousOrders.map(order => order.userId)).size;

    return {
      revenueGrowth: previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0,
      orderGrowth: previousOrders.length > 0 ? ((recentOrders.length - previousOrders.length) / previousOrders.length) * 100 : 0,
      customerGrowth: previousCustomers > 0 ? ((recentCustomers - previousCustomers) / previousCustomers) * 100 : 0
    };
  }

  private static calculateFulfillmentRate(orders: any[]): number {
    const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
    return orders.length > 0 ? (deliveredOrders / orders.length) * 100 : 0;
  }

  private static calculateAverageDeliveryTime(orders: any[]): number {
    const deliveredOrders = orders.filter(order => 
      order.status === 'delivered' && order.deliveredAt && order.createdAt
    );

    if (deliveredOrders.length === 0) return 0;

    const totalDeliveryTime = deliveredOrders.reduce((sum, order) => {
      const created = new Date(order.createdAt).getTime();
      const delivered = new Date(order.deliveredAt).getTime();
      return sum + (delivered - created);
    }, 0);

    return totalDeliveryTime / deliveredOrders.length / (1000 * 60 * 60 * 24); // Convert to days
  }

  private static calculateSatisfactionScore(orders: any[]): number {
    // Simplified satisfaction score based on order status and return rate
    const successfulOrders = orders.filter(order => order.status === 'delivered').length;
    const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
    
    if (orders.length === 0) return 0;
    
    const baseScore = (successfulOrders / orders.length) * 100;
    const penalty = (cancelledOrders / orders.length) * 20;
    
    return Math.max(0, Math.min(100, baseScore - penalty));
  }

  private static calculateReturnRate(orders: any[]): number {
    // Simplified return rate calculation
    const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
    return orders.length > 0 ? (cancelledOrders / orders.length) * 100 : 0;
  }

  private static calculateInventoryMetrics(products: any[]) {
    const lowStockThreshold = 10;
    const lowStock = products.filter(product => {
      const stock = parseInt(product.stockQuantity) || 0;
      return stock > 0 && stock <= lowStockThreshold;
    }).length;

    const outOfStock = products.filter(product => {
      const stock = parseInt(product.stockQuantity) || 0;
      return stock === 0;
    }).length;

    // Simplified inventory turnover calculation
    const totalStock = products.reduce((sum, product) => sum + (parseInt(product.stockQuantity) || 0), 0);
    const turnover = totalStock > 0 ? (products.length / totalStock) * 12 : 0; // Annualized

    return { lowStock, outOfStock, turnover };
  }

  private static calculateFinancialMetrics(paidOrders: any[], products: any[]) {
    const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Simplified cost calculation (assuming 60% of revenue is cost)
    const totalCosts = totalRevenue * 0.6;
    const grossMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0;
    
    // Simplified operating expenses (10% of revenue)
    const operatingExpenses = totalRevenue * 0.1;
    const netProfit = totalRevenue - totalCosts - operatingExpenses;

    return {
      grossMargin,
      netProfit,
      operatingExpenses
    };
  }

  static async getRevenueBreakdown(fournisseurId: string): Promise<RevenueBreakdown[]> {
    try {
      const [orders, categories, products] = await Promise.all([
        this.getOrders(fournisseurId),
        this.getCategories(fournisseurId),
        this.getProducts(fournisseurId)
      ]);

      const paidOrders = orders.filter(order => order.paymentStatus === 'paid');
      const categoryRevenue = new Map();
      const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.total || 0), 0);

      // Calculate revenue by category
      paidOrders.forEach(order => {
        if (order.items) {
          order.items.forEach((item: any) => {
            // Find the product to get its category
            const product = products.find(p => p.id === item.productId);
            const categoryId = product?.categoryId || 'uncategorized';
            
            if (!categoryRevenue.has(categoryId)) {
              categoryRevenue.set(categoryId, 0);
            }
            categoryRevenue.set(categoryId, categoryRevenue.get(categoryId) + item.totalPrice);
          });
        }
      });

      const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6B7280'];
      
      return Array.from(categoryRevenue.entries()).map(([categoryId, amount], index) => {
        const category = categories.find(c => c.id === categoryId);
        return {
          category: category?.title || 'Uncategorized',
          amount,
          percentage: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0,
          color: colors[index % colors.length]
        };
      }).sort((a, b) => b.amount - a.amount);
    } catch (error) {
      console.error('Error calculating revenue breakdown:', error);
      return [];
    }
  }

  static async getCustomerSegments(fournisseurId: string): Promise<CustomerSegment[]> {
    try {
      const orders = await this.getOrders(fournisseurId);
      const paidOrders = orders.filter(order => order.paymentStatus === 'paid');
      
      const customerData = new Map();
      
      paidOrders.forEach(order => {
        const customerId = order.userId;
        if (!customerData.has(customerId)) {
          customerData.set(customerId, { orders: 0, revenue: 0 });
        }
        const data = customerData.get(customerId);
        data.orders += 1;
        data.revenue += order.total || 0;
      });

      const segments = {
        'High Value': { count: 0, revenue: 0 },
        'Medium Value': { count: 0, revenue: 0 },
        'Low Value': { count: 0, revenue: 0 },
        'New Customers': { count: 0, revenue: 0 }
      };

      const totalRevenue = Array.from(customerData.values()).reduce((sum, data) => sum + data.revenue, 0);

      customerData.forEach(data => {
        if (data.revenue > 1000) {
          segments['High Value'].count += 1;
          segments['High Value'].revenue += data.revenue;
        } else if (data.revenue > 500) {
          segments['Medium Value'].count += 1;
          segments['Medium Value'].revenue += data.revenue;
        } else if (data.orders > 1) {
          segments['Low Value'].count += 1;
          segments['Low Value'].revenue += data.revenue;
        } else {
          segments['New Customers'].count += 1;
          segments['New Customers'].revenue += data.revenue;
        }
      });

      return Object.entries(segments).map(([segment, data]) => ({
        segment,
        count: data.count,
        revenue: data.revenue,
        percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0
      }));
    } catch (error) {
      console.error('Error calculating customer segments:', error);
      return [];
    }
  }
}