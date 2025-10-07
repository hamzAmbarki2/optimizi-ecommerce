import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { useCategories } from '../hooks/useCategories';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    priceRange: [number, number];
    categories: string[];
    rating: number;
  };
  onFiltersChange: (filters: any) => void;
}

export default function FilterSidebar({ isOpen, onClose, filters, onFiltersChange }: FilterSidebarProps) {
  const { categories, loading: categoriesLoading } = useCategories();
  const [localFilters, setLocalFilters] = useState(filters);

  const handlePriceChange = (index: number, value: number) => {
    const newPriceRange: [number, number] = [...localFilters.priceRange];
    newPriceRange[index] = value;
    setLocalFilters({ ...localFilters, priceRange: newPriceRange });
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = localFilters.categories.includes(categoryId)
      ? localFilters.categories.filter(id => id !== categoryId)
      : [...localFilters.categories, categoryId];
    setLocalFilters({ ...localFilters, categories: newCategories });
  };

  const handleRatingChange = (rating: number) => {
    setLocalFilters({ ...localFilters, rating });
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const clearFilters = () => {
    const clearedFilters = {
      priceRange: [0, 500] as [number, number],
      categories: [],
      rating: 0,
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={`
        fixed lg:static lg:sticky top-0 left-0 h-full lg:h-auto w-80 bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:w-64 lg:shadow-lg lg:rounded-2xl p-6 lg:top-24
      `}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtres
          </h3>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Plage de prix */}
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Plage de prix</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={localFilters.priceRange[0]}
                  onChange={(e) => handlePriceChange(0, Number(e.target.value))}
                  className="flex-1 accent-primary-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300 w-12">TND{localFilters.priceRange[0]}</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={localFilters.priceRange[1]}
                  onChange={(e) => handlePriceChange(1, Number(e.target.value))}
                  className="flex-1 accent-primary-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300 w-12">TND{localFilters.priceRange[1]}</span>
              </div>
            </div>
          </div>

          {/* Catégories */}
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Catégories</h4>
            {categoriesLoading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localFilters.categories.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="rounded border-gray-300 dark:border-gray-600 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{category.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Note minimale */}
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Note minimale</h4>
            <div className="space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <label key={rating} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={localFilters.rating === rating}
                    onChange={() => handleRatingChange(rating)}
                    className="text-primary-500 focus:ring-primary-500"
                  />
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="ml-1 text-gray-700 dark:text-gray-300">et plus</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={applyFilters}
            className="w-full px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Appliquer les filtres
          </button>
          <button
            onClick={clearFilters}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </>
  );
}
