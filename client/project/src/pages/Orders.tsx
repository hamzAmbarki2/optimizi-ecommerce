import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Package, Eye, RotateCcw, Phone, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useOrders } from '../hooks/useOrders';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { CartItem, Order, OrderItem } from '../types';

// Memoized Order Card Component for better performance
const OrderCard = React.memo(({
  order,
  onRecommander,
  recommendingOrderId
}: {
  order: Order;
  onRecommander: (order: Order) => void;
  recommendingOrderId: string | null;
}) => {
  // Memoize expensive date formatting
  const formattedDate = useMemo(() => {
    return new Date(order.createdAt).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [order.createdAt]);

  // Memoize order number
  const orderNumber = useMemo(() => order.id.slice(-8).toUpperCase(), [order.id]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Commande #{orderNumber}
          </h3>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-primary-500">
            TND{order.total.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {formattedDate}
          </div>
        </div>
      </div>

      {/* Informations client */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">{order.userName}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">{order.userPhone}</span>
          </div>
        </div>
      </div>

      {/* Aperçu des articles de la commande */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {order.items.length} article{order.items.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {order.items.slice(0, 3).map((item) => (
            <div key={item.productId} className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-1">
              <img
                src={item.productImage}
                alt={item.productName}
                className="w-6 h-6 object-cover rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {item.quantity}x {item.productName}
              </span>
            </div>
          ))}
          {order.items.length > 3 && (
            <div className="bg-gray-100 dark:bg-gray-600 rounded-lg px-3 py-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                +{order.items.length - 3} de plus
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Infos de livraison */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center space-x-2 mb-1">
          <Truck className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Livraison à :</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {order.deliveryAddress.street}, {order.deliveryAddress.city}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <Link
            to={`/order-confirmation/${order.id}`}
            className="flex items-center space-x-1 text-primary-500 hover:text-primary-600 font-medium transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Voir les détails</span>
          </Link>

          {order.status === 'delivered' && (
            <button
              onClick={() => onRecommander(order)}
              disabled={recommendingOrderId === order.id}
              className="flex items-center space-x-1 text-green-600 hover:text-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              <span>
                {recommendingOrderId === order.id ? 'Création...' : 'Recommander'}
              </span>
            </button>
          )}
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Paiement : <span className="capitalize font-medium">Paiement à la livraison</span>
        </div>
      </div>
    </div>
  );
});

OrderCard.displayName = 'OrderCard';

export default function Orders() {
  const { state } = useApp();
  const { orders, loading, error, refetch } = useOrders(state.user?.id);
  const [recommendingOrderId, setRecommendingOrderId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Memoize paginated orders
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    return orders.slice(startIndex, endIndex);
  }, [orders, currentPage]);

  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const handleRecommander = useCallback(async (order: Order) => {
    if (!state.user) return;

    setRecommendingOrderId(order.id);
    try {
      // Convert OrderItem[] to CartItem[] by fetching products
      const cartItems: CartItem[] = await Promise.all(
        order.items.map(async (item: OrderItem) => {
          const product = await productService.getProductById(item.productId);
          if (!product) throw new Error(`Product ${item.productId} not found`);

          return {
            product,
            quantity: item.quantity
          };
        })
      );

      // Create new order data
      const orderData = {
        userId: state.user.id,
        userEmail: state.user.email,
        userName: state.user.fullName,
        userPhone: state.user.phone,
        items: cartItems,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        tax: order.tax,
        promoDiscount: order.promoDiscount,
        total: order.total,
        paymentMethod: order.paymentMethod,
        deliveryAddress: order.deliveryAddress,
        promoCode: order.promoCode,
        orderNotes: `Recommandation de la commande ${order.id.slice(-8).toUpperCase()}`
      };

      // Create the new order
      const newOrderId = await orderService.createOrder(orderData);

      // Create notification for the client manually
      const notificationId = `recommandation-${newOrderId}-${Date.now()}`;
      const notification = {
        id: notificationId,
        type: 'info' as const,
        title: 'Commande recommandée',
        message: `Votre recommandation a été créée avec succès ! Nouvelle commande #${newOrderId.slice(-8).toUpperCase()}`,
        orderId: newOrderId,
        status: 'pending',
        timestamp: new Date(),
        read: false
      };

      // Add to localStorage directly (mimicking NotificationCenter behavior)
      const storagePrefix = state.user?.id ? `optimizi:${state.user.id}` : 'optimizi:guest';
      const notificationsKey = `${storagePrefix}:notifications`;

      try {
        const existingNotifications = localStorage.getItem(notificationsKey);
        const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];

        // Add the new notification
        notifications.unshift({
          ...notification,
          timestamp: notification.timestamp.toISOString()
        });

        // Keep only last 50
        const trimmedNotifications = notifications.slice(0, 50);
        localStorage.setItem(notificationsKey, JSON.stringify(trimmedNotifications));
      } catch (error) {
        console.error('Failed to create recommendation notification:', error);
      }

      // Show success message and refresh orders list
      setSuccessMessage(`Commande recommandée créée avec succès ! Nouvelle commande #${newOrderId.slice(-8).toUpperCase()}`);
      setCurrentPage(1); // Reset to first page to show new order
      refetch();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);

    } catch (error) {
      console.error('Error creating recommendation:', error);
      alert('Erreur lors de la création de la recommandation');
    } finally {
      setRecommendingOrderId(null);
    }
  }, [state.user, refetch]);

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Truck className="w-8 h-8 text-primary-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">Connectez-vous pour voir vos commandes</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Veuillez vous connecter pour accéder à l'historique de vos commandes</p>
            <Link
              to="/signin"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-4">
              Vos <span className="text-primary-500">commandes</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Suivez vos commandes actuelles et passées
            </p>
          </div>
          
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-gray-600 dark:text-gray-300">Chargement de vos commandes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-4">
              Vos <span className="text-primary-500">commandes</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Suivez vos commandes actuelles et passées
            </p>
            {successMessage && (
              <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-800 dark:text-green-300 font-medium">{successMessage}</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-center items-center py-20">
            <ErrorMessage 
              message={error} 
              className="max-w-md"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Vos <span className="text-primary-500">commandes</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Suivez vos commandes actuelles et passées
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Truck className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">Aucune commande pour l'instant</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Commencez à commander votre nourriture préférée !</p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              Parcourir les produits
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {paginatedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onRecommander={handleRecommander}
                  recommendingOrderId={recommendingOrderId}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>

                <span className="text-sm text-gray-700">
                  Page {currentPage} sur {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}