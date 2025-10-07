import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Truck, XCircle, Package, Star, ArrowLeft, MapPin, CreditCard, Clock } from 'lucide-react';
import { useOrderRealTimeSync } from '../hooks/useOrderRealTimeSync';
import { useApp } from '../context/AppContext';
import { productService } from '../services/productService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const { order, loading, error } = useOrderRealTimeSync(orderId);
  const { dispatch } = useApp();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Package className="w-6 h-6 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-6 h-6 text-blue-500" />;
      case 'preparing':
        return <Package className="w-6 h-6 text-primary-500" />;
      case 'out_for_delivery':
        return <Truck className="w-6 h-6 text-purple-500" />;
      case 'delivered':
        return <Star className="w-6 h-6 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Package className="w-6 h-6 text-gray-500" />;
    }
  };
  const handleReorder = async () => {
    if (!order) return;
    for (const item of order.items) {
      const product = await productService.getProductById(item.productId);
      if (product && product.stockQuantity > 0) {
        for (let i = 0; i < item.quantity; i++) {
          dispatch({ type: 'ADD_TO_CART', payload: product });
        }
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'confirmed':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'preparing':
        return 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300';
      case 'out_for_delivery':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'confirmed':
        return 'Confirmée';
      case 'preparing':
        return 'En préparation';
      case 'out_for_delivery':
        return 'En cours de livraison';
      case 'delivered':
        return 'Livrée';
      case 'cancelled':
        return 'Annulée';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-gray-600 dark:text-gray-300">Chargement des détails de la commande...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-center items-center py-20">
            <ErrorMessage 
              message={error || 'Commande non trouvée'} 
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
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/orders"
            className="inline-flex items-center space-x-2 text-primary-500 hover:text-primary-600 font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour aux commandes</span>
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Commande confirmée !
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Merci pour votre commande. Nous préparons votre délicieux repas !
            </p>
          </div>
        </div>

        {/* Order ID */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-xl px-4 py-2 shadow-lg">
            <span className="text-sm text-gray-500 dark:text-gray-400">ID de la commande :</span>
            <span className="font-mono font-bold text-primary-500">{order.id.slice(-8).toUpperCase()}</span>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Statut de la commande</h2>
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-lg font-medium ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span>{getStatusText(order.status)}</span>
            </div>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center justify-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Dernière mise à jour : {new Date(order.updatedAt).toLocaleString('fr-FR')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Résumé de la commande</h3>
            
            <div className="space-y-4 mb-6">
              {order.items.map((item) => (
                <div key={item.productId} className="flex items-center space-x-3">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 dark:text-white">{item.productName}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Quantité : {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800 dark:text-white">TND{item.totalPrice.toFixed(2)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">TND{item.unitPrice.toFixed(2)} chacun</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Sous-total</span>
                <span className="text-gray-800 dark:text-white">TND{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Livraison</span>
                <span className="text-gray-800 dark:text-white">TND{order.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Taxe</span>
                <span className="text-gray-800 dark:text-white">TND{order.tax.toFixed(2)}</span>
              </div>
              {order.promoDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Réduction</span>
                  <span className="text-green-600">-TND{order.promoDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2">
                <span className="text-gray-800 dark:text-white">Total</span>
                <span className="text-primary-500">TND{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Payment Info */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Adresse de livraison</h3>
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                <p>{order.deliveryAddress.street}</p>
                {order.deliveryAddress.address2 && (
                  <p>{order.deliveryAddress.address2}</p>
                )}
                <p>{order.deliveryAddress.city}{order.deliveryAddress.state ? `, ${order.deliveryAddress.state}` : ''}, {order.deliveryAddress.postalCode}</p>
                <p>{order.deliveryAddress.country}</p>
                {order.deliveryAddress.instructions && (
                  <p className="mt-2 text-sm italic">Instructions : {order.deliveryAddress.instructions}</p>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Méthode de paiement</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 capitalize">{order.paymentMethod}</p>
              <div className={`mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                order.paymentStatus === 'paid' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
              }`}>
                {order.paymentStatus === 'paid' ? 'Payé' : 'En attente'}
              </div>
            </div>

            {/* Order Notes */}
            {order.orderNotes && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Notes de commande</h3>
                <p className="text-gray-600 dark:text-gray-300">{order.orderNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Besoin d'aide ?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Payez lorsque votre commande arrive
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>📞 +1 (555) 123-4567</span>
              <span>✉️ support@foodhub.com</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/orders"
            className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
          >
            Voir toutes les commandes
          </Link>
          <button
            onClick={handleReorder}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all text-center"
          >
            Commander à nouveau
          </button>
        </div>
      </div>
    </div>
  );
}

