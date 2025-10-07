import { useState, useEffect } from 'react';
import { CategoryService } from '../services/categoryService';
import { Category } from '../models';

export const useCategories = (fournisseurId: string | null) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    if (!fournisseurId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const categoriesData = await CategoryService.getCategoriesByFournisseur(fournisseurId);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [fournisseurId]);

  const createCategory = async (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await CategoryService.createCategory(data);
      await fetchCategories(); // Refresh the list
    } catch (err) {
      console.error('Error creating category:', err);
      throw err;
    }
  };

  const updateCategory = async (id: string, data: Partial<Category>) => {
    try {
      await CategoryService.updateCategory(id, data);
      await fetchCategories(); // Refresh the list
    } catch (err) {
      console.error('Error updating category:', err);
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await CategoryService.deleteCategory(id);
      await fetchCategories(); // Refresh the list
    } catch (err) {
      console.error('Error deleting category:', err);
      throw err;
    }
  };

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
};