import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/config';
import { useAuth } from '../contexts/AuthContext';
import { masterOrderService } from '../services/masterOrderService';
import {
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ShoppingBagIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
}

interface DeliveryAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  instructions?: string;
}

interface Order {
  id: string;
  masterOrderId: string;
  fournisseurId: string;
  fournisseurName: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: string;
  deliveryAddress: DeliveryAddress;
  orderNotes: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

const Orders: React.FC = () => {
  const { userData } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fournisseurId, setFournisseurId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchFournisseurAndOrders();
  }, [userData]);

  const fetchFournisseurAndOrders = async () => {
    try {
      setLoading(true);
      if (!userData?.uid) return;

      // First get the fournisseur ID
      const fournisseurQuery = query(
        collection(db, 'Fournisseurs'),
        where('ownerId', '==', userData.uid)
      );
      const fournisseurSnapshot = await getDocs(fournisseurQuery);
      
      if (fournisseurSnapshot.empty) {
        setLoading(false);
        return;
      }

      const fournisseurDoc = fournisseurSnapshot.docs[0];
      const fournisseurIdValue = fournisseurDoc.id;
      setFournisseurId(fournisseurIdValue);

      // Fetch orders for this specific supplier
      const ordersQuery = query(
        collection(db, 'subOrders'),
        where('fournisseurId', '==', fournisseurIdValue)
      );
      
      const snapshot = await getDocs(ordersQuery);
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      // Sort by creation date (newest first)
      ordersData.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(true);
      console.log(`🔄 [Fournisseur UI] Updating order ${orderId} to status: ${newStatus}`);
      
      // Use masterOrderService instead of direct Firebase update
      await masterOrderService.updateSubOrderStatus(orderId, newStatus as any);
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus as Order['status'] }
          : order
      ));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as Order['status'] });
      }
      
      console.log(`✅ [Fournisseur UI] Order ${orderId} status updated successfully`);
    } catch (error) {
      console.error('❌ [Fournisseur UI] Error updating order status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const updatePaymentStatus = async (orderId: string, newPaymentStatus: string) => {
    try {
      setUpdating(true);
      console.log(`🔄 [Fournisseur UI] Updating order ${orderId} payment status to: ${newPaymentStatus}`);
      
      // Get current order to preserve status
      const currentOrder = orders.find(o => o.id === orderId);
      if (!currentOrder) {
        throw new Error('Order not found');
      }
      
      // Use masterOrderService instead of direct Firebase update
      await masterOrderService.updateSubOrderStatus(orderId, currentOrder.status, newPaymentStatus as any);
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, paymentStatus: newPaymentStatus as Order['paymentStatus'] }
          : order
      ));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, paymentStatus: newPaymentStatus as Order['paymentStatus'] });
      }
      
      console.log(`✅ [Fournisseur UI] Order ${orderId} payment status updated successfully`);
    } catch (error) {
      console.error('❌ [Fournisseur UI] Error updating payment status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'preparing':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'out_for_delivery':
        return <TruckIcon className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'cancelled':
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filterOrdersByDate = (orders: Order[]) => {
    if (dateFilter === 'all') return orders;
    
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      
      switch (dateFilter) {
        case 'today':
          return orderDate >= startOfDay;
        case 'week':
          const weekAgo = new Date(startOfDay.getTime() - 7 * 24 * 60 * 60 * 1000);
          return orderDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(startOfDay.getTime() - 30 * 24 * 60 * 60 * 1000);
          return orderDate >= monthAgo;
        default:
          return true;
      }
    });
  };

  const filteredOrders = filterOrdersByDate(orders).filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getOrderStats = () => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const confirmed = orders.filter(o => o.status === 'confirmed').length;
    const preparing = orders.filter(o => o.status === 'preparing').length;
    const outForDelivery = orders.filter(o => o.status === 'out_for_delivery').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    
    return { total, pending, confirmed, preparing, outForDelivery, delivered };
  };

  const stats = getOrderStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!fournisseurId) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto h-24 w-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6">
          <ShoppingBagIcon className="h-12 w-12 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Create Your Supplier Profile First
        </h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          You need to set up your supplier profile before you can view orders.
        </p>
        <a
          href="/fournisseur"
          className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-2xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Go to Supplier Profile
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="mt-2 text-gray-600">Manage orders for your products</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-xl">
              <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-xl">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-xl">
              <ExclamationTriangleIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-gray-900">{stats.processing}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-xl">
              <TruckIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Shipped</p>
              <p className="text-2xl font-bold text-gray-900">{stats.shipped}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-xl">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Orders</label>
            <input
              type="text"
              placeholder="Search by customer name, email, or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Filter</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDateFilter('all');
              }}
              className="w-full px-4 py-3 border border-gray-200 text-sm font-medium rounded-2xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto h-24 w-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6">
            <ShoppingBagIcon className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' ? 'No Orders Found' : 'No Orders Yet'}
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Orders for your products will appear here once customers start purchasing.'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{order.id.slice(-8)}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.userName}</div>
                        <div className="text-sm text-gray-500">{order.userEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center">
                        <ShoppingBagIcon className="h-4 w-4 mr-1" />
                        {order.items?.length || 0} items
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${order.total?.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">
                        Subtotal: ${order.subtotal?.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(order.paymentStatus)}`}>
                        <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowModal(true);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Order #{selectedOrder.id.slice(-8)}
                </h2>
                <p className="text-gray-600 mt-1">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()} at {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <XCircleIcon className="h-8 w-8" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Customer & Delivery Info */}
              <div className="lg:col-span-1 space-y-6">
                {/* Customer Information */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2" />
                    Customer Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-900">{selectedOrder.userName}</span>
                    </div>
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-900">{selectedOrder.userEmail}</span>
                    </div>
                    {selectedOrder.userPhone && (
                      <div className="flex items-center">
                        <PhoneIcon className="h-4 w-4 text-gray-400 mr-3" />
                        <span className="text-gray-900">{selectedOrder.userPhone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    Delivery Address
                  </h3>
                  <div className="text-gray-900">
                    <p>{selectedOrder.deliveryAddress?.street}</p>
                    <p>{selectedOrder.deliveryAddress?.city}, {selectedOrder.deliveryAddress?.postalCode}</p>
                    <p>{selectedOrder.deliveryAddress?.country}</p>
                    {selectedOrder.deliveryAddress?.instructions && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-xl">
                        <p className="text-sm text-blue-800">
                          <strong>Delivery Instructions:</strong> {selectedOrder.deliveryAddress.instructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Notes */}
                {selectedOrder.orderNotes && (
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <DocumentTextIcon className="h-5 w-5 mr-2" />
                      Order Notes
                    </h3>
                    <p className="text-gray-900">{selectedOrder.orderNotes}</p>
                  </div>
                )}

                {/* Status Management */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Order Status</h3>
                  <div className="space-y-3">
                    {['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(selectedOrder.id, status)}
                        disabled={updating}
                        className={`w-full text-left px-4 py-3 rounded-2xl border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                          selectedOrder.status === status
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                            : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center">
                          {getStatusIcon(status)}
                          <span className="ml-2 capitalize font-medium">{status.replace('_', ' ')}</span>
                          {selectedOrder.status === status && (
                            <CheckCircleIcon className="h-4 w-4 ml-auto text-blue-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Status Management */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Payment Status</h3>
                  <div className="space-y-3">
                    {['pending', 'paid', 'failed'].map((paymentStatus) => (
                      <button
                        key={paymentStatus}
                        onClick={() => updatePaymentStatus(selectedOrder.id, paymentStatus)}
                        disabled={updating}
                        className={`w-full text-left px-4 py-3 rounded-2xl border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                          selectedOrder.paymentStatus === paymentStatus
                            ? 'border-green-500 bg-green-50 text-green-700 shadow-md'
                            : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4" />
                          <span className="ml-2 capitalize font-medium">{paymentStatus}</span>
                          {selectedOrder.paymentStatus === paymentStatus && (
                            <CheckCircleIcon className="h-4 w-4 ml-auto text-green-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Order Items & Summary */}
              <div className="lg:col-span-2 space-y-6">
                {/* Order Items */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <ShoppingBagIcon className="h-5 w-5 mr-2" />
                    Order Items ({selectedOrder.items?.length || 0})
                  </h3>
                  <div className="space-y-4">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 bg-white rounded-2xl p-4 shadow-sm">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={item.productImage || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{item.productName}</h4>
                          <div className="mt-1 grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Quantity:</span> {item.quantity} {item.unit}
                            </div>
                            <div>
                              <span className="font-medium">Unit Price:</span> ${item.unitPrice?.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-gray-900">${item.totalPrice?.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                    Order Summary
                  </h3>
                  <div className="bg-white rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span>${selectedOrder.subtotal?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Fee:</span>
                      <span>${selectedOrder.deliveryFee?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax:</span>
                      <span>${selectedOrder.tax?.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-xl font-bold text-gray-900">
                        <span>Total:</span>
                        <span>${selectedOrder.total?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                    Payment Information
                  </h3>
                  <div className="bg-white rounded-2xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Payment Method</p>
                        <p className="font-semibold text-gray-900 capitalize">{selectedOrder.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Payment Status</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                          <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                          {selectedOrder.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;