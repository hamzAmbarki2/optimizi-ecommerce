import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  deleteDoc, 
  addDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../config/config';
import { Category } from '../models';

export class CategoryService {
  static async getCategoriesByFournisseur(fournisseurId: string): Promise<Category[]> {
    const categoriesQuery = query(
      collection(db, 'categories'),
      where('FournisseurId', '==', fournisseurId)
    );
    const categoriesSnapshot = await getDocs(categoriesQuery);
    
    return categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Category[];
  }

  static async createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'categories'), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return docRef.id;
  }

  static async updateCategory(id: string, data: Partial<Category>): Promise<void> {
    await updateDoc(doc(db, 'categories', id), {
      ...data,
      updatedAt: new Date().toISOString()
    });
  }

  static async deleteCategory(id: string): Promise<void> {
    // Delete all products in this category first
    const productsQuery = query(collection(db, 'products'), where('categoryId', '==', id));
    const productsSnapshot = await getDocs(productsQuery);
    
    for (const productDoc of productsSnapshot.docs) {
      await deleteDoc(doc(db, 'products', productDoc.id));
    }

    // Then delete the category
    await deleteDoc(doc(db, 'categories', id));
  }
}

export const PREDEFINED_CATEGORIES = [
  'Protéines (Viandes/Volaille/Poisson)',
  'Produits Laitiers & Alternatives',
  'Fruits & Légumes Frais',
  'Épices & Herbes Aromatiques',
  'Féculents & Céréales',
  'Huiles & Vinaigres',
  'Produits de Boulangerie',
  'Sauces & Condiments',
  'Produits Surgelés',
  'Boissons & Vins',
  'Produits Exotiques',
  'Aliments Bio/Végétaliens',
  'Fruits de Mer & Crustacés',
  'Charcuterie & Fromages Affinés',
  'Pâtisserie & Chocolate',
  'Fleurs Comestibles',
  'Aromates & Infusions',
  'Levures & Agents de Fermentation'
];