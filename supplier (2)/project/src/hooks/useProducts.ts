import { useState, useEffect } from 'react';
import { ProductService } from '../services/productService';
import { Product } from '../models';

export const useProducts = (fournisseurId: string | null) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    if (!fournisseurId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const productsData = await ProductService.getProductsByFournisseur(fournisseurId);
      setProducts(productsData);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fournisseurId]);

  const createProduct = async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await ProductService.createProduct(data);
      await fetchProducts(); // Refresh the list
    } catch (err) {
      console.error('Error creating product:', err);
      throw err;
    }
  };

  const updateProduct = async (id: string, data: Partial<Product>) => {
    try {
      await ProductService.updateProduct(id, data);
      await fetchProducts(); // Refresh the list
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await ProductService.deleteProduct(id);
      await fetchProducts(); // Refresh the list
    } catch (err) {
      console.error('Error deleting product:', err);
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  };
};