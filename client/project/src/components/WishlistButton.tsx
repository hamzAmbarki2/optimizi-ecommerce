import React from 'react';
import { Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'floating' | 'compact';
}

export default function WishlistButton({ 
  productId, 
  className = '', 
  size = 'md',
  variant = 'default'
}: WishlistButtonProps) {
  const { state, dispatch } = useApp();
  const isInWishlist = state.wishlist.includes(productId);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist) {
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
    } else {
      dispatch({ type: 'ADD_TO_WISHLIST', payload: productId });
    }
  };

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const baseClasses = `
    ${sizeClasses[size]} 
    rounded-full 
    flex items-center justify-center 
    transition-all duration-300 
    hover:scale-110
    ${className}
  `;

  const titleText = isInWishlist 
    ? 'Retirer de la liste de souhaits' 
    : 'Ajouter à la liste de souhaits';

  if (variant === 'floating') {
    return (
      <button
        onClick={handleToggleWishlist}
        className={`${baseClasses} bg-white/90 dark:bg-neutral-800/90 backdrop-blur-soft shadow-soft hover:shadow-soft-lg border border-white/50 dark:border-neutral-700/50`}
        title={titleText}
      >
        <Heart 
          className={`${iconSizes[size]} transition-colors ${
            isInWishlist 
              ? 'fill-red-500 text-red-500' 
              : 'text-neutral-600 dark:text-neutral-400 hover:text-red-500'
          }`} 
        />
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleToggleWishlist}
        className={`${baseClasses} hover:bg-red-50 dark:hover:bg-red-900/20`}
        title={titleText}
      >
        <Heart 
          className={`${iconSizes[size]} transition-colors ${
            isInWishlist 
              ? 'fill-red-500 text-red-500' 
              : 'text-neutral-600 dark:text-neutral-400 hover:text-red-500'
          }`} 
        />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleWishlist}
      className={`${baseClasses} ${
        isInWishlist
          ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500'
      }`}
      title={titleText}
    >
      <Heart 
        className={`${iconSizes[size]} transition-colors ${
          isInWishlist ? 'fill-current' : ''
        }`} 
      />
    </button>
  );
}
