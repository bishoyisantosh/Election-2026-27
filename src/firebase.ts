import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXZbE7-Clzm6XemUtw9JrdjuDFu7smZ-w",
  authDomain: "election-2026-27.firebaseapp.com",
  projectId: "election-2026-27",
  storageBucket: "election-2026-27.firebasestorage.app",
  messagingSenderId: "147088108369",
  appId: "1:147088108369:web:e6932cf0d7f273f4628170",
  measurementId: "G-RCF645JP43"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore
export const db = getFirestore(app);
