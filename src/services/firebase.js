import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyDJARKq-wXYBo9yVLcOhPBoisdPS8GBVCA",
  authDomain: "smart-resume-builder-1a234.firebaseapp.com",
  projectId: "smart-resume-builder-1a234",
  storageBucket: "smart-resume-builder-1a234.firebasestorage.app",
  messagingSenderId: "127549650464",
  appId: "1:127549650464:web:3345e76995ad02cad6ee45",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;