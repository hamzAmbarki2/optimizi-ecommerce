import React, { useState } from 'react';
import { Plus, Minus, ShoppingCart, X } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';

interface QuickAddToCartProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
}

export default function QuickAddToCart({ product, isOpen, onClose, position }: QuickAddToCartProps) {
  const { dispatch } = useApp();
  const [quantity, setQuantity] = useState(1);

  const discountedPrice = product.discount > 0 
    ? product.prixTTC * (1 - product.discount / 100)
    : product.prixTTC;

  const handleAddToCart = () => {
    dispatch({ 
      type: 'ADD_TO_CART', 
      payload: { product, quantity }
    });
    onClose();
    setQuantity(1);
  };

  if (!isOpen) return null;

  const maxLeft = window.innerWidth - 320;
  const maxTop = window.innerHeight - 300;
  const left = Math.min(position.x, maxLeft);
  const top = Math.min(position.y, maxTop);

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div 
        className="fixed z-50 bg-white rounded-2xl shadow-2xl p-6 w-80"
        style={{ left, top }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quickAddTitle"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 id="quickAddTitle" className="text-lg font-bold text-gray-800">Ajout rapide</h3>
          <button
            onClick={onClose}
            aria-label="Fermer la fenêtre d'ajout rapide"
            className="p-1 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-4 mb-4">
          <img
            src={product.imageURL}
            alt={product.name}
            className="w-16 h-16 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 line-clamp-2">{product.name}</h4>
            <div className="flex items-center space-x-2">
              {product.discount > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  TND{product.prixTTC.toFixed(2)}
                </span>
              )}
              <span className="text-lg font-bold text-orange-500">
                TND{discountedPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <label htmlFor="quantity" className="font-medium text-gray-700">Quantité :</label>
          <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
            <button
              type="button"
              aria-label="Diminuer la quantité"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Minus className="w-4 h-4 text-gray-600" />
            </button>
            <input
              type="number"
              id="quantity"
              min={1}
              max={99}
              value={quantity}
              onChange={e => {
                const val = Number(e.target.value);
                if (!isNaN(val)) setQuantity(Math.min(Math.max(1, val), 99));
              }}
              className="w-12 text-center bg-gray-100 rounded-lg outline-none border border-gray-300"
              aria-live="polite"
            />
            <button
              type="button"
              aria-label="Augmenter la quantité"
              onClick={() => setQuantity(q => Math.min(q + 1, 99))}
              className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Ajouter TND{(discountedPrice * quantity).toFixed(2)} au panier</span>
        </button>
      </div>
    </>
  );
}
