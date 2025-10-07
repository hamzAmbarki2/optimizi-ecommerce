import React from 'react';
import { PencilIcon, TrashIcon, TagIcon } from '@heroicons/react/24/outline';
import { Product } from '../../models';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  const isOutOfStock = parseInt(product.stockQuantity) === 0;
  const hasDiscount = parseFloat(product.discount) > 0;

  return (
    <div className={`bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${isOutOfStock ? 'opacity-75' : ''} h-full flex flex-col`}>
      <div className="relative">
        <img
          src={product.imageURL || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
          alt={product.title}
          className="w-full h-48 object-cover"
        />
        {product.feature && (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            Featured
          </span>
        )}
        {hasDiscount && (
          <span className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            -{product.discount}%
          </span>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
        
        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                <TagIcon className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{product.tags.length - 3} more</span>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4 mt-auto">
          <div>
            <div className="flex items-center space-x-2">
              {hasDiscount ? (
                <>
                  <p className="text-lg font-bold text-green-600">${product.prixAfterDiscount}</p>
                  <p className="text-sm text-gray-500 line-through">${product.prixTTC}</p>
                </>
              ) : (
                <p className="text-2xl font-bold text-gray-900">${product.prixTTC}</p>
              )}
            </div>
            <p className="text-xs text-gray-500">
              HT: ${product.prixHTVA} | TVA: {product.tva}%
            </p>
            <p className="text-sm text-gray-500">Stock: {product.stockQuantity} {product.unit}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            product.isAvailable && !isOutOfStock
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isOutOfStock ? 'Out of Stock' : product.isAvailable ? 'Available' : 'Disabled'}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-red-200 text-sm font-medium rounded-xl text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;