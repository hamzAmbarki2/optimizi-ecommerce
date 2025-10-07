import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../config/config';
import { Fournisseur } from '../models';

export class FournisseurService {
  static async getFournisseurByOwnerId(ownerId: string): Promise<Fournisseur | null> {
    const fournisseurQuery = query(
      collection(db, 'Fournisseurs'),
      where('ownerId', '==', ownerId)
    );
    
    const snapshot = await getDocs(fournisseurQuery);
    
    if (!snapshot.empty) {
      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      } as Fournisseur;
    }
    
    return null;
  }

  static async createFournisseur(data: Omit<Fournisseur, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'Fournisseurs'), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return docRef.id;
  }

  static async updateFournisseur(id: string, data: Partial<Fournisseur>): Promise<void> {
    await updateDoc(doc(db, 'Fournisseurs', id), {
      ...data,
      updatedAt: new Date().toISOString()
    });
  }

  static async deleteFournisseur(id: string): Promise<void> {
    // Delete all related data first
    await this.deleteRelatedData(id);
    
    // Then delete the fournisseur
    await deleteDoc(doc(db, 'Fournisseurs', id));
  }

  private static async deleteRelatedData(fournisseurId: string): Promise<void> {
    // Delete products
    const productsQuery = query(collection(db, 'products'), where('FournisseurId', '==', fournisseurId));
    const productsSnapshot = await getDocs(productsQuery);
    for (const productDoc of productsSnapshot.docs) {
      await deleteDoc(doc(db, 'products', productDoc.id));
    }
    
    // Delete categories
    const categoriesQuery = query(collection(db, 'categories'), where('FournisseurId', '==', fournisseurId));
    const categoriesSnapshot = await getDocs(categoriesQuery);
    for (const categoryDoc of categoriesSnapshot.docs) {
      await deleteDoc(doc(db, 'categories', categoryDoc.id));
    }
    
    // Delete sub orders
    const ordersQuery = query(collection(db, 'subOrders'), where('fournisseurId', '==', fournisseurId));
    const ordersSnapshot = await getDocs(ordersQuery);
    for (const orderDoc of ordersSnapshot.docs) {
      await deleteDoc(doc(db, 'subOrders', orderDoc.id));
    }
  }
}