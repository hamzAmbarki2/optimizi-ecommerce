import {
  collection, doc,
  addDoc, updateDoc, getDoc, writeBatch
} from 'firebase/firestore';
import { db } from '../config/config.js';
import { Product } from '../models';

export class ProductService {
  static async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'products'), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      review: [],
      stockQuantity: Number(data.stockQuantity || 0) // ✅ force number
    });
    return docRef.id;
  }

  static async decrementProductStock(productId: string, quantity: number): Promise<boolean> {
    try {
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) return false;

      const productData = productSnap.data() as Product;
      const currentStock = Number(productData.stockQuantity) || 0; // ✅

      if (currentStock < quantity) return false;

      const newStock = currentStock - quantity;

      await updateDoc(productRef, {
        stockQuantity: newStock, // ✅ number only
        updatedAt: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('❌ Error decrementing stock:', error);
      return false;
    }
  }

  static async decrementMultipleProductsStock(items: Array<{productId: string, quantity: number}>): Promise<{success: boolean, errors: string[]}> {
    const batch = writeBatch(db);
    const errors: string[] = [];

    try {
      const productChecks = await Promise.all(
          items.map(async (item) => {
            const productRef = doc(db, 'products', item.productId);
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
              newStock: currentStock - item.quantity
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
      console.error('❌ Batch error:', error);
      return { success: false, errors: [error.message] };
    }
  }
}
