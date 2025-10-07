import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Category } from '../../models';
import { PREDEFINED_CATEGORIES } from '../../services/categoryService';

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdate: (id: string, data: Partial<Category>) => Promise<void>;
  category?: Category | null;
  fournisseurId: string;
}

const CategoryDialog: React.FC<CategoryDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  category,
  fournisseurId
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    isCustom: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        title: category.title,
        description: category.description,
        image: category.image,
        isCustom: !PREDEFINED_CATEGORIES.includes(category.title)
      });
    } else {
      resetForm();
    }
  }, [category]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      isCustom: false
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const categoryData = {
        title: formData.title,
        description: formData.description,
        image: formData.image,
        FournisseurId: fournisseurId
      };

      if (category) {
        await onUpdate(category.id, categoryData);
      } else {
        await onSave(categoryData);
      }

      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryName: string) => {
    setFormData({
      ...formData,
      title: categoryName,
      isCustom: false
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {category ? 'Edit Category' : 'Add New Category'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          {!category && (
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
              disabled={!formData.isCustom && !category}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              placeholder={formData.isCustom || category ? "Enter category name" : "Select from predefined categories above"}
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
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 text-sm font-medium rounded-2xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.title || loading}
              className="flex-1 px-6 py-3 border border-transparent text-sm font-medium rounded-2xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (category ? 'Update Category' : 'Add Category')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryDialog;