import React, { useState, useEffect } from 'react';
import { XMarkIcon, TagIcon } from '@heroicons/react/24/outline';
import { Product, Category } from '../../models';
import { ProductService } from '../../services/productService';

interface ProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdate: (id: string, data: Partial<Product>) => Promise<void>;
  product?: Product | null;
  categories: Category[];
  fournisseurId: string;
}

const ProductDialog: React.FC<ProductDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  product,
  categories,
  fournisseurId
}) => {
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
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
    } else {
      resetForm();
    }
  }, [product]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { prixTTC, prixAfterDiscount } = ProductService.calculatePrices(
        formData.prixHTVA, 
        formData.tva, 
        formData.discount
      );
      
      const stockQuantity = parseInt(formData.stockQuantity) || 0;
      const isAvailable = stockQuantity > 0 ? formData.isAvailable : false;

      const productData = {
        ...formData,
        prixTTC,
        prixAfterDiscount,
        isAvailable,
        FournisseurId: fournisseurId
      };

      if (product) {
        await onUpdate(product.id, productData);
      } else {
        await onSave(productData);
      }

      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
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
                  <p className="font-semibold">${ProductService.calculatePrices(formData.prixHTVA, formData.tva, '0').prixTTC}</p>
                </div>
                <div>
                  <span className="text-gray-600">After Discount:</span>
                  <p className="font-semibold text-green-600">${ProductService.calculatePrices(formData.prixHTVA, formData.tva, formData.discount).prixAfterDiscount}</p>
                </div>
                <div>
                  <span className="text-gray-600">You Save:</span>
                  <p className="font-semibold text-red-600">
                    ${(parseFloat(ProductService.calculatePrices(formData.prixHTVA, formData.tva, '0').prixTTC) - 
                       parseFloat(ProductService.calculatePrices(formData.prixHTVA, formData.tva, formData.discount).prixAfterDiscount)).toFixed(3)}
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
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 text-sm font-medium rounded-2xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 border border-transparent text-sm font-medium rounded-2xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductDialog;