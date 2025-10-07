import React from 'react';
import CategoryCard from '../components/CategoryCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useCategories } from '../hooks/useCategories';

export default function Categories() {
  const { categories, loading, error, refetch } = useCategories();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-4">
              Catégories de <span className="text-primary-500">nourriture</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Explorez notre large variété de catégories alimentaires et découvrez vos préférées
            </p>
          </div>
          
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-gray-600 dark:text-gray-300">Chargement des catégories...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-4">
              Catégories de <span className="text-primary-500">nourriture</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Explorez notre large variété de catégories alimentaires et découvrez vos préférées
            </p>
          </div>
          
          <div className="flex justify-center items-center py-20">
            <ErrorMessage 
              message={error} 
              onRetry={refetch}
              className="max-w-md"
            />
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-4">
              Catégories de <span className="text-primary-500">nourriture</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Explorez notre large variété de catégories alimentaires et découvrez vos préférées
            </p>
          </div>
          
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-2xl">🍽️</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">Aucune catégorie disponible</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Les catégories apparaîtront ici une fois ajoutées au système.</p>
            <button
              onClick={refetch}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              Actualiser
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Catégories de <span className="text-primary-500">nourriture</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Explorez notre large variété de catégories alimentaires et découvrez vos préférées
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </div>
  );
}