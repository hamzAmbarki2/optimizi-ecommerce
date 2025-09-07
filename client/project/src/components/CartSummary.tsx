import React from 'react';
import { ShoppingCart, X, ArrowRight, Truck, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

interface CartSummaryProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSummary({ isOpen, onClose }: CartSummaryProps) {
  const { state, dispatch } = useApp();
  const { cart } = state;

  const subtotal = cart.reduce((total, item) => {
    const discountedPrice =
      item.product.discount > 0
        ? item.product.prixTTC * (1 - item.product.discount / 100)
        : item.product.prixTTC;
    return total + discountedPrice * item.quantity;
  }, 0);

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const deliveryFee = subtotal > 50 ? 0 : 4.99;
  const estimatedTotal = subtotal + deliveryFee + subtotal * 0.1;

  const quickAdd = (productId: string) => {
    const item = cart.find((item) => item.product.id === productId);
    if (item) {
      dispatch({
        type: 'UPDATE_CART_QUANTITY',
        payload: { productId, quantity: item.quantity + 1 },
      });
    }
  };

  const quickRemove = (productId: string) => {
    const item = cart.find((item) => item.product.id === productId);
    if (item) {
      if (item.quantity === 1) {
        dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
      } else {
        dispatch({
          type: 'UPDATE_CART_QUANTITY',
          payload: { productId, quantity: item.quantity - 1 },
        });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-gray-700 dark:to-gray-600">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2 text-primary-500" />
            Panier ({totalItems})
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-10 h-10 text-primary-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                Votre panier est vide
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Ajoutez quelques articles délicieux pour commencer !
              </p>
              <Link
                to="/products"
                onClick={onClose}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                Parcourir les produits
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          ) : (
            <div className="p-6">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-xl mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Truck className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-300">
                    {subtotal > 50
                      ? 'Livraison gratuite !'
                      : `Encore TND${(50 - subtotal).toFixed(2)} pour la livraison gratuite`}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800 dark:text-blue-300">
                    Livraison estimée : 30-45 min
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {cart.map((item) => {
                  const discountedPrice =
                    item.product.discount > 0
                      ? item.product.prixTTC * (1 - item.product.discount / 100)
                      : item.product.prixTTC;

                  return (
                    <div
                      key={item.product.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <Link to={`/product/${item.product.id}`} onClick={onClose}>
                          <img
                            src={item.product.imageURL}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-lg shadow-sm"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/product/${item.product.id}`}
                            onClick={onClose}
                            className="font-medium text-gray-800 dark:text-white hover:text-primary-500 dark:hover:text-primary-400 transition-colors line-clamp-2 mb-1"
                          >
                            {item.product.name}
                          </Link>
                          <div className="flex items-center space-x-2 text-sm">
                            {item.product.discount > 0 && (
                              <span className="text-gray-500 dark:text-gray-400 line-through">
                                TND{item.product.prixTTC.toFixed(2)}
                              </span>
                            )}
                            <span className="text-primary-500 font-semibold">
                              TND{discountedPrice.toFixed(2)}
                            </span>
                            {item.product.discount > 0 && (
                              <span className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 text-xs px-2 py-0.5 rounded-full">
                                -{item.product.discount}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 bg-white dark:bg-gray-600 rounded-lg p-1">
                          <button
                            onClick={() => quickRemove(item.product.id)}
                            className="w-8 h-8 bg-gray-100 dark:bg-gray-500 rounded-md flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-400 transition-colors"
                          >
                            <span className="text-gray-600 dark:text-gray-200 font-medium">-</span>
                          </button>
                          <span className="w-8 text-center font-medium text-gray-800 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => quickAdd(item.product.id)}
                            className="w-8 h-8 bg-gray-100 dark:bg-gray-500 rounded-md flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-400 transition-colors"
                          >
                            <span className="text-gray-600 dark:text-gray-200 font-medium">+</span>
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-gray-800 dark:text-white">
                            TND{(discountedPrice * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Sous-total</span>
                    <span>TND{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Livraison</span>
                    <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                      {deliveryFee === 0 ? 'GRATUITE' : `TND${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>TVA (estimée)</span>
                    <span>TND{(subtotal * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                    <div className="flex justify-between font-bold text-gray-800 dark:text-white">
                      <span>Total estimé</span>
                      <span className="text-primary-500">TND{estimatedTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="space-y-3">
              <Link
                to="/cart"
                onClick={onClose}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center"
              >
                Voir le panier & Commander
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>

              <Link
                to="/products"
                onClick={onClose}
                className="w-full px-6 py-2 text-primary-500 font-medium text-center hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors flex items-center justify-center"
              >
                Continuer vos achats
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
