import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBU1vvvBzxq8vvPf1KMO5PJlzZxYSIvNMk",
  authDomain: "flag-game-28a7a.firebaseapp.com",
  projectId: "flag-game-28a7a",
  storageBucket: "flag-game-28a7a.firebasestorage.app",
  messagingSenderId: "446919725267",
  appId: "1:446919725267:web:4f4e04a607d76f06f60426",
  measurementId: "G-19XFPNJNLM"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
