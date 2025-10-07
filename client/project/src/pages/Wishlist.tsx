import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  ArrowLeft, 
  Filter,
  Grid,
  List,
  Search,
  Star,
  Tag,
  Package
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Wishlist() {
  const { state, dispatch } = useApp();
  const { products, loading } = useProducts();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating' | 'dateAdded'>('dateAdded');

  // Obtenir les produits de la liste de souhaits
  const wishlistProducts = products.filter(product => 
    state.wishlist.includes(product.id)
  );

  // Filtrer et trier les produits de la liste de souhaits
  const filteredProducts = wishlistProducts
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.Tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.prixTTC - b.prixTTC;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'dateAdded':
        default:
          // Trier par ordre d'ajout à la liste de souhaits (les plus récents en premier)
          const aIndex = state.wishlist.indexOf(a.id);
          const bIndex = state.wishlist.indexOf(b.id);
          return aIndex - bIndex;
      }
    });

  const removeFromWishlist = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
  };

  const addAllToCart = () => {
    wishlistProducts.forEach(product => {
      if (product.stockQuantity > 0) {
        dispatch({ type: 'ADD_TO_CART', payload: product });
      }
    });
  };

  const clearWishlist = () => {
    state.wishlist.forEach(productId => {
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
    });
  };

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-red-100 dark:from-pink-900/30 dark:to-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-pink-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">Connectez-vous pour voir votre liste de souhaits</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Enregistrez vos produits préférés et accédez-y à tout moment</p>
            <Link
              to="/signin"
              onClick={() => dispatch({ type: 'SET_REDIRECT_PATH', payload: '/wishlist' })}
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
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-4">
              Ma <span className="text-pink-500">liste de souhaits</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Vos produits préférés sauvegardés pour plus tard
            </p>
          </div>
          
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-gray-600 dark:text-gray-300">Chargement de votre liste de souhaits...</p>
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
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-2">
                Ma <span className="text-pink-500">liste de souhaits</span>
              </h1>
              <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-300">
                <span>{wishlistProducts.length} {wishlistProducts.length === 1 ? 'article' : 'articles'} sauvegardés</span>
                {wishlistProducts.length > 0 && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Package className="w-4 h-4" />
                    <span className="font-medium">
                      {wishlistProducts.filter(p => p.stockQuantity > 0).length} disponibles
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {wishlistProducts.length > 0 && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={addAllToCart}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Ajouter tout au panier</span>
                </button>
                <button
                  onClick={clearWishlist}
                  className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Effacer tout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-red-100 dark:from-pink-900/30 dark:to-red-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
              <Heart className="w-12 h-12 text-pink-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Votre liste de souhaits est vide</h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              Commencez à ajouter des produits que vous aimez à votre liste de souhaits en cliquant sur l'icône cœur sur n'importe quel produit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Parcourir les produits
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center px-8 py-4 border-2 border-primary-500 text-primary-500 font-semibold rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
              >
                Explorer les catégories
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Recherche et contrôles */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher dans votre liste de souhaits..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-0 focus:ring-2 focus:ring-primary-500 focus:outline-none text-gray-700 dark:text-white"
                  />
                </div>
                
                <div className="flex items-center space-x-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-0 focus:ring-2 focus:ring-primary-500 focus:outline-none text-gray-700 dark:text-white"
                  >
                    <option value="dateAdded">Ajouté récemment</option>
                    <option value="name">Nom A-Z</option>
                    <option value="price">Prix Bas-Haut</option>
                    <option value="rating">Meilleure évaluation</option>
                  </select>
                  
                  <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl shadow-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:text-primary-500'
                      }`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:text-primary-500'
                      }`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>Affichage de {filteredProducts.length} sur {wishlistProducts.length} articles</span>
                <div className="flex items-center space-x-4">
                  <span>{filteredProducts.filter(p => p.stockQuantity > 0).length} en stock</span>
                  <span>{filteredProducts.filter(p => p.discount > 0).length} en promotion</span>
                </div>
              </div>
            </div>

            {/* Grille/Liste de produits */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">Aucun article trouvé</h3>
                <p className="text-gray-500 dark:text-gray-400">Essayez d'ajuster vos termes de recherche</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="relative">
                    <ProductCard product={product} />
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-4 right-4 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10"
                      title="Retirer de la liste de souhaits"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => {
                  const discountedPrice = product.discount > 0 
                    ? product.prixTTC * (1 - product.discount / 100)
                    : product.prixTTC;

                  return (
                    <div key={product.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                      <div className="flex items-center space-x-6">
                        <Link to={`/product/${product.id}`} className="flex-shrink-0">
                          <img
                            src={product.imageURL}
                            alt={product.name}
                            className="w-24 h-24 object-cover rounded-xl shadow-sm"
                          />
                        </Link>
                        
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/product/${product.id}`}
                            className="text-xl font-bold text-gray-800 dark:text-white hover:text-primary-500 dark:hover:text-primary-400 transition-colors line-clamp-1 mb-2"
                          >
                            {product.name}
                          </Link>
                          <p className="text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                            {product.description}
                          </p>
                          
                          {product.Tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {product.Tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {product.rating && (
                            <div className="flex items-center space-x-1 mb-2">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">{product.rating}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                ({product.review.length} avis)
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end space-y-4">
                          <div className="text-right">
                            {product.discount > 0 && (
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                                  TND{product.prixTTC.toFixed(2)}
                                </span>
                                <span className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 text-xs px-2 py-1 rounded-full font-medium">
                                  -{product.discount}% de réduction
                                </span>
                              </div>
                            )}
                            <div className="text-2xl font-bold text-primary-500">
                              TND{discountedPrice.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              par {product.unit}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => dispatch({ type: 'ADD_TO_CART', payload: product })}
                              disabled={product.stockQuantity === 0}
                              className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              <span>{product.stockQuantity === 0 ? 'Rupture de stock' : 'Ajouter au panier'}</span>
                            </button>
                            
                            <button
                              onClick={() => removeFromWishlist(product.id)}
                              className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Retirer de la liste de souhaits"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Statistiques de la liste de souhaits */}
            {wishlistProducts.length > 0 && (
              <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Résumé de la liste de souhaits</h3>
                <div className="grid md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary-500 mb-1">{wishlistProducts.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Articles totaux</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-500 mb-1">
                      {wishlistProducts.filter(p => p.stockQuantity > 0).length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">En stock</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-500 mb-1">
                      {wishlistProducts.filter(p => p.discount > 0).length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">En promotion</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary-500 mb-1">
                      TND{wishlistProducts.reduce((total, product) => {
                        const price = product.discount > 0 
                          ? product.prixTTC * (1 - product.discount / 100)
                          : product.prixTTC;
                        return total + price;
                      }, 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Valeur totale</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}