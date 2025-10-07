import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useCategory } from '../hooks/useCategories';
import { useProductsByCategory } from '../hooks/useProducts';

export default function CategoryProducts() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { category, loading: categoryLoading, error: categoryError } = useCategory(categoryId || '');
  const { products: categoryProducts, loading: productsLoading, error: productsError } = useProductsByCategory(categoryId || '');

  const loading = categoryLoading || productsLoading;
  const error = categoryError || productsError;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <Link
            to="/categories"
            className="inline-flex items-center text-primary-500 hover:text-primary-600 font-medium mb-8"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour aux catégories
          </Link>
          
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-gray-600 dark:text-gray-300">Chargement de la catégorie et des produits...</p>
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
          <Link
            to="/categories"
            className="inline-flex items-center text-primary-500 hover:text-primary-600 font-medium mb-8"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour aux catégories
          </Link>
          
          <div className="flex justify-center items-center py-20">
            <ErrorMessage 
              message={error}
              className="max-w-md"
            />
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Catégorie non trouvée</h1>
          <Link
            to="/categories"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour aux catégories
          </Link>
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
            to="/categories"
            className="inline-flex items-center text-primary-500 hover:text-primary-600 font-medium mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour aux catégories
          </Link>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <img
                src={category.imgSrc}
                alt={category.title}
                className="w-32 h-32 object-cover rounded-2xl shadow-lg"
              />
              <div className="text-center md:text-left">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">{category.title}</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">{category.subtitle}</p>
                <div className="flex items-center justify-center md:justify-start space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>{categoryProducts.length} produits disponibles</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Produits */}
        {categoryProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-2xl">🍽️</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">Aucun produit dans cette catégorie pour l'instant</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Revenez bientôt pour de nouvelles ajouts !</p>
            <Link
              to="/categories"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl"
            >
              Parcourir d'autres catégories
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Produits dans {category.title}
              </h2>
              <span className="text-gray-600 dark:text-gray-300">{categoryProducts.length} articles</span>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}