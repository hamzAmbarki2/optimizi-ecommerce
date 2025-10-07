import { useState, useEffect } from 'react';
import { Product } from '../types';
import { productService } from '../services/productService';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedProducts = await productService.getProducts();
      setProducts(fetchedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      console.error('Error in useProducts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const refetch = () => {
    fetchProducts();
  };

  return {
    products,
    loading,
    error,
    refetch
  };
};

export const useFeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedProducts = await productService.getFeaturedProducts();
      setProducts(fetchedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch featured products');
      console.error('Error in useFeaturedProducts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const refetch = () => {
    fetchFeaturedProducts();
  };

  return {
    products,
    loading,
    error,
    refetch
  };
};

export const useProduct = (id: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const fetchedProduct = await productService.getProductById(id);
        setProduct(fetchedProduct);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
        console.error('Error in useProduct:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return {
    product,
    loading,
    error
  };
};

export const useProductsByCategory = (categoryId: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!categoryId) return;
      
      try {
        setLoading(true);
        setError(null);
        const fetchedProducts = await productService.getProductsByCategory(categoryId);
        setProducts(fetchedProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
        console.error('Error in useProductsByCategory:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  return {
    products,
    loading,
    error
  };
};