import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyC5GFe23pkjn08q86V4uSBD_bTbIpV8FEI",
    authDomain: "optimizihaha.firebaseapp.com",
    projectId: "optimizihaha",
    storageBucket: "optimizihaha.firebasestorage.app",
    messagingSenderId: "421493955351",
    appId: "1:421493955351:web:76770b68464bc88dc1f552",
    measurementId: "G-VG7RHZ85Q4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);