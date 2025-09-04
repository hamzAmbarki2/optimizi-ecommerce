import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Plus, Minus, Tag, Clock, Shield, Store } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { useProduct, useProductsByCategory } from '../hooks/useProducts';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import ProductRating from '../components/ProductRating';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Product } from '../types';

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const { dispatch } = useApp();
  const { categories } = useCategories();
  const { product, loading, error } = useProduct(productId || '');
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Mettre à jour le produit courant lorsque les données sont chargées
  React.useEffect(() => {
    if (product) {
      setCurrentProduct(product);
    }
  }, [product]);

  const displayProduct = currentProduct || product;
  const category = displayProduct ? categories.find(cat => cat.id === displayProduct.categoryId) : null;
  const { products: relatedProducts } = useProductsByCategory(displayProduct?.categoryId || '');
  const filteredRelatedProducts = relatedProducts.filter(p => p.id !== displayProduct?.id).slice(0, 4);

  const handleProductUpdate = (updatedProduct: Product) => {
    setCurrentProduct(updatedProduct);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <Link
            to="/products"
            className="inline-flex items-center text-primary-500 hover:text-primary-600 font-medium mb-8"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour aux produits
          </Link>
          
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-gray-600 dark:text-gray-300">Chargement du produit...</p>
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
            to="/products"
            className="inline-flex items-center text-primary-500 hover:text-primary-600 font-medium mb-8"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour aux produits
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

  if (!displayProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Produit non trouvé</h1>
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour aux produits
          </Link>
        </div>
      </div>
    );
  }

  const discountedPrice = displayProduct.discount > 0 
    ? displayProduct.prixTTC * (1 - displayProduct.discount / 100)
    : displayProduct.prixTTC;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      dispatch({ type: 'ADD_TO_CART', payload: displayProduct });
    }
  };

  const images = [displayProduct.imageURL]; // Dans une vraie application, plusieurs images seraient disponibles

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Fil d'Ariane */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Link to="/" className="hover:text-primary-500">Accueil</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-primary-500">Produits</Link>
            {category && (
              <>
                <span>/</span>
                <Link to={`/category/${category.id}`} className="hover:text-primary-500">{category.title}</Link>
              </>
            )}
            <span>/</span>
            <span className="text-gray-800 dark:text-gray-200">{displayProduct.name}</span>
          </nav>
          
          <Link
            to="/products"
            className="inline-flex items-center text-primary-500 hover:text-primary-600 font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour aux produits
          </Link>
        </div>

        {/* Détails du produit */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-12">
          <div className="grid lg:grid-cols-2 gap-8 p-8">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={images[selectedImage] || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600'}
                  alt={displayProduct.name}
                  className="w-full h-96 object-cover rounded-2xl shadow-lg"
                />
                {displayProduct.discount > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-lg font-medium flex items-center">
                    <Tag className="w-4 h-4 mr-1" />
                    -{displayProduct.discount}%
                  </div>
                )}
                {displayProduct.stockQuantity > 0 && displayProduct.stockQuantity < 10 && (
                  <div className="absolute top-4 right-4 bg-primary-500 text-white px-3 py-1 rounded-lg font-medium">
                    Plus que {displayProduct.stockQuantity} en stock
                  </div>
                )}
                {displayProduct.stockQuantity > 0 && (
                  <div className="absolute bottom-4 right-4 bg-green-500 text-white px-3 py-1 rounded-lg font-medium">
                    {displayProduct.stockQuantity} en stock
                  </div>
                )}
              </div>
              
              {images.length > 1 && (
                <div className="flex space-x-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-primary-500' : 'border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <img src={image} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Infos du produit */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{displayProduct.name}</h1>
                {category && (
                  <Link
                    to={`/category/${category.id}`}
                    className="text-primary-500 hover:text-primary-600 font-medium"
                  >
                    {category.title}
                  </Link>
                )}
                
                {/* Fournisseur info */}
                {displayProduct.fournisseurName && (
                  <div className="flex items-center gap-2 mt-3">
                    <Store className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    <span className="text-lg text-neutral-700 dark:text-neutral-300 font-medium">
                      Vendu par {displayProduct.fournisseurName}
                    </span>
                  </div>
                )}
              </div>

              {/* Évaluation */}
              <ProductRating 
                product={displayProduct} 
                onProductUpdate={handleProductUpdate}
                compact={true} 
                showReviews={false} 
              />

              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  {displayProduct.discount > 0 && (
                    <span className="text-2xl text-gray-500 dark:text-gray-400 line-through">
                      TND{displayProduct.prixTTC.toFixed(2)}
                    </span>
                  )}
                  <span className="text-3xl font-bold text-primary-500">
                    TND{discountedPrice.toFixed(2)}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">par {displayProduct.unit}</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Prix hors TVA : TND{displayProduct.prixHTVA.toFixed(2)} (TVA : {displayProduct.tva}%)
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{displayProduct.description}</p>

              {displayProduct.Tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {displayProduct.Tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Prêt en 15-20 min</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Qualité garantie</span>
                </div>
              </div>

              {/* Quantité et Ajout au panier */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Quantité :</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Minus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                    <span className="w-12 text-center font-medium text-gray-800 dark:text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={displayProduct.stockQuantity === 0}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Ajouter au panier - TND{(discountedPrice * quantity).toFixed(2)}</span>
                  </button>
                  <button className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Heart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                {displayProduct.stockQuantity === 0 && (
                  <p className="text-red-500 font-medium">Cet article est actuellement en rupture de stock</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Avis */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-12">
          <ProductRating 
            product={displayProduct} 
            onProductUpdate={handleProductUpdate}
            showReviews={true} 
          />
        </div>

        {/* Produits similaires */}
        {filteredRelatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              Plus de <span className="text-primary-500">{category?.title}</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredRelatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}