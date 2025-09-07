import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle, 
  Loader,
  MapPin,
  ShoppingBag,
  Banknote,
  Phone,
  User
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { orderService } from '../services/orderService';
import { masterOrderService } from '../services/masterOrderService';

export default function Checkout() {
  const { state, dispatch } = useApp();
  const { cart, user, deliveryAddress } = state;
  const navigate = useNavigate();
  
  const [orderNotes, setOrderNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [progress, setProgress] = useState(0);
  const cancelTimerRef = useRef<number | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  // Redirection si non authentifié ou sans adresse de livraison
  React.useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    if (!deliveryAddress) {
      navigate('/cart');
      return;
    }
    if (cart.length === 0) {
      navigate('/products');
      return;
    }
  }, [user, deliveryAddress, cart, navigate]);

  const subtotal = cart.reduce((total, item) => {
    const discountedPrice = item.product.discount > 0 
      ? item.product.prixTTC * (1 - item.product.discount / 100)
      : item.product.prixTTC;
    return total + (discountedPrice * item.quantity);
  }, 0);

  const deliveryFee = subtotal > 50 ? 0 : 4.99;
  const tax = subtotal * 0.1; // 10% de taxe
  const total = subtotal + deliveryFee + tax;

  const handlePlaceOrder = async () => {
    if (!user || !deliveryAddress) return;

    setLoading(true);
    setError(null);

    try {
      const orderId = await orderService.createOrder({
        userId: user.id,
        userEmail: user.email,
        userName: user.fullName,
        userPhone: user.phone,
        items: cart,
        subtotal,
        deliveryFee,
        tax,
        promoDiscount: 0,
        total,
        paymentMethod: 'cash',
        deliveryAddress,
        orderNotes: orderNotes || undefined
      });

      // Start 20s cancelable popup
      setPendingOrderId(orderId);
      setShowCancelPopup(true);
      setProgress(0);
      const durationMs = 20000;
      const startedAt = Date.now();
      const tick = () => {
        const elapsed = Date.now() - startedAt;
        const pct = Math.min(100, (elapsed / durationMs) * 100);
        setProgress(pct);
        if (pct < 100) {
          cancelTimerRef.current = window.setTimeout(tick, 100);
        } else {
          // Auto confirm after 20s
          finalizeOrder();
        }
      };
      tick();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de la commande');
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async () => {
    try {
      if (pendingOrderId) {
        await masterOrderService.cancelMasterOrder(pendingOrderId);
      }
    } finally {
      if (cancelTimerRef.current) window.clearTimeout(cancelTimerRef.current);
      setShowCancelPopup(false);
      setPendingOrderId(null);
    }
  };

  const finalizeOrder = () => {
    if (cancelTimerRef.current) window.clearTimeout(cancelTimerRef.current);
    setShowCancelPopup(false);
    // Vider le panier et naviguer
    dispatch({ type: 'CLEAR_CART' });
    if (pendingOrderId) {
      navigate(`/order-confirmation/${pendingOrderId}`);
      setPendingOrderId(null);
    }
  };

  if (!user || !deliveryAddress || cart.length === 0) {
    return null; // Sera redirigé via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {showCancelPopup && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Confirmation de commande</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Votre commande a été créée. Vous avez 20 secondes pour l'annuler.</p>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
                <div className="h-2 bg-primary-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex gap-3">
                <button onClick={cancelOrder} className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20">Annuler la commande</button>
                <button onClick={finalizeOrder} className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700">Confirmer maintenant</button>
              </div>
            </div>
          </div>
        )}
        {/* En-tête */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="inline-flex items-center text-primary-500 hover:text-primary-600 font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour au panier
          </button>
          
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Passage à la caisse
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Vérifiez votre commande et finalisez votre achat</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Détails de la commande */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations client */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary-500" />
                Informations client
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <h3 className="font-medium text-gray-800 dark:text-white mb-2">Nom complet</h3>
                  <p className="text-gray-600 dark:text-gray-300">{user.fullName}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <h3 className="font-medium text-gray-800 dark:text-white mb-2 flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    Téléphone
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">{user.phone}</p>
                </div>
              </div>
            </div>

            {/* Adresse de livraison */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary-500" />
                Adresse de livraison
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <p className="font-medium text-gray-800 dark:text-white">{deliveryAddress.street}</p>
                {deliveryAddress.address2 && (
                  <p className="text-gray-600 dark:text-gray-300">{deliveryAddress.address2}</p>
                )}
                <p className="text-gray-600 dark:text-gray-300">{deliveryAddress.city}{deliveryAddress.state ? `, ${deliveryAddress.state}` : ''} {deliveryAddress.postalCode}</p>
                <p className="text-gray-600 dark:text-gray-300">{deliveryAddress.country}</p>
                {deliveryAddress.instructions && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Instructions : {deliveryAddress.instructions}
                  </p>
                )}
              </div>
            </div>

            {/* Méthode de paiement */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                <Banknote className="w-5 h-5 mr-2 text-primary-500" />
                Méthode de paiement
              </h2>
              <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Banknote className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">Paiement à la livraison</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Payez lorsque votre commande arrive</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes de commande */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Notes de commande (facultatif)</h2>
              <textarea
                rows={3}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Toute instruction spéciale pour votre commande..."
              />
            </div>
          </div>

          {/* Résumé de la commande */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2 text-primary-500" />
                Résumé de la commande
              </h2>
              
              {/* Articles */}
              <div className="space-y-3 mb-6">
                {cart.map((item) => {
                  const discountedPrice = item.product.discount > 0 
                    ? item.product.prixTTC * (1 - item.product.discount / 100)
                    : item.product.prixTTC;

                  return (
                    <div key={item.product.id} className="flex items-center space-x-3">
                      <img
                        src={item.product.imageURL}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 dark:text-white line-clamp-1">{item.product.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.quantity}x TND{discountedPrice.toFixed(2)}</p>
                      </div>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        TND{(discountedPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              {/* Répartition des prix */}
              <div className="space-y-3 mb-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Sous-total</span>
                  <span>TND{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Livraison</span>
                  <span className={deliveryFee === 0 ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                    {deliveryFee === 0 ? 'GRATUIT' : `TND${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Taxe (10%)</span>
                  <span>TND{tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-800 dark:text-white">
                    <span>Total</span>
                    <span className="text-primary-500">TND{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {/* Bouton de passage de commande */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Traitement de la commande...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Passer la commande - TND{total.toFixed(2)}</span>
                  </>
                )}
              </button>
              
              {/* Avis de sécurité */}
              <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center justify-center space-x-1">
                  <Banknote className="w-3 h-3" />
                  <span>Paiement à la livraison - Payez lorsque votre commande arrive</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}