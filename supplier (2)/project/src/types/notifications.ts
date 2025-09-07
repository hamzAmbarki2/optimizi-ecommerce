// Enhanced notification types for suppliers
export interface EnhancedNotification {
  id: string;
  type: string;
  subType: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  fournisseurId: string;
  fournisseurName?: string;
  orderId?: string;
  customerId?: string;
  productId?: string;
  isRead: boolean;
  isArchived: boolean;
  emailSent: boolean;
  smsSent: boolean;
  clicked: boolean;
  actionTaken: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  readAt?: string;
  clickedAt?: string;
  actionTakenAt?: string;
  archivedAt?: string;
  emailSentAt?: string;
}

export interface NotificationPreferences {
  id?: string;
  fournisseurId: string;
  newOrderReceived: boolean;
  orderStatusChanged: boolean;
  orderCancelled: boolean;
  orderModified: boolean;
  paymentReceived: boolean;
  paymentFailed: boolean;
  paymentPending: boolean;
  refundProcessed: boolean;
  lowInventoryAlert: boolean;
  outOfStockAlert: boolean;
  restockReminder: boolean;
  productReviewReceived: boolean;
  productPerformanceUpdate: boolean;
  accountVerificationUpdate: boolean;
  profileUpdateRequired: boolean;
  promotionalCampaignUpdate: boolean;
  salesReportReady: boolean;
  systemMaintenance: boolean;
  policyChanges: boolean;
  securityAlerts: boolean;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  smsNotifications: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  instantNotifications: boolean;
  dailyDigest: boolean;
  weeklyDigest: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationFilter {
  type?: string;
  subType?: string;
  priority?: 'low' | 'medium' | 'high';
  isRead?: boolean;
  isArchived?: boolean;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  archived: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  recent: number;
  thisWeek: number;
  thisMonth: number;
  clickThroughRate: number;
  averageReadTime: number;
}

// Legacy simple notification type for backward compatibility
export interface Notification {
  id: string;
  type: 'order';
  title: string;
  message: string;
  orderId: string;
  fournisseurId: string;
  isRead: boolean;
  createdAt: string;
  orderData?: {
    customerName: string;
    customerEmail: string;
    total: number;
    itemCount: number;
    status: string;
  };
}