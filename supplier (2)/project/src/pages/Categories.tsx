import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/config';
import { useAuth } from '../contexts/AuthContext';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

interface Category {
  id: string;
  title: string;
  description: string;
  image: string;
  FournisseurId: string;
  createdAt: string;
  updatedAt: string;
}

const PREDEFINED_CATEGORIES = [
  'Protéines (Viandes/Volaille/Poisson)',
  'Produits Laitiers & Alternatives',
  'Fruits & Légumes Frais',
  'Épices & Herbes Aromatiques',
  'Féculents & Céréales',
  'Huiles & Vinaigres',
  'Produits de Boulangerie',
  'Sauces & Condiments',
  'Produits Surgelés',
  'Boissons & Vins',
  'Produits Exotiques',
  'Aliments Bio/Végétaliens',
  'Fruits de Mer & Crustacés',
  'Charcuterie & Fromages Affinés',
  'Pâtisserie & Chocolate',
  'Fleurs Comestibles',
  'Aromates & Infusions',
  'Levures & Agents de Fermentation'
];

const Categories: React.FC = () => {
  const { userData } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [fournisseurId, setFournisseurId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    isCustom: false
  });

  useEffect(() => {
    fetchFournisseurAndCategories();
  }, [userData]);

  const fetchFournisseurAndCategories = async () => {
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

      // Then fetch categories for this fournisseur
      const categoriesQuery = query(
        collection(db, 'categories'),
        where('FournisseurId', '==', fournisseurIdValue)
      );
      const categoriesSnapshot = await getDocs(categoriesQuery);
      
      const categoriesData = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fournisseurId) {
      alert('Please create your supplier profile first');
      return;
    }

    try {
      const categoryData = {
        title: formData.title,
        description: formData.description,
        image: formData.image,
        FournisseurId: fournisseurId,
        updatedAt: new Date().toISOString()
      };

      if (editingCategory) {
        await updateDoc(doc(db, 'categories', editingCategory.id), categoryData);
      } else {
        await addDoc(collection(db, 'categories'), {
          ...categoryData,
          createdAt: new Date().toISOString()
        });
      }

      setShowModal(false);
      setEditingCategory(null);
      resetForm();
      fetchFournisseurAndCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      title: category.title,
      description: category.description,
      image: category.image,
      isCustom: !PREDEFINED_CATEGORIES.includes(category.title)
    });
    setShowModal(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category? This will also delete all products in this category.')) {
      try {
        // Delete all products in this category first
        const productsQuery = query(collection(db, 'products'), where('categoryId', '==', categoryId));
        const productsSnapshot = await getDocs(productsQuery);
        
        for (const productDoc of productsSnapshot.docs) {
          await deleteDoc(doc(db, 'products', productDoc.id));
        }

        // Then delete the category
        await deleteDoc(doc(db, 'categories', categoryId));
        fetchFournisseurAndCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      isCustom: false
    });
  };

  const handleCategorySelect = (categoryName: string) => {
    setFormData({
      ...formData,
      title: categoryName,
      isCustom: false
    });
  };

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
          <TagIcon className="h-12 w-12 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Create Your Supplier Profile First
        </h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          You need to set up your supplier profile before you can manage categories.
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
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="mt-2 text-gray-600">Organize your products into categories</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-2xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto h-24 w-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6">
            <TagIcon className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Categories Yet
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Create your first category to start organizing your products.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-2xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <PlusIcon className="h-6 w-6 mr-2" />
            Create First Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="relative h-48">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <PhotoIcon className="h-16 w-16 text-blue-600" />
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{category.description}</p>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-red-200 text-sm font-medium rounded-xl text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Selection */}
              {!editingCategory && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Choose Category Type
                  </label>
                  <div className="flex space-x-4 mb-6">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, isCustom: false, title: ''})}
                      className={`px-6 py-3 rounded-2xl border transition-colors ${
                        !formData.isCustom 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      Predefined Categories
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, isCustom: true, title: ''})}
                      className={`px-6 py-3 rounded-2xl border transition-colors ${
                        formData.isCustom 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      Custom Category
                    </button>
                  </div>

                  {!formData.isCustom && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select from Predefined Categories
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-2xl p-4">
                        {PREDEFINED_CATEGORIES.map((categoryName) => (
                          <button
                            key={categoryName}
                            type="button"
                            onClick={() => handleCategorySelect(categoryName)}
                            className={`text-left p-3 rounded-xl border transition-colors ${
                              formData.title === categoryName
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {categoryName}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  disabled={!formData.isCustom && !editingCategory}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder={formData.isCustom || editingCategory ? "Enter category name" : "Select from predefined categories above"}
                />
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
                  placeholder="Enter category description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter image URL"
                />
              </div>

              {formData.image && (
                <div className="mt-4">
                  <img
                    src={formData.image}
                    alt="Category preview"
                    className="w-full h-48 object-cover rounded-2xl"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCategory(null);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border border-gray-200 text-sm font-medium rounded-2xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.title}
                  className="flex-1 px-6 py-3 border border-transparent text-sm font-medium rounded-2xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;