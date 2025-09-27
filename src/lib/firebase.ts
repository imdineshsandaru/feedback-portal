import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDw-ax1B5qykoPko2N4EGqogAE_4yQ-dkQ",
  authDomain: "feedback-genie.firebaseapp.com",
  projectId: "feedback-genie",
  storageBucket: "feedback-genie.firebasestorage.app",
  messagingSenderId: "142475203009",
  appId: "1:142475203009:web:f7e37533a1d43a5d8b1f40",
  measurementId: "G-D4YEN3K4F9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;