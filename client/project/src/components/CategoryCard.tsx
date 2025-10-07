import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package } from 'lucide-react';
import { Category } from '../types';
import { useProductsByCategory } from '../hooks/useProducts';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const { products } = useProductsByCategory(category.id);
  const productCount = products.length;

  return (
    <Link to={`/category/${category.id}`} className="group cursor-pointer block">
      <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-soft p-6 rounded-soft-xl shadow-soft hover:shadow-soft-lg transform hover:-translate-y-2 transition-all duration-300 border border-white/50 dark:border-neutral-700/50 hover:border-primary-200 dark:hover:border-primary-800 overflow-hidden">
        <div className="relative mb-6 overflow-hidden rounded-soft-lg">
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={category.imgSrc}
              alt={category.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badge du nombre de produits */}
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-soft px-3 py-1 rounded-full shadow-soft">
            <div className="flex items-center gap-1.5">
              <Package className="w-3 h-3 text-primary-600" />
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                {productCount}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-neutral-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2">
              {category.title}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed">
              {category.subtitle}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {productCount} produit{productCount !== 1 ? 's' : ''}
            </span>
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-soft">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
