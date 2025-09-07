import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle, 
  MapPin, 
  Phone, 
  Mail,
  Package,
  Truck,
  Star,
  ArrowRight,
  Copy,
  Check,
  Banknote,
  User
} from 'lucide-react';
import { useOrder } from '../hooks/useOrders';
import { useApp } from '../context/AppContext';
import { productService } from '../services/productService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import OrderProgressTracker from '../components/OrderProgressTracker';
import OrderStatusBadge from '../components/OrderStatusBadge';

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const { order, loading, error } = useOrder(orderId || '');
  const [copied, setCopied] = useState(false);
  const { dispatch } = useApp();

  const copyOrderId = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <Link
            to="/orders"
            className="inline-flex items-center text-primary-500 hover:text-primary-600 font-medium mb-8"
          >
            <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
            Retour aux commandes
          </Link>
          
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

  const handleReorder = async () => {
    if (!order) return;
    // Load products to ensure valid references
    for (const item of order.items) {
      const product = await productService.getProductById(item.productId);
      if (product && product.stockQuantity > 0) {
        // Add to cart with the same quantity
        for (let i = 0; i < item.quantity; i++) {
          dispatch({ type: 'ADD_TO_CART', payload: product });
        }
      }
    }
  };

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <Link
            to="/orders"
            className="inline-flex items-center text-primary-500 hover:text-primary-600 font-medium mb-8"
          >
            <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
            Retour aux commandes
          </Link>
          
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
        {/* En-tête de succès */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Commande confirmée !
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Merci pour votre commande. Nous préparons votre délicieux repas !
          </p>
          
          {/* ID de la commande */}
          <div className="inline-flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-lg">
            <span className="text-gray-600 dark:text-gray-400">ID de la commande :</span>
            <span className="font-mono font-semibold text-gray-800 dark:text-white">{order.id}</span>
            <button
              onClick={copyOrderId}
              className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Status Badge */}
          <div className="mt-4">
            <OrderStatusBadge status={order.status} size="lg" />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Statut de la commande et chronologie */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Tracker */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Suivi de votre commande</h2>
              <OrderProgressTracker 
                currentStatus={order.status}
                timestamps={{
                  pending: order.createdAt,
                  confirmed: order.confirmedAt,
                  delivered: order.deliveredAt
                }}
              />
            </div>

            {/* Informations client */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary-500" />
                Informations client
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Nom complet</h3>
                  <p className="text-gray-600 dark:text-gray-300">{order.userName}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    Téléphone
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">{order.userPhone}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    Email
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">{order.userEmail}</p>
                </div>
              </div>
            </div>

            {/* Informations de livraison */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                <Truck className="w-5 h-5 mr-2 text-primary-500" />
                Informations de livraison
              </h2>
              
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Adresse de livraison
                </h3>
                <div className="text-gray-600 dark:text-gray-300">
                  <p>{order.deliveryAddress.street}</p>
                  {order.deliveryAddress.address2 && (
                    <p>{order.deliveryAddress.address2}</p>
                  )}
                  <p>{order.deliveryAddress.city}{order.deliveryAddress.state ? `, ${order.deliveryAddress.state}` : ''}, {order.deliveryAddress.postalCode}</p>
                  <p>{order.deliveryAddress.country}</p>
                  {order.deliveryAddress.instructions && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Instructions : {order.deliveryAddress.instructions}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Articles de la commande */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Articles de la commande</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex items-center space-x-4 p-4 border border-gray-100 dark:border-gray-700 rounded-xl">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 dark:text-white">{item.productName}</h3>
                      <p className="text-gray-600 dark:text-gray-400">Quantité : {item.quantity}</p>
                      <p className="text-primary-500 font-semibold">TND{item.unitPrice.toFixed(2)} chaque</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800 dark:text-white">TND{item.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Résumé de la commande et actions */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Résumé de la commande</h2>
              
              {/* Répartition des prix */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Sous-total</span>
                  <span>TND{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Livraison</span>
                  <span className={order.deliveryFee === 0 ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                    {order.deliveryFee === 0 ? 'GRATUIT' : `TND${order.deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Taxe</span>
                  <span>TND{order.tax.toFixed(2)}</span>
                </div>
                {order.promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Réduction</span>
                    <span>-TND{order.promoDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-800 dark:text-white">
                    <span>Total</span>
                    <span className="text-primary-500">TND{order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Méthode de paiement */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
                  <Banknote className="w-4 h-4 mr-2" />
                  Méthode de paiement
                </h3>
                <p className="text-gray-600 dark:text-gray-400">Paiement à la livraison</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Payez lorsque votre commande arrive</p>
              </div>

              {/* Informations de contact */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Besoin d'aide ?</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">support@optimizi.com</span>
                  </div>
                </div>
              </div>
              
              {/* Boutons d'action */}
              <div className="space-y-3">
                <Link
                  to="/orders"
                  className="w-full px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Voir toutes les commandes</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                
                <button
                  onClick={handleReorder}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center block"
                >
                  Commander à nouveau
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}