import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Tag, Clock, Truck, Plus, Award, Store } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import ProductRating from './ProductRating';
import WishlistButton from './WishlistButton';

interface ProductCardProps {
  product: Product;
  showCategory?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

export default function ProductCard({ product, showCategory = false, variant = 'default' }: ProductCardProps) {
  const { state, dispatch } = useApp();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const handleProductView = () => {
    dispatch({ type: 'ADD_TO_RECENTLY_VIEWED', payload: product.id });
  };

  const discountedPrice = product.discount > 0 
    ? product.prixTTC * (1 - product.discount / 100)
    : product.prixTTC;

  const isInCart = state.cart.some(item => item.product.id === product.id);
  const cartQuantity = state.cart.find(item => item.product.id === product.id)?.quantity || 0;

  if (variant === 'compact') {
    return (
      <Link 
        to={`/product/${product.id}`} 
        className="group cursor-pointer block h-full"
        onClick={handleProductView}
      >
        <div className="bg-white/70 dark:bg-neutral-800/70 backdrop-blur-soft rounded-soft-lg shadow-soft hover:shadow-soft-lg transform hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-white/20 dark:border-neutral-700/30 h-full flex flex-col">
          <div className="relative overflow-hidden">
            <div className="aspect-square overflow-hidden">
              <img
                src={product.imageURL}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.feature && (
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-soft flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  En vedette
                </div>
              )}
              {product.discount > 0 && (
                <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-soft flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  -{product.discount}%
                </div>
              )}
              {product.stockQuantity > 0 && product.stockQuantity < 10 && (
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-soft">
                  {product.stockQuantity} restants
                </div>
              )}
            </div>

            {/* Wishlist button */}
            <div className="absolute top-3 right-3">
              <WishlistButton productId={product.id} variant="floating" size="sm" />
            </div>

            {/* Quick add button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
              className="absolute bottom-3 right-3 w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full flex items-center justify-center shadow-soft hover:shadow-glow transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-4 flex flex-col flex-1">
            <h3 className="font-semibold text-neutral-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 mb-2 text-sm">
              {product.name}
            </h3>
            
            <div className="mb-3">
              <ProductRating product={product} compact={true} showReviews={false} />
            </div>
            
            {/* Fournisseur info */}
            {product.fournisseurName && (
              <div className="flex items-center gap-1 mb-2">
                <Store className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                  {product.fournisseurName}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between mt-auto">
              <div className="flex flex-col">
                {product.discount > 0 && (
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 line-through">
                    TND{product.prixTTC.toFixed(2)}
                  </span>
                )}
                <span className="font-bold text-primary-600 dark:text-primary-400 text-sm">
                  TND{discountedPrice.toFixed(2)}
                </span>
              </div>
              
              {isInCart && (
                <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium">
                  <ShoppingCart className="w-3 h-3" />
                  <span>{cartQuantity}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to={`/product/${product.id}`} 
      className="group cursor-pointer block h-full"
      onClick={handleProductView}
    >
      <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-soft rounded-soft-xl shadow-soft hover:shadow-soft-xl transform hover:-translate-y-2 transition-all duration-500 overflow-hidden border border-white/30 dark:border-neutral-700/30 hover:border-primary-200 dark:hover:border-primary-800 h-full flex flex-col">
        <div className="relative overflow-hidden">
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={product.imageURL}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          </div>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.feature && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-soft-lg flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                En vedette
              </div>
            )}
            {product.discount > 0 && (
              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-soft-lg flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                -{product.discount}%
              </div>
            )}
            {product.stockQuantity > 0 && product.stockQuantity < 10 && (
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-soft-lg">
                Il ne reste que {product.stockQuantity}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <WishlistButton productId={product.id} variant="floating" />
          </div>

          {/* Quick info overlay */}
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <div className="bg-white/95 dark:bg-neutral-800/95 backdrop-blur-soft rounded-soft p-3 shadow-soft-lg">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 font-medium">15-20 min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary-600" />
                  <span className="text-primary-600 font-medium">Livraison gratuite</span>
                </div>
              </div>
            </div>
          </div>

          {/* Out of stock overlay */}
          {product.stockQuantity === 0 && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-soft px-6 py-3 rounded-full shadow-soft-lg">
                <span className="text-neutral-800 dark:text-white font-semibold">Rupture de stock</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-bold text-neutral-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 flex-1 mr-3 min-w-0">
              {product.name}
            </h3>
            <div className="text-right flex-shrink-0">
              {product.discount > 0 && (
                <span className="text-sm text-neutral-500 dark:text-neutral-400 line-through block">
                  TND{product.prixTTC.toFixed(2)}
                </span>
              )}
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                TND{discountedPrice.toFixed(2)}
              </span>
            </div>
          </div>
          
          <p className="text-neutral-600 dark:text-neutral-300 mb-4 line-clamp-2 text-sm leading-relaxed">{product.description}</p>
          
          {/* Fournisseur info */}
          {product.fournisseurName && (
            <div className="flex items-center gap-2 mb-3">
              <Store className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">
                {product.fournisseurName}
              </span>
            </div>
          )}
          
          {/* Tags */}
          {product.Tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {product.Tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gradient-to-r from-primary-50 to-soft-50 dark:from-primary-900/30 dark:to-soft-900/30 text-primary-700 dark:text-primary-300 text-xs rounded-full font-medium border border-primary-100 dark:border-primary-800"
                >
                  {tag}
                </span>
              ))}
              {product.Tags.length > 3 && (
                <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs rounded-full border border-neutral-200 dark:border-neutral-600">
                  +{product.Tags.length - 3} de plus
                </span>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between mt-auto pt-2 min-w-0">
            <div className="flex items-center gap-4">
              <ProductRating product={product} compact={true} showReviews={false} />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">par {product.unit}</span>
            </div>
            
            <div className="flex items-center gap-3">
              {isInCart && (
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-full text-sm font-medium border border-green-200 dark:border-green-800">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>{cartQuantity}</span>
                </div>
              )}
              
              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0}
                className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-soft shadow-soft hover:shadow-glow transform hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none whitespace-nowrap"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">{product.stockQuantity === 0 ? 'Rupture de stock' : isInCart ? 'Ajouter plus' : 'Ajouter'}</span>
                <span className="sm:hidden">+</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
