import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config.js';

export interface Fournisseur {
  id: string;
  name: string;
  address: string;
  ownerId: string;
  image: string;
  matriculeFiscale: string;
  openingHours: string;
  useUserAddress: boolean;
  createdAt: string;
  updatedAt: string;
}

const COLLECTION_NAME = 'Fournisseurs';

export const fournisseurService = {
  // Get all fournisseurs
  async getFournisseurs(): Promise<Fournisseur[]> {
    try {
      const fournisseursRef = collection(db, COLLECTION_NAME);
      const querySnapshot = await getDocs(fournisseursRef);

      const fournisseurs: Fournisseur[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fournisseurs.push({
          id: doc.id,
          name: data.name || '',
          address: data.address || '',
          ownerId: data.ownerId || '',
          image: data.image || '',
          matriculeFiscale: data.matriculeFiscale || '',
          openingHours: data.openingHours || '',
          useUserAddress: Boolean(data.useUserAddress || false),
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        });
      });

      return fournisseurs;
    } catch (error) {
      console.error('Error fetching fournisseurs:', error);
      throw new Error('Failed to fetch fournisseurs');
    }
  },

  // Get fournisseur by ID
  async getFournisseurById(id: string): Promise<Fournisseur | null> {
    try {
      const fournisseurRef = doc(db, COLLECTION_NAME, id);
      const fournisseurSnap = await getDoc(fournisseurRef);

      if (fournisseurSnap.exists()) {
        const data = fournisseurSnap.data();
        return {
          id: fournisseurSnap.id,
          name: data.name || '',
          address: data.address || '',
          ownerId: data.ownerId || '',
          image: data.image || '',
          matriculeFiscale: data.matriculeFiscale || '',
          openingHours: data.openingHours || '',
          useUserAddress: Boolean(data.useUserAddress || false),
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching fournisseur:', error);
      throw new Error('Failed to fetch fournisseur');
    }
  }
};

