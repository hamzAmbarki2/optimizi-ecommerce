import React from 'react';
import { PencilIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { Category } from '../../models';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
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
            onClick={() => onEdit(category)}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-red-200 text-sm font-medium rounded-xl text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;