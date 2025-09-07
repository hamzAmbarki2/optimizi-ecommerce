import React from 'react';
import { TopProduct } from '../../types/dashboard';
import { ShoppingBagIcon, TrophyIcon } from '@heroicons/react/24/outline';

interface TopProductsWidgetProps {
  products: TopProduct[];
  loading?: boolean;
}

const TopProductsWidget: React.FC<TopProductsWidgetProps> = ({ products, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-4 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Top Selling Products</h3>
          <TrophyIcon className="h-6 w-6 text-yellow-500" />
        </div>
        <div className="text-center py-8">
          <ShoppingBagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No sales data available yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Top Selling Products</h3>
        <TrophyIcon className="h-6 w-6 text-yellow-500" />
      </div>
      
      <div className="space-y-4">
        {products.map((product, index) => (
          <div key={product.id} className="flex items-center space-x-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
              {index < 3 && (
                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                }`}>
                  {index + 1}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{product.sales} sold</span>
                <span className="font-medium text-green-600">${product.revenue.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                index === 0 ? 'bg-yellow-100 text-yellow-800' :
                index === 1 ? 'bg-gray-100 text-gray-800' :
                index === 2 ? 'bg-orange-100 text-orange-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                #{index + 1}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProductsWidget;