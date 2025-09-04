import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Truck, XCircle, Package, Star, Eye, RotateCcw, Phone, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useOrders } from '../hooks/useOrders';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import OrderStatusBadge from '../components/OrderStatusBadge';

export default function Orders() {
  const { state } = useApp();
  console.log("User ID from state:", state.user?.id);
  const { orders, loading, error } = useOrders(state.user?.id);

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
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Commande #{order.id.slice(-8).toUpperCase()}
                    </h3>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary-500">
                      TND{order.total.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
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
                      <button className="flex items-center space-x-1 text-green-600 hover:text-green-700 font-medium transition-colors">
                        <RotateCcw className="w-4 h-4" />
                        <span>Recommander</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Paiement : <span className="capitalize font-medium">Paiement à la livraison</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}