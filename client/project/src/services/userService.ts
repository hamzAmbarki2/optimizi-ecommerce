import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config.js';

export interface DeliveryAddress {
  street: string;
  address2?: string;
  city: string;
  state?: string; // Tunisia governorate
  postalCode: string;
  country: string;
  instructions?: string;
}

export const userService = {
  // Save delivery address for user
  async saveDeliveryAddress(userId: string, address: DeliveryAddress): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        deliveryAddress: address,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving delivery address:', error);
      throw new Error('Failed to save delivery address');
    }
  },

  // Get delivery address for user
  async getDeliveryAddress(userId: string): Promise<DeliveryAddress | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.deliveryAddress || null;
      }
      return null;
    } catch (error) {
      console.error('Error fetching delivery address:', error);
      return null;
    }
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<any>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update profile');
    }
  }
};