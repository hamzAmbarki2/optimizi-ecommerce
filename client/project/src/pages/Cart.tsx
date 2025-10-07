import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  Shield,
  Heart,
  Star,
  MapPin,
  Gift,
  Percent,
  Save,
  Edit3,
  User,
  LogIn
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import DeliveryAddressModal from '../components/DeliveryAddressModal';

export default function Cart() {
  const { state, dispatch } = useApp();
  const { cart, isAuthenticated, deliveryAddress } = state;
  const { products } = useProducts();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [savedForLater, setSavedForLater] = useState<string[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    } else {
      dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { productId, quantity: newQuantity } });
    }
  };

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const saveForLater = (productId: string) => {
    setSavedForLater([...savedForLater, productId]);
    removeItem(productId);
  };

  const moveToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      dispatch({ type: 'ADD_TO_CART', payload: product });
      setSavedForLater(savedForLater.filter(id => id !== productId));
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const applyPromoCode = () => {
    // Codes promo simulés
    const promoCodes: { [key: string]: number } = {
      'SAVE10': 10,
      'WELCOME20': 20,
      'FIRST15': 15,
      'STUDENT5': 5
    };

    if (promoCodes[promoCode.toUpperCase()]) {
      setAppliedPromo({ code: promoCode.toUpperCase(), discount: promoCodes[promoCode.toUpperCase()] });
      setPromoCode('');
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      dispatch({ type: 'SET_REDIRECT_PATH', payload: '/cart' });
      navigate('/signin');
      return;
    }

    if (!deliveryAddress) {
      setIsAddressModalOpen(true);
      return;
    }

    navigate('/checkout');
  };

  const subtotal = cart.reduce((total, item) => {
    const discountedPrice = item.product.discount > 0 
      ? item.product.prixTTC * (1 - item.product.discount / 100)
      : item.product.prixTTC;
    return total + (discountedPrice * item.quantity);
  }, 0);

  const promoDiscount = appliedPromo ? (subtotal * appliedPromo.discount) / 100 : 0;
  const subtotalAfterPromo = subtotal - promoDiscount;
  
  const deliveryFee = subtotalAfterPromo > 50 ? 0 : 4.99;
  const tax = subtotalAfterPromo * 0.1; // 10% de taxe
  const total = subtotalAfterPromo + deliveryFee + tax;

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalSavings = cart.reduce((total, item) => {
    if (item.product.discount > 0) {
      const originalPrice = item.product.prixTTC;
      const discountedPrice = originalPrice * (1 - item.product.discount / 100);
      return total + ((originalPrice - discountedPrice) * item.quantity);
    }
    return total;
  }, 0) + promoDiscount;

  const recommendedProducts = products
    .filter(product => !cart.some(item => item.product.id === product.id))
    .filter(product => cart.some(item => item.product.categoryId === product.categoryId))
    .slice(0, 4);

  const savedProducts = products.filter(product => savedForLater.includes(product.id));

  if (cart.length === 0 && savedForLater.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingCart className="w-16 h-16 text-primary-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">Votre panier est vide</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              Découvrez des aliments incroyables dans notre vaste menu et commencez à composer votre repas parfait.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Commencer à faire vos courses
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center px-8 py-4 border-2 border-primary-500 text-primary-500 font-semibold rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
              >
                Parcourir les catégories
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* En-tête */}
        <div className="mb-8">
          <Link
            to="/products"
            className="inline-flex items-center text-primary-500 hover:text-primary-600 font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Continuer les achats
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                Panier d'<span className="text-primary-500">achats</span>
              </h1>
              <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-300">
                <span>{totalItems} {totalItems === 1 ? 'article' : 'articles'} dans votre panier</span>
                {totalSavings > 0 && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Save className="w-4 h-4" />
                    <span className="font-medium">Vous économisez TND{totalSavings.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
            
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Vider le panier</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Articles du panier */}
          <div className="lg:col-span-2 space-y-6">
            {/* Articles actifs du panier */}
            {cart.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Articles du panier</h2>
                <div className="space-y-4">
                  {cart.map((item) => {
                    const discountedPrice = item.product.discount > 0 
                      ? item.product.prixTTC * (1 - item.product.discount / 100)
                      : item.product.prixTTC;

                    return (
                      <div key={item.product.id} className="flex items-center space-x-4 p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:shadow-md transition-shadow">
                        <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                          <img
                            src={item.product.imageURL}
                            alt={item.product.name}
                            className="w-24 h-24 object-cover rounded-xl shadow-sm"
                          />
                        </Link>
                        
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/product/${item.product.id}`}
                            className="text-lg font-semibold text-gray-800 dark:text-white hover:text-primary-500 dark:hover:text-primary-400 transition-colors line-clamp-1 mb-1"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-2">
                            {item.product.description}
                          </p>
                          
                          {item.product.Tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {item.product.Tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2 mb-3">
                            {item.product.discount > 0 && (
                              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                TND{item.product.prixTTC.toFixed(2)}
                              </span>
                            )}
                            <span className="text-lg font-bold text-primary-500">
                              TND{discountedPrice.toFixed(2)}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">par {item.product.unit}</span>
                            {item.product.discount > 0 && (
                              <span className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 text-xs px-2 py-1 rounded-full font-medium">
                                -{item.product.discount}% de réduction
                              </span>
                            )}
                          </div>

                          {item.product.rating && (
                            <div className="flex items-center space-x-1 mb-2">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">{item.product.rating}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => saveForLater(item.product.id)}
                              className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                            >
                              <Heart className="w-4 h-4" />
                              <span>Sauvegarder pour plus tard</span>
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-4">
                          {/* Contrôles de quantité */}
                          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-10 h-10 bg-white dark:bg-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors shadow-sm"
                            >
                              <Minus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                            </button>
                            <span className="w-12 text-center font-medium text-gray-800 dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-10 h-10 bg-white dark:bg-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors shadow-sm"
                            >
                              <Plus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                            </button>
                          </div>
                          
                          {/* Total de l'article */}
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-800 dark:text-white">
                              TND{(discountedPrice * item.quantity).toFixed(2)}
                            </div>
                            <button
                              onClick={() => removeItem(item.product.id)}
                              className="text-red-500 hover:text-red-600 text-sm flex items-center space-x-1 mt-2 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Supprimer</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sauvegardé pour plus tard */}
            {savedProducts.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Sauvegardé pour plus tard</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {savedProducts.map((product) => (
                    <div key={product.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.imageURL}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-800 dark:text-white line-clamp-1">{product.name}</h3>
                          <p className="text-primary-500 font-semibold">TND{product.prixTTC.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-3">
                        <button
                          onClick={() => moveToCart(product.id)}
                          className="flex-1 px-3 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors"
                        >
                          Déplacer dans le panier
                        </button>
                        <button
                          onClick={() => setSavedForLater(savedForLater.filter(id => id !== product.id))}
                          className="px-3 py-2 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Résumé de la commande */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Résumé de la commande</h2>
              
              {/* Statut d'authentification */}
              {!isAuthenticated && (
                <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <User className="w-5 h-5 text-primary-500" />
                    <h3 className="font-semibold text-primary-800 dark:text-primary-300">Connexion requise</h3>
                  </div>
                  <p className="text-primary-700 dark:text-primary-400 text-sm mb-3">
                    Veuillez vous connecter pour passer à la caisse
                  </p>
                  <Link
                    to="/signin"
                    onClick={() => dispatch({ type: 'SET_REDIRECT_PATH', payload: '/cart' })}
                    className="inline-flex items-center px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Se connecter
                  </Link>
                </div>
              )}

              {/* Adresse de livraison */}
              {isAuthenticated && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800 dark:text-white flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Adresse de livraison
                    </h3>
                    <button
                      onClick={() => setIsAddressModalOpen(true)}
                      className="text-primary-500 hover:text-primary-600 text-sm flex items-center"
                    >
                      <Edit3 className="w-3 h-3 mr-1" />
                      {deliveryAddress ? 'Modifier' : 'Ajouter'}
                    </button>
                  </div>
                  {deliveryAddress ? (
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <p className="font-medium">{deliveryAddress.street}</p>
                      <p>{deliveryAddress.city}, {deliveryAddress.postalCode}</p>
                      <p>{deliveryAddress.country}</p>
                      {deliveryAddress.instructions && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Instructions : {deliveryAddress.instructions}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Aucune adresse de livraison définie</p>
                  )}
                </div>
              )}

              {/* Code promo */}
              <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                  <Gift className="w-4 h-4 mr-2" />
                  Code promo
                </h3>
                {appliedPromo ? (
                  <div className="flex items-center justify-between p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Percent className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800 dark:text-green-300">{appliedPromo.code}</span>
                      <span className="text-green-600 dark:text-green-400">-{appliedPromo.discount}%</span>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Entrez un code promo"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                    <button
                      onClick={applyPromoCode}
                      disabled={!promoCode.trim()}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Appliquer
                    </button>
                  </div>
                )}
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Essayez : SAVE10, WELCOME20, FIRST15, STUDENT5
                </div>
              </div>
              
              {/* Répartition des prix */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Sous-total ({totalItems} articles)</span>
                  <span>TND{subtotal.toFixed(2)}</span>
                </div>
                
                {appliedPromo && (
                  <div className="flex justify-between text-green-600">
                    <span>Remise promo ({appliedPromo.code})</span>
                    <span>-TND{promoDiscount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Frais de livraison</span>
                  <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                    {deliveryFee === 0 ? 'GRATUIT' : `TND${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                
                {deliveryFee > 0 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg">
                    Ajoutez TND{(50 - subtotalAfterPromo).toFixed(2)} de plus pour une livraison gratuite !
                  </div>
                )}
                
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Taxe (10%)</span>
                  <span>TND{tax.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between text-2xl font-bold text-gray-800 dark:text-white">
                    <span>Total</span>
                    <span className="text-primary-500">TND{total.toFixed(2)}</span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="text-sm text-green-600 text-right mt-1">
                      Vous avez économisé TND{totalSavings.toFixed(2)} !
                    </div>
                  )}
                </div>
              </div>
              
              {/* Bouton de passage à la caisse */}
              <button 
                onClick={handleProceedToCheckout}
                disabled={cart.length === 0}
                className="w-full px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 mb-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {!isAuthenticated ? (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Se connecter pour passer à la caisse</span>
                  </>
                ) : !deliveryAddress ? (
                  <>
                    <MapPin className="w-5 h-5" />
                    <span>Ajouter une adresse & passer à la caisse</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Passer à la caisse</span>
                  </>
                )}
              </button>
              
              {/* Fonctionnalités de sécurité */}
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Paiement sécurisé avec chiffrement SSL</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-blue-500" />
                  <span>Livraison rapide</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-purple-500" />
                  <span>Suivi de commande en temps réel</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Produits recommandés */}
        {recommendedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              Vous pourriez aussi <span className="text-primary-500">aimer</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de l'adresse de livraison */}
      <DeliveryAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSave={() => {
          if (isAuthenticated && deliveryAddress) {
            navigate('/checkout');
          }
        }}
      />
    </div>
  );
}