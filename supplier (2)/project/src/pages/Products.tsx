import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/config';
import { useAuth } from '../contexts/AuthContext';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
  TagIcon
} from '@heroicons/react/24/outline';

interface Product {
  id: string;
  title: string;
  description: string;
  imageURL: string;
  categoryId: string;
  stockQuantity: string;
  isAvailable: boolean;
  discount: string;
  unit: string;
  tva: number;
  prixHTVA: string;
  prixTTC: string;
  prixAfterDiscount: string;
  feature: boolean;
  FournisseurId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  title: string;
}

const Products: React.FC = () => {
  const { userData } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fournisseurId, setFournisseurId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageURL: '',
    categoryId: '',
    stockQuantity: '',
    isAvailable: true,
    discount: '0',
    unit: 'piece',
    tva: 19,
    prixHTVA: '',
    feature: false,
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchFournisseurAndData();
  }, [userData]);

  const fetchFournisseurAndData = async () => {
    try {
      setLoading(true);
      if (!userData?.uid) return;

      // First get the fournisseur ID
      const fournisseurQuery = query(
        collection(db, 'Fournisseurs'),
        where('ownerId', '==', userData.uid)
      );
      const fournisseurSnapshot = await getDocs(fournisseurQuery);
      
      if (fournisseurSnapshot.empty) {
        setLoading(false);
        return;
      }

      const fournisseurDoc = fournisseurSnapshot.docs[0];
      const fournisseurIdValue = fournisseurDoc.id;
      setFournisseurId(fournisseurIdValue);

      // Fetch products for this fournisseur
      const productsQuery = query(
        collection(db, 'products'),
        where('FournisseurId', '==', fournisseurIdValue)
      );
      const productsSnapshot = await getDocs(productsQuery);
      
      const productsData = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      setProducts(productsData);

      // Fetch categories for this fournisseur
      const categoriesQuery = query(
        collection(db, 'categories'),
        where('FournisseurId', '==', fournisseurIdValue)
      );
      const categoriesSnapshot = await getDocs(categoriesQuery);
      
      const categoriesData = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title
      })) as Category[];
      
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePrices = (prixHTVA: string, tva: number, discount: string) => {
    const basePrice = parseFloat(prixHTVA) || 0;
    const taxRate = tva / 100;
    const discountRate = parseFloat(discount) / 100;
    
    const prixTTC = basePrice * (1 + taxRate);
    const prixAfterDiscount = prixTTC * (1 - discountRate);
    
    return {
      prixTTC: prixTTC.toFixed(3),
      prixAfterDiscount: prixAfterDiscount.toFixed(3)
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fournisseurId) {
      alert('Please create your supplier profile first');
      return;
    }

    try {
      const { prixTTC, prixAfterDiscount } = calculatePrices(formData.prixHTVA, formData.tva, formData.discount);
      
      // Check if stock is 0 and set availability accordingly
      const stockQuantity = parseInt(formData.stockQuantity) || 0;
      const isAvailable = stockQuantity > 0 ? formData.isAvailable : false;

      const productData = {
        ...formData,
        prixTTC,
        prixAfterDiscount,
        isAvailable,
        FournisseurId: fournisseurId,
        updatedAt: new Date().toISOString(),
        review: []
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: new Date().toISOString()
        });
      }

      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchFournisseurAndData();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      imageURL: product.imageURL,
      categoryId: product.categoryId,
      stockQuantity: product.stockQuantity,
      isAvailable: product.isAvailable,
      discount: product.discount,
      unit: product.unit,
      tva: product.tva,
      prixHTVA: product.prixHTVA,
      feature: product.feature,
      tags: product.tags || []
    });
    setShowModal(true);
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        fetchFournisseurAndData();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageURL: '',
      categoryId: '',
      stockQuantity: '',
      isAvailable: true,
      discount: '0',
      unit: 'piece',
      tva: 19,
      prixHTVA: '',
      feature: false,
      tags: []
    });
    setTagInput('');
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const outOfStockProducts = products.filter(p => parseInt(p.stockQuantity) === 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!fournisseurId) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto h-24 w-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6">
          <ShoppingBagIcon className="h-12 w-12 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Create Your Supplier Profile First
        </h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          You need to set up your supplier profile before you can manage products.
        </p>
        <a
          href="/fournisseur"
          className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-2xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Go to Supplier Profile
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="mt-2 text-gray-600">Manage your product inventory</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-2xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Product
        </button>
      </div>

      {/* Out of Stock Alert */}
      {outOfStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800 font-medium">
              {outOfStockProducts.length} product(s) are out of stock and have been automatically disabled.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-64">
            <div className="relative">
              <FunnelIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto h-24 w-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6">
            <ShoppingBagIcon className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm || selectedCategory ? 'No Products Found' : 'No Products Yet'}
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {searchTerm || selectedCategory 
              ? 'Try adjusting your search or filter criteria.'
              : 'Create your first product to start selling.'
            }
          </p>
          {!searchTerm && !selectedCategory && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-2xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <PlusIcon className="h-6 w-6 mr-2" />
              Create First Product
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const isOutOfStock = parseInt(product.stockQuantity) === 0;
            const hasDiscount = parseFloat(product.discount) > 0;
            
            return (
              <div key={product.id} className={`bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${isOutOfStock ? 'opacity-75' : ''}`}>
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
                
                <div className="p-6">
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
                  
                  <div className="flex items-center justify-between mb-4">
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
                      onClick={() => handleEdit(product)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-red-200 text-sm font-medium rounded-xl text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter product name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.imageURL}
                  onChange={(e) => setFormData({...formData, imageURL: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter image URL"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price HT (TND)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={formData.prixHTVA}
                    onChange={(e) => setFormData({...formData, prixHTVA: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TVA (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.tva}
                    onChange={(e) => setFormData({...formData, tva: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="piece">Piece</option>
                    <option value="kg">Kilogram</option>
                    <option value="g">Gram</option>
                    <option value="l">Liter</option>
                    <option value="ml">Milliliter</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData({...formData, discount: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Price Preview */}
              {formData.prixHTVA && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Price Preview</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Price TTC:</span>
                      <p className="font-semibold">${calculatePrices(formData.prixHTVA, formData.tva, '0').prixTTC}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">After Discount:</span>
                      <p className="font-semibold text-green-600">${calculatePrices(formData.prixHTVA, formData.tva, formData.discount).prixAfterDiscount}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">You Save:</span>
                      <p className="font-semibold text-red-600">
                        ${(parseFloat(calculatePrices(formData.prixHTVA, formData.tva, '0').prixTTC) - 
                           parseFloat(calculatePrices(formData.prixHTVA, formData.tva, formData.discount).prixAfterDiscount)).toFixed(3)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tags Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Available</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.feature}
                    onChange={(e) => setFormData({...formData, feature: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured</span>
                </label>
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border border-gray-200 text-sm font-medium rounded-2xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 border border-transparent text-sm font-medium rounded-2xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;