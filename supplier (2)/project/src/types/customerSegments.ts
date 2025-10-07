export interface CustomerSegment {
  segment: string;
  count: number;
  revenue: number;
  percentage: number;
  color?: string;
}

export interface CustomerSegmentData {
  segments: CustomerSegment[];
  totalCustomers: number;
  totalRevenue: number;
}

export interface CustomerAnalytics {
  highValue: CustomerSegment;
  mediumValue: CustomerSegment;
  lowValue: CustomerSegment;
  newCustomers: CustomerSegment;
}