import { useState, useEffect } from 'react';
import { Category } from '../types';
import { categoryService } from '../services/categoryService';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedCategories = await categoryService.getCategories();
      setCategories(fetchedCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      console.error('Error in useCategories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const refetch = () => {
    fetchCategories();
  };

  return {
    categories,
    loading,
    error,
    refetch
  };
};

export const useCategory = (id: string) => {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const fetchedCategory = await categoryService.getCategoryById(id);
        setCategory(fetchedCategory);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch category');
        console.error('Error in useCategory:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  return {
    category,
    loading,
    error
  };
};