import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyDq8KkrcrVfJZioVtDvMYZvCBvgD04o3HY",
  authDomain: "beanbyte-5f098.firebaseapp.com",
  projectId: "beanbyte-5f098",
  storageBucket: "beanbyte-5f098.firebasestorage.app",
  messagingSenderId: "1081992947871",
  appId: "1:1081992947871:web:41e3fa7ebc924c4b855aaa",
  measurementId: "G-MGV07V506Y",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics
const analytics = getAnalytics(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firebase Realtime Database
const database = getDatabase(app);

// Initialize Firestore
const firestore = getFirestore(app);

// Initialize Firebase Storage
const storage = getStorage(app);

// Export Firebase services for use in other parts of the application
export { app, auth, database, firestore, storage };
