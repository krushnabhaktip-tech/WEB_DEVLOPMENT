// Firebase aur Firestore SDKs ko import kar rahe hain CDN ke throug
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Aapki unique Firebase config keys
const firebaseConfig = {
  apiKey: "AIzaSyCb13qgYuI6uAkg32_AWW38is_bYcKrrjg",
  authDomain: "mindful-buddy-94ddf.firebaseapp.com",
  projectId: "mindful-buddy-94ddf",
  storageBucket: "mindful-buddy-94ddf.firebasestorage.app",
  messagingSenderId: "1068762347777",
  appId: "1:1068762347787:web:bedfb3bfd19c06cb348a0e",
  measurementId: "G-YFHGPX419X"
};

// Firebase aur Firestore ko initialize kiya
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Database instance (db) ko export kiya taaki logic.js me use ho sake
export { db };