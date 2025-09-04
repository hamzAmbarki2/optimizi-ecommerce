import { useState, useEffect } from 'react';
import { CustomerSegmentService } from '../services/customerSegmentService';
import { CustomerSegment } from '../types/customerSegments';

export const useCustomerSegments = (fournisseurId: string | null) => {
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [analytics, setAnalytics] = useState({
    totalCustomers: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    retentionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomerSegments = async () => {
    if (!fournisseurId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await CustomerSegmentService.getCustomerAnalytics(fournisseurId);
      setSegments(data.segments);
      setAnalytics(data.analytics);
    } catch (err) {
      console.error('Error fetching customer segments:', err);
      setError('Failed to fetch customer segments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerSegments();
  }, [fournisseurId]);

  const getInsights = () => {
    return CustomerSegmentService.getSegmentInsights(segments);
  };

  return {
    segments,
    analytics,
    loading,
    error,
    refetch: fetchCustomerSegments,
    getInsights
  };
};