import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAofNbf7HRUHr3w6hnuUbQUfgAiLa1JkhU",
  authDomain: "excelly-lms-f3500.firebaseapp.com",
  projectId: "excelly-lms-f3500",
  storageBucket: "excelly-lms-f3500.firebasestorage.app",
  messagingSenderId: "623338077223",
  appId: "1:623338077223:web:b644460e7569d635332202",
  measurementId: "G-BPCD75360Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

export { app, auth };