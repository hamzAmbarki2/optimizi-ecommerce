import {
  collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, where, writeBatch
} from 'firebase/firestore';
import { db } from '../config.js';
import { Product } from '../types';
import { fournisseurService } from './fournisseurService';

const COLLECTION_NAME = 'products';

// Helper function to enrich products with fournisseur names
async function enrichProductsWithFournisseurNames(products: Product[]): Promise<Product[]> {
  try {
    const fournisseurIds = [...new Set(products.map(p => p.FournisseurId).filter(Boolean))];
    const fournisseurs = await fournisseurService.getFournisseurs();
    const fournisseurMap = new Map(fournisseurs.map(f => [f.id, f.name]));

    return products.map(product => ({
      ...product,
      fournisseurName: fournisseurMap.get(product.FournisseurId) || 'Fournisseur inconnu'
    }));
  } catch (error) {
    console.error('Error enriching products with fournisseur names:', error);
    return products.map(product => ({
      ...product,
      fournisseurName: 'Fournisseur inconnu'
    }));
  }
}

export const productService = {
  // Get all products
  async getProducts(): Promise<Product[]> {
    try {
      const productsRef = collection(db, COLLECTION_NAME);
      const querySnapshot = await getDocs(productsRef);

      const products: Product[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const stockQuantity = Number(data.stockQuantity || 0); // ✅ force number

        products.push({
          id: docSnap.id,
          name: data.name || data.title || data.productName || '',
          title: data.title || '',
          prixHTVA: Number(data.prixHTVA || 0),
          tva: Number(data.tva || 0),
          Tags: Array.isArray(data.Tags) ? data.Tags : [],
          prixTTC: Number(data.prixTTC || 0),
          categoryId: data.categoryId || '',
          FournisseurId: data.FournisseurId || '',
          imageURL: data.imageURL || '',
          description: data.description || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          stockQuantity, // ✅ number
          discount: Number(data.discount || 0),
          unit: data.unit || 'piece',
          review: Array.isArray(data.review) ? data.review : [],
          rating: Number(data.rating || 0),
          feature: Boolean(data.feature || false)
        });
      });

      const inStockProducts = products.filter(p => p.stockQuantity > 0);
      return await enrichProductsWithFournisseurNames(inStockProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  },

  // Get products by category
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    try {
      const productsRef = collection(db, COLLECTION_NAME);
      const q = query(productsRef, where('categoryId', '==', categoryId));
      const querySnapshot = await getDocs(q);

      const products: Product[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const stockQuantity = Number(data.stockQuantity || 0);

        products.push({
          id: docSnap.id,
          name: data.name || data.title || data.productName || '',
          title: data.title || '',
          prixHTVA: Number(data.prixHTVA || 0),
          tva: Number(data.tva || 0),
          Tags: Array.isArray(data.Tags) ? data.Tags : [],
          prixTTC: Number(data.prixTTC || 0),
          categoryId: data.categoryId || '',
          FournisseurId: data.FournisseurId || '',
          imageURL: data.imageURL || '',
          description: data.description || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          stockQuantity,
          discount: Number(data.discount || 0),
          unit: data.unit || 'piece',
          review: Array.isArray(data.review) ? data.review : [],
          rating: Number(data.rating || 0),
          feature: Boolean(data.feature || false)
        });
      });

      const inStockProducts = products.filter(p => p.stockQuantity > 0);
      return await enrichProductsWithFournisseurNames(inStockProducts);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw new Error('Failed to fetch products by category');
    }
  },

  // Get product by ID
  async getProductById(id: string): Promise<Product | null> {
    try {
      const productRef = doc(db, COLLECTION_NAME, id);
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        const data = productSnap.data();
        const stockQuantity = Number(data.stockQuantity || 0);

        const product: Product = {
          id: productSnap.id,
          name: data.name || data.title || data.productName || '',
          title: data.title || '',
          prixHTVA: Number(data.prixHTVA || 0),
          tva: Number(data.tva || 0),
          Tags: Array.isArray(data.Tags) ? data.Tags : [],
          prixTTC: Number(data.prixTTC || 0),
          categoryId: data.categoryId || '',
          FournisseurId: data.FournisseurId || '',
          imageURL: data.imageURL || '',
          description: data.description || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          stockQuantity,
          discount: Number(data.discount || 0),
          unit: data.unit || 'piece',
          review: Array.isArray(data.review) ? data.review : [],
          rating: Number(data.rating || 0),
          feature: Boolean(data.feature || false)
        };

        const enrichedProducts = await enrichProductsWithFournisseurNames([product]);
        return enrichedProducts[0];
      }

      return null;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw new Error('Failed to fetch product');
    }
  },

  // Get featured products
  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const productsRef = collection(db, COLLECTION_NAME);
      const q = query(productsRef, where('feature', '==', true));
      const querySnapshot = await getDocs(q);

      const products: Product[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const stockQuantity = Number(data.stockQuantity || 0);

        products.push({
          id: docSnap.id,
          name: data.name || data.title || data.productName || '',
          title: data.title || '',
          prixHTVA: Number(data.prixHTVA || 0),
          tva: Number(data.tva || 0),
          Tags: Array.isArray(data.Tags) ? data.Tags : [],
          prixTTC: Number(data.prixTTC || 0),
          categoryId: data.categoryId || '',
          FournisseurId: data.FournisseurId || '',
          imageURL: data.imageURL || '',
          description: data.description || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          stockQuantity,
          discount: Number(data.discount || 0),
          unit: data.unit || 'piece',
          review: Array.isArray(data.review) ? data.review : [],
          rating: Number(data.rating || 0),
          feature: Boolean(data.feature || false)
        });
      });

      const inStockProducts = products.filter(p => p.stockQuantity > 0);
      return await enrichProductsWithFournisseurNames(inStockProducts);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw new Error('Failed to fetch featured products');
    }
  },

  // Decrement single product
  async decrementProductStock(productId: string, quantity: number): Promise<boolean> {
    try {
      const productRef = doc(db, COLLECTION_NAME, productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        console.error(`❌ [Stock] Product ${productId} not found`);
        return false;
      }

      const productData = productSnap.data() as Product;
      const currentStock = Number(productData.stockQuantity) || 0; // ✅

      if (currentStock < quantity) {
        console.error(`❌ [Stock] Insufficient stock. Current: ${currentStock}, Requested: ${quantity}`);
        return false;
      }

      const newStock = currentStock - quantity;

      await updateDoc(productRef, {
        stockQuantity: newStock, // ✅ toujours un number
        updatedAt: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error(`❌ [Stock] Error decrementing stock:`, error);
      return false;
    }
  },

// Extrait de productService.ts
  async decrementMultipleProductsStock(items: Array<{productId: string, quantity: number}>): Promise<{success: boolean, errors: string[]}> {
    const batch = writeBatch(db);
    const errors: string[] = [];

    try {
      const productChecks = await Promise.all(
          items.map(async (item) => {
            const productRef = doc(db, COLLECTION_NAME, item.productId);
            const productSnap = await getDoc(productRef);

            if (!productSnap.exists()) {
              errors.push(`Product ${item.productId} not found`);
              return null;
            }

            const productData = productSnap.data() as Product;
            const currentStock = Number(productData.stockQuantity) || 0; // ✅

            if (currentStock < item.quantity) {
              errors.push(`Insufficient stock for ${item.productId}`);
              return null;
            }

            return {
              ref: productRef,
              newStock: currentStock - item.quantity,
              productId: item.productId
            };
          })
      );

      if (errors.length > 0) return { success: false, errors };

      productChecks.forEach((check) => {
        if (check) {
          batch.update(check.ref, {
            stockQuantity: check.newStock, // ✅ number
            updatedAt: new Date().toISOString()
          });
        }
      });

      await batch.commit();
      return { success: true, errors: [] };
    } catch (error) {
      console.error(`❌ [Stock] Error batch decrement:`, error);
      return { success: false, errors: [error.message] };
    }
  }
};
