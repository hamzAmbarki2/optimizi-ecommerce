import React, { useState } from 'react';
import { Star, MessageCircle, User, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Product, Review } from '../types';
import ProductRatingModal from './ProductRatingModal';

interface ProductRatingProps {
  product: Product;
  onProductUpdate?: (updatedProduct: Product) => void;
  showReviews?: boolean;
  compact?: boolean;
}

export default function ProductRating({ 
  product, 
  onProductUpdate, 
  showReviews = true,
  compact = false 
}: ProductRatingProps) {
  const { state, dispatch } = useApp();
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  const handleRatingSubmitted = (newReview: Review) => {
    if (onProductUpdate) {
      const existingReviewIndex = product.review.findIndex(
        review => review.userId === newReview.userId
      );

      let updatedReviews;
      if (existingReviewIndex >= 0) {
        updatedReviews = [...product.review];
        updatedReviews[existingReviewIndex] = newReview;
      } else {
        updatedReviews = [...product.review, newReview];
      }

      const totalRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / updatedReviews.length;

      const updatedProduct: Product = {
        ...product,
        review: updatedReviews,
        rating: Math.round(averageRating * 10) / 10
      };

      onProductUpdate(updatedProduct);
    }
  };

  const handleRateClick = () => {
    if (!state.isAuthenticated) {
      dispatch({ type: 'SET_REDIRECT_PATH', payload: window.location.pathname });
      return;
    }
    setIsRatingModalOpen(true);
  };

  const userReview = product.review.find(review => review.userId === state.user?.id);

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {product.rating && product.rating > 0 ? (
          <>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {product.rating}
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({product.review.length} {product.review.length === 1 ? 'avis' : 'avis'})
            </span>
          </>
        ) : (
          <span className="text-sm text-gray-500 dark:text-gray-400">Pas encore d’évaluations</span>
        )}
        
        {state.isAuthenticated ? (
          <button
            onClick={handleRateClick}
            className="text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors"
          >
            {userReview ? 'Mettre à jour' : 'Noter'}
          </button>
        ) : (
          <Link
            to="/signin"
            onClick={() => dispatch({ type: 'SET_REDIRECT_PATH', payload: window.location.pathname })}
            className="text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors"
          >
            Connectez-vous pour noter
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Résumé des évaluations */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Avis clients
          </h3>
          
          {state.isAuthenticated ? (
            <button
              onClick={handleRateClick}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Star className="w-4 h-4" />
              <span>{userReview ? 'Modifier l’avis' : 'Écrire un avis'}</span>
            </button>
          ) : (
            <Link
              to="/signin"
              onClick={() => dispatch({ type: 'SET_REDIRECT_PATH', payload: window.location.pathname })}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Connectez-vous pour donner votre avis</span>
            </Link>
          )}
        </div>

        {product.review.length > 0 ? (
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                {product.rating?.toFixed(1) || '0.0'}
              </div>
              <div className="flex items-center justify-center mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {product.review.length} {product.review.length === 1 ? 'avis' : 'avis'}
              </div>
            </div>

            {/* Répartition des notes */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = product.review.filter(review => review.rating === rating).length;
                const percentage = product.review.length > 0 ? (count / product.review.length) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center space-x-2 text-sm">
                    <span className="w-8 text-gray-600 dark:text-gray-400">{rating}★</span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-gray-600 dark:text-gray-400">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
              Pas encore d’avis
            </h4>
            <p className="text-gray-500 dark:text-gray-400">
              Soyez le premier à donner votre avis sur ce produit !
            </p>
          </div>
        )}
      </div>

      {/* Avis individuels */}
      {showReviews && product.review.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
            Avis récents
          </h4>
          
          {product.review
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
            .map((review) => (
              <div
                key={review.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {review.userName.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h5 className="font-medium text-gray-800 dark:text-white">
                          {review.userName}
                          {review.userId === state.user?.id && (
                            <span className="ml-2 text-xs bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 px-2 py-1 rounded-full">
                              Votre avis
                            </span>
                          )}
                        </h5>
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300 dark:text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      {review.userId === state.user?.id && (
                        <button
                          onClick={handleRateClick}
                          className="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors"
                        >
                          Modifier
                        </button>
                      )}
                    </div>
                    
                    {review.comment && (
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          
          {product.review.length > 5 && (
            <div className="text-center">
              <button className="text-primary-500 hover:text-primary-600 font-medium transition-colors">
                Voir tous les {product.review.length} avis
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal d’évaluation */}
      <ProductRatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        product={product}
        onRatingSubmitted={handleRatingSubmitted}
      />
    </div>
  );
}
