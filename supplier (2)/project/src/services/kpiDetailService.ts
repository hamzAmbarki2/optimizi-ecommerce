import { DashboardMetrics } from '../types/dashboard';

export class KPIDetailService {
  static getKPIDetails(kpiId: string, metrics: DashboardMetrics) {
    const details = {
      'total-products': {
        explanation: "Total Products represents the complete count of active products in your catalog. This includes all products that are currently available for sale, regardless of their stock status. A higher product count generally indicates a more diverse offering and can lead to increased customer engagement and sales opportunities.",
        calculation: "COUNT(products WHERE status = 'active')",
        benchmark: "Industry average for similar businesses ranges from 50-500 products. Your current count suggests a well-stocked catalog.",
        insights: [
          `You have ${metrics.totalProducts} active products in your catalog`,
          `${metrics.outOfStockProducts} products are currently out of stock`,
          `${metrics.lowStockProducts} products have low inventory levels`,
          "Product diversity can improve customer retention by 15-25%"
        ],
        recommendations: [
          "Consider adding seasonal products to boost sales during peak periods",
          "Analyze top-performing categories and expand those product lines",
          "Implement automated reordering for fast-moving items",
          "Regular catalog cleanup to remove underperforming products"
        ],
        trendData: this.generateTrendData(metrics.totalProducts, 12),
        breakdown: [
          { label: 'In Stock', value: metrics.totalProducts - metrics.outOfStockProducts, percentage: 85 },
          { label: 'Low Stock', value: metrics.lowStockProducts, percentage: 10 },
          { label: 'Out of Stock', value: metrics.outOfStockProducts, percentage: 5 }
        ],
        relatedMetrics: [
          { name: 'Inventory Turnover', value: `${metrics.inventoryTurnover.toFixed(1)}x`, impact: 'positive' as const },
          { name: 'Stock Coverage', value: '45 days', impact: 'neutral' as const },
          { name: 'New Products (30d)', value: '12', impact: 'positive' as const }
        ]
      },

      'total-orders': {
        explanation: "Total Orders represents the cumulative number of orders received across all time periods. This metric is crucial for understanding your business volume and growth trajectory. Each order represents a customer transaction and contributes to your overall revenue stream.",
        calculation: "COUNT(orders WHERE status != 'cancelled')",
        benchmark: "Healthy e-commerce businesses typically see 10-30% month-over-month order growth. Your growth rate indicates strong market demand.",
        insights: [
          `You've processed ${metrics.totalOrders} orders to date`,
          `Average of ${Math.round(metrics.totalOrders / 12)} orders per month`,
          `Order fulfillment rate is ${metrics.fulfillmentRate.toFixed(1)}%`,
          "Peak ordering typically occurs during weekends and evenings"
        ],
        recommendations: [
          "Implement order tracking to improve customer satisfaction",
          "Set up automated order confirmation and shipping notifications",
          "Analyze order patterns to optimize inventory planning",
          "Consider offering expedited shipping options for premium customers"
        ],
        trendData: this.generateTrendData(metrics.totalOrders, 12, 'orders'),
        breakdown: [
          { label: 'Delivered', value: Math.round(metrics.totalOrders * 0.85), percentage: 85 },
          { label: 'Processing', value: Math.round(metrics.totalOrders * 0.10), percentage: 10 },
          { label: 'Pending', value: Math.round(metrics.totalOrders * 0.05), percentage: 5 }
        ],
        relatedMetrics: [
          { name: 'Avg Order Value', value: `${metrics.averageOrderValue.toFixed(2)} TND`, impact: 'positive' as const },
          { name: 'Order Frequency', value: '2.3/month', impact: 'positive' as const },
          { name: 'Return Rate', value: `${metrics.returnRate.toFixed(1)}%`, impact: 'negative' as const }
        ]
      },

      'total-revenue': {
        explanation: "Total Revenue represents the sum of all successful transactions from paid orders. This is your primary income metric and directly reflects your business's financial performance. Revenue growth is essential for business sustainability and expansion.",
        calculation: "SUM(orders.total WHERE payment_status = 'paid')",
        benchmark: "Revenue growth of 15-25% annually is considered healthy for e-commerce businesses. Your current trajectory shows strong performance.",
        insights: [
          `Generated ${metrics.totalRevenue.toFixed(2)} TND in total revenue`,
          `Average revenue per customer: ${(metrics.totalRevenue / metrics.totalCustomers).toFixed(2)} TND`,
          `Revenue growth rate: ${metrics.revenueGrowth.toFixed(1)}% vs last month`,
          `Gross margin: ${metrics.grossMargin.toFixed(1)}%`
        ],
        recommendations: [
          "Focus on increasing average order value through upselling",
          "Implement dynamic pricing strategies for high-demand products",
          "Develop customer loyalty programs to increase repeat purchases",
          "Analyze seasonal trends to optimize promotional campaigns"
        ],
        trendData: this.generateRevenueTrendData(metrics.totalRevenue, 12),
        breakdown: [
          { label: 'Product Sales', value: metrics.totalRevenue * 0.85, percentage: 85 },
          { label: 'Shipping Fees', value: metrics.totalRevenue * 0.10, percentage: 10 },
          { label: 'Other Income', value: metrics.totalRevenue * 0.05, percentage: 5 }
        ],
        relatedMetrics: [
          { name: 'Net Profit', value: `${metrics.netProfit.toFixed(2)} TND`, impact: 'positive' as const },
          { name: 'Operating Expenses', value: `${metrics.operatingExpenses.toFixed(2)} TND`, impact: 'negative' as const },
          { name: 'Profit Margin', value: `${((metrics.netProfit / metrics.totalRevenue) * 100).toFixed(1)}%`, impact: 'positive' as const }
        ]
      },

      'total-customers': {
        explanation: "Total Customers represents the unique count of individuals who have placed at least one order. This metric is vital for understanding your market reach and customer base growth. A growing customer base indicates successful marketing and customer satisfaction.",
        calculation: "COUNT(DISTINCT orders.user_id)",
        benchmark: "Customer acquisition costs should be 3-5x lower than customer lifetime value. Your customer growth indicates healthy acquisition.",
        insights: [
          `Serving ${metrics.totalCustomers} unique customers`,
          `Customer retention rate: ${metrics.customerRetentionRate.toFixed(1)}%`,
          `Average customer lifetime value: $${(metrics.totalRevenue / metrics.totalCustomers * 2.5).toFixed(2)}`,
          "New customer acquisition is trending upward"
        ],
        recommendations: [
          "Implement referral programs to leverage existing customers",
          "Develop targeted email marketing campaigns for customer segments",
          "Create personalized shopping experiences to improve retention",
          "Analyze customer feedback to improve products and services"
        ],
        trendData: this.generateTrendData(metrics.totalCustomers, 12, 'customers'),
        breakdown: [
          { label: 'Repeat Customers', value: Math.round(metrics.totalCustomers * 0.35), percentage: 35 },
          { label: 'One-time Buyers', value: Math.round(metrics.totalCustomers * 0.65), percentage: 65 }
        ],
        relatedMetrics: [
          { name: 'Customer Acquisition Cost', value: '$45', impact: 'neutral' as const },
          { name: 'Churn Rate', value: '12%', impact: 'negative' as const },
          { name: 'Customer Satisfaction', value: `${metrics.customerSatisfactionScore.toFixed(1)}%`, impact: 'positive' as const }
        ]
      },

      'average-order-value': {
        explanation: "Average Order Value (AOV) measures the average amount spent per transaction. This metric is crucial for understanding customer spending behavior and optimizing pricing strategies. Higher AOV typically indicates better product positioning and effective upselling.",
        calculation: "SUM(order_total) / COUNT(orders)",
        benchmark: "AOV varies by industry, but consistent growth of 5-10% annually is considered healthy. Your AOV suggests good customer engagement.",
        insights: [
          `Current AOV is $${metrics.averageOrderValue.toFixed(2)}`,
          "AOV has increased by 8% compared to last quarter",
          "Premium customers have 40% higher AOV than average",
          "Bundle offers contribute to 25% of high-value orders"
        ],
        recommendations: [
          "Implement product bundling to increase order values",
          "Offer free shipping thresholds to encourage larger orders",
          "Use cross-selling and upselling techniques at checkout",
          "Create volume discounts for bulk purchases"
        ],
        trendData: this.generateAOVTrendData(metrics.averageOrderValue, 12),
        relatedMetrics: [
          { name: 'Cart Abandonment', value: '23%', impact: 'negative' as const },
          { name: 'Conversion Rate', value: `${metrics.conversionRate.toFixed(1)}%`, impact: 'positive' as const },
          { name: 'Items per Order', value: '2.8', impact: 'positive' as const }
        ]
      },

      'conversion-rate': {
        explanation: "Conversion Rate measures the percentage of visitors who complete a purchase. This metric is essential for understanding the effectiveness of your website, product presentation, and overall customer experience. Higher conversion rates indicate better user experience and product-market fit.",
        calculation: "(Total Orders / Total Visitors) × 100",
        benchmark: "E-commerce conversion rates typically range from 2-4%. Your rate indicates good website performance and customer engagement.",
        insights: [
          `Current conversion rate is ${metrics.conversionRate.toFixed(1)}%`,
          "Mobile conversion rate is 15% lower than desktop",
          "Product page optimization improved conversions by 12%",
          "Checkout abandonment affects 30% of potential conversions"
        ],
        recommendations: [
          "Optimize mobile experience to improve mobile conversions",
          "Simplify checkout process to reduce abandonment",
          "Implement exit-intent popups with special offers",
          "A/B test product descriptions and images"
        ],
        trendData: this.generateConversionTrendData(metrics.conversionRate, 12),
        relatedMetrics: [
          { name: 'Bounce Rate', value: '45%', impact: 'negative' as const },
          { name: 'Page Load Speed', value: '2.3s', impact: 'neutral' as const },
          { name: 'Mobile Traffic', value: '65%', impact: 'positive' as const }
        ]
      },

      'customer-retention': {
        explanation: "Customer Retention Rate measures the percentage of customers who make repeat purchases. This metric is crucial for long-term business success as retaining customers is typically 5-25x more cost-effective than acquiring new ones.",
        calculation: "((Customers at End - New Customers) / Customers at Start) × 100",
        benchmark: "Good retention rates vary by industry but typically range from 20-30% for e-commerce. Your rate shows strong customer loyalty.",
        insights: [
          `Customer retention rate is ${metrics.customerRetentionRate.toFixed(1)}%`,
          "Retained customers spend 67% more than new customers",
          "Email marketing contributes to 40% of repeat purchases",
          "Customer service quality directly impacts retention by 25%"
        ],
        recommendations: [
          "Implement a customer loyalty program with rewards",
          "Send personalized follow-up emails after purchases",
          "Provide exceptional customer service and support",
          "Create exclusive offers for returning customers"
        ],
        trendData: this.generateRetentionTrendData(metrics.customerRetentionRate, 12),
        relatedMetrics: [
          { name: 'Repeat Purchase Rate', value: '28%', impact: 'positive' as const },
          { name: 'Customer Lifetime Value', value: '$340', impact: 'positive' as const },
          { name: 'Net Promoter Score', value: '72', impact: 'positive' as const }
        ]
      },

      'fulfillment-rate': {
        explanation: "Fulfillment Rate measures the percentage of orders that are successfully delivered to customers. This metric is critical for customer satisfaction and business reputation. High fulfillment rates indicate efficient operations and reliable service.",
        calculation: "(Delivered Orders / Total Orders) × 100",
        benchmark: "Industry standard fulfillment rates should be above 95%. Your rate indicates reliable order processing and delivery.",
        insights: [
          `Current fulfillment rate is ${metrics.fulfillmentRate.toFixed(1)}%`,
          `Average delivery time is ${metrics.averageDeliveryTime.toFixed(1)} days`,
          "Same-day delivery accounts for 15% of orders",
          "Shipping delays primarily occur during peak seasons"
        ],
        recommendations: [
          "Partner with multiple shipping providers for redundancy",
          "Implement real-time inventory tracking",
          "Set up automated notifications for shipping delays",
          "Optimize warehouse operations for faster processing"
        ],
        trendData: this.generateFulfillmentTrendData(metrics.fulfillmentRate, 12),
        relatedMetrics: [
          { name: 'Shipping Accuracy', value: '98.5%', impact: 'positive' as const },
          { name: 'Delivery Time', value: `${metrics.averageDeliveryTime.toFixed(1)} days`, impact: 'neutral' as const },
          { name: 'Shipping Cost', value: '$8.50', impact: 'neutral' as const }
        ]
      }
    };

    return details[kpiId as keyof typeof details] || null;
  }

  private static generateTrendData(currentValue: number, months: number, type: string = 'products') {
    const data = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    for (let i = months - 1; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const variation = Math.random() * 0.3 - 0.15; // ±15% variation
      const value = Math.round(currentValue * (1 + variation - (i * 0.02))); // Slight growth trend
      
      data.push({
        period: monthNames[monthIndex],
        value: Math.max(0, value)
      });
    }
    
    return data;
  }

  private static generateRevenueTrendData(currentRevenue: number, months: number) {
    const data = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    for (let i = months - 1; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const seasonalFactor = monthIndex === 11 || monthIndex === 0 ? 1.3 : 1; // Holiday boost
      const growthFactor = 1 + (months - i) * 0.05; // 5% monthly growth
      const variation = Math.random() * 0.2 - 0.1; // ±10% variation
      const value = (currentRevenue / months) * seasonalFactor * growthFactor * (1 + variation);
      
      data.push({
        period: monthNames[monthIndex],
        value: Math.round(Math.max(0, value))
      });
    }
    
    return data;
  }

  private static generateAOVTrendData(currentAOV: number, months: number) {
    const data = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    for (let i = months - 1; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const trendFactor = 1 + (months - i) * 0.01; // 1% monthly growth
      const variation = Math.random() * 0.1 - 0.05; // ±5% variation
      const value = currentAOV * trendFactor * (1 + variation);
      
      data.push({
        period: monthNames[monthIndex],
        value: Math.round(Math.max(0, value * 100)) / 100
      });
    }
    
    return data;
  }

  private static generateConversionTrendData(currentRate: number, months: number) {
    const data = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    for (let i = months - 1; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const improvementFactor = 1 + (months - i) * 0.005; // 0.5% monthly improvement
      const variation = Math.random() * 0.2 - 0.1; // ±10% variation
      const value = currentRate * improvementFactor * (1 + variation);
      
      data.push({
        period: monthNames[monthIndex],
        value: Math.round(Math.max(0, value * 100)) / 100
      });
    }
    
    return data;
  }

  private static generateRetentionTrendData(currentRate: number, months: number) {
    const data = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    for (let i = months - 1; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const trendFactor = 1 + (months - i) * 0.008; // 0.8% monthly improvement
      const variation = Math.random() * 0.15 - 0.075; // ±7.5% variation
      const value = currentRate * trendFactor * (1 + variation);
      
      data.push({
        period: monthNames[monthIndex],
        value: Math.round(Math.max(0, value * 100)) / 100
      });
    }
    
    return data;
  }

  private static generateFulfillmentTrendData(currentRate: number, months: number) {
    const data = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    for (let i = months - 1; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const seasonalFactor = monthIndex === 11 || monthIndex === 0 ? 0.95 : 1; // Holiday challenges
      const improvementFactor = 1 + (months - i) * 0.002; // 0.2% monthly improvement
      const variation = Math.random() * 0.05 - 0.025; // ±2.5% variation
      const value = currentRate * seasonalFactor * improvementFactor * (1 + variation);
      
      data.push({
        period: monthNames[monthIndex],
        value: Math.round(Math.max(85, Math.min(100, value * 100))) / 100
      });
    }
    
    return data;
  }
}