import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/config';
import { UserData } from '../models';

export class AuthService {
  static async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(auth, email, password);
  }

  static async signup(
    email: string, 
    password: string, 
    additionalData: Partial<UserData>
  ): Promise<void> {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    const newUserData: UserData = {
      uid: user.uid,
      email: user.email!,
      role: additionalData.role || 'supplier',
      fullName: additionalData.fullName || '',
      imageUrl: additionalData.imageUrl || '',
      address: additionalData.address || ''
    };

    await setDoc(doc(db, 'users', user.uid), {
      ...newUserData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  static async logout(): Promise<void> {
    await signOut(auth);
  }
}