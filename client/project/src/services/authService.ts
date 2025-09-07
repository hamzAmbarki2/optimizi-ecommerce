import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config.js';
import { User } from '../types';

export const authService = {
  // Sign in with email and password
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Check if user has client role
        const userRole = userData.role || 'client';
        if (userRole !== 'client') {
          // Sign out the user immediately
          await signOut(auth);
          throw new Error('Accès non autorisé. Cette interface est réservée aux clients uniquement.');
        }
        
        return {
          id: firebaseUser.uid,
          fullName: userData.fullName || '',
          email: userData.email || firebaseUser.email || '',
          password: '', // Don't return password
          phone: userData.phone || '',
          cin: userData.cin || '',
          imageUrl: userData.imageUrl || '',
          status: userData.status || 'Active',
          role: userRole
        };
      } else {
        throw new Error('Données utilisateur non trouvées');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Échec de la connexion');
    }
  },

  // Sign up with email and password
  async signUp(userData: Omit<User, 'id' | 'status' | 'role'>): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const firebaseUser = userCredential.user;
      
      // Save user data to Firestore with client role
      const newUser: User = {
        id: firebaseUser.uid,
        fullName: userData.fullName,
        email: userData.email,
        password: '', // Don't store password in Firestore
        phone: userData.phone,
        cin: userData.cin,
        imageUrl: userData.imageUrl,
        status: 'Active',
        role: 'client' // Always set to client for this interface
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        cin: newUser.cin,
        imageUrl: newUser.imageUrl,
        status: newUser.status,
        role: newUser.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return newUser;
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Échec de la création du compte');
    }
  },

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Échec de la déconnexion');
    }
  },

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  // Get user data from Firestore
  async getUserData(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Check if user has client role
        const userRole = userData.role || 'client';
        if (userRole !== 'client') {
          console.warn('User with non-client role attempted to access client interface');
          return null;
        }
        
        return {
          id: uid,
          fullName: userData.fullName || '',
          email: userData.email || '',
          password: '', // Don't return password
          phone: userData.phone || '',
          cin: userData.cin || '',
          imageUrl: userData.imageUrl || '',
          status: userData.status || 'Active',
          role: userRole
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  },

  // Validate user role for client interface
  async validateClientAccess(uid: string): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userRole = userData.role || 'client';
        return userRole === 'client';
      }
      return false;
    } catch (error) {
      console.error('Error validating client access:', error);
      return false;
    }
  },

  // Change password with re-authentication
  async changePassword(email: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Utilisateur non connecté');

      const credential = EmailAuthProvider.credential(email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
    } catch (error: any) {
      console.error('Change password error:', error);
      throw new Error(error.message || 'Échec du changement de mot de passe');
    }
  }
};