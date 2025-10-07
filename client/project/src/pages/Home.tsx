import React, { useState } from 'react';
import { 
  Search, 
  Clock, 
  Star, 
  Truck, 
  Shield, 
  Smartphone, 
  Play,
  ChevronRight,
  Heart,
  ShoppingBag,
  Sparkles,
  Award,
  Users,
  ChevronLeft,
  Calendar,
  Eye,
  ArrowRight,
  Filter,
  Grid,
  List
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useCategories } from '../hooks/useCategories';
import { useFeaturedProducts, useProducts } from '../hooks/useProducts';
import { useApp } from '../context/AppContext';

export default function Home() {
  const { categories, loading: categoriesLoading } = useCategories();
  const { products: featuredProducts, loading: productsLoading } = useFeaturedProducts();
  const { products: allProducts, loading: allProductsLoading } = useProducts();
  const { dispatch } = useApp();

  // Blog section state
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const productsPerPage = 6;
  
  // Filter products for blog section
  const blogProducts = selectedCategory === 'all' 
    ? allProducts 
    : allProducts.filter(product => product.categoryId === selectedCategory);
  
  const totalPages = Math.ceil(blogProducts.length / productsPerPage);
  const currentProducts = blogProducts.slice(
    currentPage * productsPerPage, 
    (currentPage + 1) * productsPerPage
  );

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-soft-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      {/* Section héroïque */}
      <section className="relative px-6 pt-16 pb-24 overflow-hidden">
        {/* Décoration de fond */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-400/20 to-soft-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-soft-400/20 to-primary-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-soft-100 dark:from-primary-900/30 dark:to-soft-900/30 rounded-full border border-primary-200 dark:border-primary-800">
                  <Sparkles className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-primary-700 dark:text-primary-300">E-commerce optimisé</span>
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-bold text-neutral-800 dark:text-white leading-tight">
                  Votre
                  <span className="block bg-gradient-to-r from-primary-600 via-primary-500 to-soft-500 bg-clip-text text-transparent">
                    Shopping
                  </span>
                  <span className="block text-4xl lg:text-5xl text-neutral-600 dark:text-neutral-300">
                    Optimisé
                  </span>
                </h1>
                <p className="text-xl text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-lg">
                  Découvrez une expérience d'achat révolutionnaire avec Optimizi. Des produits de qualité, une livraison rapide et un service client exceptionnel.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher des produits..."
                    className="w-full pl-12 pr-4 py-4 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-soft dark:text-white rounded-soft-lg shadow-soft border border-white/50 dark:border-neutral-700/50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none text-neutral-700 transition-all duration-300"
                  />
                </div>
                <Link
                  to="/products"
                  className="px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-soft-lg shadow-soft hover:shadow-glow transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Découvrir
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">50K+</div>
                  <div className="text-neutral-600 dark:text-neutral-400 text-sm">Clients satisfaits</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">200+</div>
                  <div className="text-neutral-600 dark:text-neutral-400 text-sm">Produits disponibles</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">24h</div>
                  <div className="text-neutral-600 dark:text-neutral-400 text-sm">Livraison rapide</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10">
                <div className="relative overflow-hidden rounded-soft-2xl shadow-soft-2xl">
                  <img
                    src="https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Shopping optimisé avec Optimizi"
                    className="w-full h-96 lg:h-[500px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                </div>
              </div>
              
              {/* Éléments flottants */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-soft-xl shadow-soft-lg flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
              
              <div className="absolute -bottom-8 -left-8 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-soft p-6 rounded-soft-xl shadow-soft-xl border border-white/50 dark:border-neutral-700/50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-soft flex items-center justify-center shadow-soft">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-800 dark:text-white">Livraison rapide</div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">En 24h maximum</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-1/2 -right-4 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-soft p-4 rounded-soft-lg shadow-soft-lg border border-white/50 dark:border-neutral-700/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-white fill-current" />
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-800 dark:text-white text-sm">Note 4.9</div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">De plus de 10K avis</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog-Style Products Section */}
      <section className="px-6 py-20 bg-gradient-to-br from-white via-neutral-50 to-soft-50/50 dark:from-neutral-800 dark:via-neutral-800 dark:to-neutral-700/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-soft-100 dark:from-primary-900/30 dark:to-soft-900/30 rounded-full border border-primary-200 dark:border-primary-800 mb-6">
              <Calendar className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">Découvertes du jour</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 dark:text-white mb-4">
              Notre <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">collection</span>
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">Explorez notre sélection quotidienne de produits exceptionnels, soigneusement choisis pour vous</p>
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row items-center justify-between mb-12 gap-6">
            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleCategoryFilter('all')}
                className={`px-6 py-3 rounded-soft-lg font-medium transition-all duration-300 ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-soft-lg'
                    : 'bg-white/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 shadow-soft'
                }`}
              >
                Tous les produits
              </button>
              {categories.slice(0, 4).map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryFilter(category.id)}
                  className={`px-6 py-3 rounded-soft-lg font-medium transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-soft-lg'
                      : 'bg-white/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 shadow-soft'
                  }`}
                >
                  {category.title}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-white/80 dark:bg-neutral-800/80 rounded-soft-lg shadow-soft p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-soft transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-primary-500 text-white shadow-soft' 
                      : 'text-neutral-600 dark:text-neutral-300 hover:text-primary-500'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('carousel')}
                  className={`p-3 rounded-soft transition-all duration-300 ${
                    viewMode === 'carousel' 
                      ? 'bg-primary-500 text-white shadow-soft' 
                      : 'text-neutral-600 dark:text-neutral-300 hover:text-primary-500'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation for carousel mode */}
              {viewMode === 'carousel' && totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevPage}
                    className="p-3 bg-white/80 dark:bg-neutral-800/80 rounded-soft-lg shadow-soft hover:shadow-soft-lg transition-all duration-300 text-neutral-700 dark:text-neutral-300 hover:text-primary-500"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextPage}
                    className="p-3 bg-white/80 dark:bg-neutral-800/80 rounded-soft-lg shadow-soft hover:shadow-soft-lg transition-all duration-300 text-neutral-700 dark:text-neutral-300 hover:text-primary-500"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Products Display */}
          {allProductsLoading ? (
            <div className="flex justify-center py-16">
              <div className="text-center">
                <LoadingSpinner size="lg" className="mb-4" />
                <p className="text-neutral-600 dark:text-neutral-400">Chargement de notre collection...</p>
              </div>
            </div>
          ) : blogProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-soft-xl flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 text-neutral-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Aucun produit dans cette catégorie</h3>
              <p className="text-neutral-500 dark:text-neutral-500">Essayez une autre catégorie ou consultez tous nos produits.</p>
            </div>
          ) : (
            <>
              {/* Blog Cards Grid */}
              <div className={`grid gap-8 mb-12 ${
                viewMode === 'grid' 
                  ? 'md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1 lg:grid-cols-2'
              }`}>
                {currentProducts.map((product, index) => {
                  const discountedPrice = product.discount > 0 
                    ? product.prixTTC * (1 - product.discount / 100)
                    : product.prixTTC;

                  return (
                    <article 
                      key={product.id} 
                      className="group bg-white/80 dark:bg-neutral-800/80 backdrop-blur-soft rounded-soft-2xl shadow-soft hover:shadow-soft-xl transition-all duration-500 overflow-hidden border border-white/50 dark:border-neutral-700/50 hover:border-primary-200 dark:hover:border-primary-800"
                    >
                      {/* Image */}
                      <div className="relative overflow-hidden">
                        <div className="aspect-[16/10] overflow-hidden">
                          <img
                            src={product.imageURL}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        </div>
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          {product.feature && (
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-soft-lg flex items-center gap-1.5">
                              <Award className="w-3.5 h-3.5" />
                              En vedette
                            </div>
                          )}
                          {product.discount > 0 && (
                            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-soft-lg">
                              -{product.discount}%
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                          <Link
                            to={`/product/${product.id}`}
                            onClick={() => dispatch({ type: 'ADD_TO_RECENTLY_VIEWED', payload: product.id })}
                            className="flex items-center gap-2 px-4 py-2 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-soft rounded-soft-lg shadow-soft-lg hover:shadow-glow transition-all duration-300 text-neutral-800 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="font-medium">Voir détails</span>
                          </Link>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        {/* Category & Date */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                            {categories.find(cat => cat.id === product.categoryId)?.title || 'Produit'}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(product.createdAt).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-neutral-800 dark:text-white mb-3 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          <Link 
                            to={`/product/${product.id}`}
                            onClick={() => dispatch({ type: 'ADD_TO_RECENTLY_VIEWED', payload: product.id })}
                          >
                            {product.name}
                          </Link>
                        </h3>

                        {/* Description */}
                        <p className="text-neutral-600 dark:text-neutral-300 mb-4 line-clamp-3 leading-relaxed">
                          {product.description}
                        </p>

                        {/* Tags */}
                        {product.Tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {product.Tags.slice(0, 3).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-3 py-1 bg-gradient-to-r from-primary-50 to-soft-50 dark:from-primary-900/30 dark:to-soft-900/30 text-primary-700 dark:text-primary-300 text-xs rounded-full font-medium border border-primary-100 dark:border-primary-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-700">
                          <div className="flex items-center gap-4">
                            {/* Rating */}
                            {product.rating && product.rating > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                  {product.rating}
                                </span>
                              </div>
                            )}

                            {/* Stock */}
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${product.stockQuantity > 10 ? 'bg-green-500' : product.stockQuantity > 0 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                                {product.stockQuantity > 10 ? 'En stock' : product.stockQuantity > 0 ? `${product.stockQuantity} restants` : 'Rupture'}
                              </span>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            {product.discount > 0 && (
                              <div className="text-sm text-neutral-500 dark:text-neutral-400 line-through">
                                TND{product.prixTTC.toFixed(2)}
                              </div>
                            )}
                            <div className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                              TND{discountedPrice.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* Read More Link */}
                        <div className="mt-4">
                          <Link
                            to={`/product/${product.id}`}
                            onClick={() => dispatch({ type: 'ADD_TO_RECENTLY_VIEWED', payload: product.id })}
                            className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors group/link"
                          >
                            <span>Lire la suite</span>
                            <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 0}
                    className="flex items-center gap-2 px-6 py-3 bg-white/80 dark:bg-neutral-800/80 rounded-soft-lg shadow-soft hover:shadow-soft-lg transition-all duration-300 text-neutral-700 dark:text-neutral-300 hover:text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Précédent</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => goToPage(i)}
                        className={`w-10 h-10 rounded-soft transition-all duration-300 ${
                          currentPage === i
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-soft'
                            : 'bg-white/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 hover:text-primary-500 shadow-soft hover:shadow-soft-lg'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages - 1}
                    className="flex items-center gap-2 px-6 py-3 bg-white/80 dark:bg-neutral-800/80 rounded-soft-lg shadow-soft hover:shadow-soft-lg transition-all duration-300 text-neutral-700 dark:text-neutral-300 hover:text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Suivant</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* View All Products Link */}
              <div className="text-center mt-12">
                <Link
                  to="/products"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-soft-lg shadow-soft hover:shadow-glow transform hover:-translate-y-1 transition-all duration-300 gap-2"
                >
                  Voir tous nos produits
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Catégories */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-soft-100 dark:from-primary-900/30 dark:to-soft-900/30 rounded-full border border-primary-200 dark:border-primary-800 mb-6">
              <ShoppingBag className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">Parcourir les catégories</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 dark:text-white mb-4">
              Découvrez nos <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">catégories</span>
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">Explorez notre sélection diversifiée de produits soigneusement organisés</p>
          </div>
          
          {categoriesLoading ? (
            <div className="flex justify-center py-16">
              <div className="text-center">
                <LoadingSpinner size="lg" className="mb-4" />
                <p className="text-neutral-600 dark:text-neutral-400">Chargement des catégories...</p>
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-soft-xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🛍️</span>
              </div>
              <h3 className="text-xl font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Aucune catégorie disponible</h3>
              <p className="text-neutral-500 dark:text-neutral-500">Les catégories apparaîtront ici une fois ajoutées.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {categories.slice(0, 6).map((category) => (
                  <Link key={category.id} to={`/category/${category.id}`} className="group cursor-pointer">
                    <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-soft p-6 rounded-soft-xl shadow-soft hover:shadow-soft-lg transform hover:-translate-y-2 transition-all duration-300 border border-white/50 dark:border-neutral-700/50 hover:border-primary-200 dark:hover:border-primary-800">
                      <div className="relative w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-soft-lg flex items-center justify-center text-2xl mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 overflow-hidden shadow-soft">
                        <img
                          src={category.imgSrc}
                          alt={category.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-primary-600/20"></div>
                      </div>
                      <h3 className="text-center font-semibold text-neutral-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors text-sm">
                        {category.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
              
              <div className="text-center mt-12">
                <Link
                  to="/categories"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-soft-lg shadow-soft hover:shadow-glow transform hover:-translate-y-1 transition-all duration-300 gap-2"
                >
                  Voir toutes les catégories
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Produits en vedette */}
      <section className="px-6 py-20 bg-gradient-to-br from-primary-50/50 via-white to-soft-50/50 dark:from-neutral-800/50 dark:via-neutral-800 dark:to-neutral-700/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-soft-100 dark:from-primary-900/30 dark:to-soft-900/30 rounded-full border border-primary-200 dark:border-primary-800 mb-6">
              <Award className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">Sélection en vedette</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 dark:text-white mb-4">
              Produits <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">populaires</span>
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">Notre sélection soigneusement choisie de produits en vedette les plus appréciés</p>
          </div>
          
          {productsLoading ? (
            <div className="flex justify-center py-16">
              <div className="text-center">
                <LoadingSpinner size="lg" className="mb-4" />
                <p className="text-neutral-600 dark:text-neutral-400">Chargement des produits en vedette...</p>
              </div>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-soft-xl flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-neutral-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Aucun produit en vedette disponible</h3>
              <p className="text-neutral-500 dark:text-neutral-500 mb-6">Les produits en vedette apparaîtront ici une fois marqués comme tels.</p>
              <Link
                to="/products"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all gap-2"
              >
                Parcourir tous les produits
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProducts.slice(0, 6).map((product) => (
                  <ProductCard key={product.id} product={product} variant="featured" />
                ))}
              </div>
              
              <div className="text-center mt-12">
                <Link
                  to="/products"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-soft-lg shadow-soft hover:shadow-glow transform hover:-translate-y-1 transition-all duration-300 gap-2"
                >
                  Voir tous les produits
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Comment ça fonctionne */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-soft-100 dark:from-primary-900/30 dark:to-soft-900/30 rounded-full border border-primary-200 dark:border-primary-800 mb-6">
              <Users className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">Processus simple</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 dark:text-white mb-4">
              Comment ça <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">fonctionne</span>
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">Obtenez vos produits préférés en 3 étapes faciles</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Parcourez & Choisissez',
                description: 'Explorez notre vaste catalogue de produits et trouvez exactement ce que vous cherchez',
                icon: Search,
                color: 'from-blue-500 to-cyan-500'
              },
              {
                step: '2',
                title: 'Paiement sécurisé',
                description: 'Payez en toute sécurité avec votre méthode de paiement préférée',
                icon: Shield,
                color: 'from-green-500 to-emerald-500'
              },
              {
                step: '3',
                title: 'Livraison rapide',
                description: 'Recevez vos produits rapidement et en parfait état à votre domicile',
                icon: Truck,
                color: 'from-primary-500 to-primary-600'
              }
            ].map((step, index) => (
              <div key={index} className="text-center group">
                <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-soft-2xl flex items-center justify-center mx-auto mb-8 shadow-soft-lg group-hover:shadow-glow group-hover:scale-110 transition-all duration-300`}>
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-soft p-8 rounded-soft-xl shadow-soft hover:shadow-soft-lg transition-all duration-300 border border-white/50 dark:border-neutral-700/50">
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent mb-4">{step.step}</div>
                  <h3 className="text-2xl font-bold text-neutral-800 dark:text-white mb-4">{step.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Téléchargement de l'application */}
      <section className="px-6 py-20 bg-gradient-to-br from-primary-500 via-primary-600 to-soft-600 relative overflow-hidden">
        {/* Décoration de fond */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-white space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-soft rounded-full border border-white/30">
                  <Smartphone className="w-4 h-4" />
                  <span className="text-sm font-medium">Téléchargez notre application</span>
                </div>
                
                <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                  Obtenez la meilleure expérience avec notre application mobile
                </h2>
                <p className="text-xl text-primary-100 leading-relaxed">
                  Profitez d'une expérience d'achat optimisée, d'offres exclusives, d'un suivi en temps réel et de recommandations personnalisées avec notre application mobile.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex items-center space-x-3 bg-black/80 backdrop-blur-soft text-white px-6 py-4 rounded-soft-lg hover:bg-black/90 transition-all duration-300 shadow-soft hover:shadow-soft-lg">
                  <Smartphone className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-xs opacity-80">Téléchargez sur l'</div>
                    <div className="text-lg font-semibold">App Store</div>
                  </div>
                </button>
                <button className="flex items-center space-x-3 bg-black/80 backdrop-blur-soft text-white px-6 py-4 rounded-soft-lg hover:bg-black/90 transition-all duration-300 shadow-soft hover:shadow-soft-lg">
                  <Smartphone className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-xs opacity-80">Obtenez-le sur</div>
                    <div className="text-lg font-semibold">Google Play</div>
                  </div>
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10">
                <img
                  src="https://images.pexels.com/photos/4393021/pexels-photo-4393021.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Application mobile Optimizi"
                  className="w-full max-w-md mx-auto rounded-soft-2xl shadow-soft-2xl"
                />
              </div>
              
              {/* Fonctionnalités de l'application flottantes */}
              <div className="absolute -top-4 -left-4 bg-white/95 backdrop-blur-soft p-4 rounded-soft-lg shadow-soft-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-800 text-sm">Suivi en temps réel</div>
                    <div className="text-xs text-neutral-600">Suivez vos commandes en direct</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 bg-white/95 backdrop-blur-soft p-4 rounded-soft-lg shadow-soft-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white fill-current" />
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-800 text-sm">Offres exclusives</div>
                    <div className="text-xs text-neutral-600">Offres exclusives à l'application</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}