import React, { useState } from 'react';
import { X, Star, Send, Loader } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { productService } from '../services/productService';
import { Product, Review } from '../types';

interface ProductRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onRatingSubmitted: (newReview: Review) => void;
}

export default function ProductRatingModal({ 
  isOpen, 
  onClose, 
  product, 
  onRatingSubmitted 
}: ProductRatingModalProps) {
  const { state } = useApp();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existingReview = product.review.find(review => review.userId === state.user?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!state.user) {
      setError('Vous devez être connecté pour noter ce produit');
      return;
    }

    if (rating === 0) {
      setError('Veuillez sélectionner une note');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newReview: Review = {
        id: `${state.user.id}_${Date.now()}`,
        userId: state.user.id,
        userName: state.user.fullName,
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString()
      };

      const updatedReviews = existingReview 
        ? product.review.map(review => 
            review.userId === state.user!.id ? newReview : review
          )
        : [...product.review, newReview];

      const totalRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / updatedReviews.length;

      await productService.updateProduct(product.id, {
        review: updatedReviews,
        rating: Math.round(averageRating * 10) / 10
      });

      onRatingSubmitted(newReview);
      onClose();
      
      setRating(0);
      setComment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de l’envoi de la note');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setComment('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Fond */}
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={handleClose} />
      
      {/* Modale */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* En-tête */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {existingReview ? 'Mettre à jour votre avis' : 'Noter ce produit'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Info produit */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <img
                src={product.imageURL}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-xl"
              />
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-primary-500 font-semibold">
                  TND{product.prixTTC.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Formulaire de notation */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Étoiles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Votre note *
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= (hoveredRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {rating === 1 && 'Médiocre'}
                  {rating === 2 && 'Passable'}
                  {rating === 3 && 'Bon'}
                  {rating === 4 && 'Très bon'}
                  {rating === 5 && 'Excellent'}
                </p>
              )}
            </div>

            {/* Commentaire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Votre avis (optionnel)
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Partagez votre expérience avec ce produit..."
                maxLength={500}
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                {comment.length}/500
              </div>
            </div>

            {/* Bouton soumission */}
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>{existingReview ? 'Mettre à jour l’avis' : 'Envoyer l’avis'}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
