"src/services/firebaseConfig.js"

/* =========================================================
   SMART RESUME BUILDER
   FIREBASE CONFIGURATION
   ---------------------------------------------------------
   Purpose:
   - Initialize Firebase
   - Provide Firebase Authentication
   - Keep Firebase configuration in one place
   - No API secret or private server key is stored here

   IMPORTANT:
   Replace the placeholder values below with the
   Firebase Web App configuration from Firebase Console.
   ========================================================= */

import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

/* =========================================================
   FIREBASE WEB APP CONFIGURATION
   ========================================================= */

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY || "",

  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",

  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || "",

  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",

  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",

  appId:
    import.meta.env.VITE_FIREBASE_APP_ID || "",
};

/* =========================================================
   CONFIGURATION VALIDATION
   ========================================================= */

const requiredFirebaseConfig = [
  "apiKey",
  "authDomain",
  "projectId",
  "appId",
];

const missingFirebaseConfig =
  requiredFirebaseConfig.filter(
    (key) => !firebaseConfig[key]
  );

if (missingFirebaseConfig.length > 0) {
  console.warn(
    "Firebase configuration is incomplete. Missing:",
    missingFirebaseConfig.join(", ")
  );
}

/* =========================================================
   INITIALIZE FIREBASE
   ========================================================= */

const app = initializeApp(
  firebaseConfig
);

/* =========================================================
   FIREBASE AUTHENTICATION
   ========================================================= */

export const auth = getAuth(app);

/* =========================================================
   AUTH PERSISTENCE
   ---------------------------------------------------------
   Keeps the authenticated user signed in across
   browser sessions.
   ========================================================= */

export const initializeAuthPersistence =
  async () => {
    try {
      await setPersistence(
        auth,
        browserLocalPersistence
      );

      return {
        success: true,
      };
    } catch (error) {
      console.error(
        "Firebase Auth Persistence Error:",
        error
      );

      return {
        success: false,
        error:
          error?.message ||
          "Unable to initialize authentication persistence.",
      };
    }
  };

/* =========================================================
   FIREBASE APP EXPORT
   ========================================================= */

export { app };

export default app;

