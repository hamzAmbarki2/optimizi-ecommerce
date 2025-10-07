import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../config.js';
import { Category } from '../types';

const COLLECTION_NAME = 'categories';

export const categoryService = {
  // Get all categories with dynamic product counts
  async getCategories(): Promise<Category[]> {
    try {
      const categoriesRef = collection(db, COLLECTION_NAME);
      const q = query(categoriesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const categories: Category[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        categories.push({
          id: doc.id,
          title: data.title || '',
          FournisseurId: data.FournisseurId || '',
          imgSrc: data.imgSrc || data.image|| '',
          subtitle: data.subtitle || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          productCount: 0 // Will be calculated dynamically
        });
      });

      // Calculate dynamic product counts
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          try {
            const productsRef = collection(db, 'products');
            // First try the composite query
            let productQuery;
            try {
              productQuery = query(
                productsRef,
                where('categoryId', '==', category.id),
                where('stockQuantity', '>', 0)
              );
              const productSnapshot = await getDocs(productQuery);
              return {
                ...category,
                productCount: productSnapshot.size
              };
            } catch {
              // If composite index doesn't exist, fall back to counting all products in category
              console.warn(`Composite index missing for category ${category.id}, falling back to basic query`);
              productQuery = query(
                productsRef,
                where('categoryId', '==', category.id)
              );
              const productSnapshot = await getDocs(productQuery);
              // Filter in memory for stockQuantity > 0
              const inStockProducts = productSnapshot.docs.filter(doc => {
                const data = doc.data();
                return (data.stockQuantity || 0) > 0;
              });
              return {
                ...category,
                productCount: inStockProducts.length
              };
            }
          } catch (error) {
            console.error(`Error counting products for category ${category.id}:`, error);
            return {
              ...category,
              productCount: 0
            };
          }
        })
      );
      
      return categoriesWithCounts;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  },

  // Get category by ID
  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const categoryRef = doc(db, COLLECTION_NAME, id);
      const categorySnap = await getDoc(categoryRef);
      
      if (categorySnap.exists()) {
        const data = categorySnap.data();
        return {
          id: categorySnap.id,
          title: data.title || '',
          FournisseurId: data.FournisseurId || '',
          imgSrc: data.imgSrc || data.image||'',
          subtitle: data.subtitle || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          productCount: data.productCount || 0
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw new Error('Failed to fetch category');
    }
  },

  // Add new category
  async addCategory(category: Omit<Category, 'id'>): Promise<string> {
    try {
      const categoryData = {
        ...category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), categoryData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding category:', error);
      throw new Error('Failed to add category');
    }
  },

  // Update category
  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    try {
      const categoryRef = doc(db, COLLECTION_NAME, id);
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(categoryRef, updateData);
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error('Failed to update category');
    }
  },

  // Delete category
  async deleteCategory(id: string): Promise<void> {
    try {
      const categoryRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(categoryRef);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error('Failed to delete category');
    }
  }
};