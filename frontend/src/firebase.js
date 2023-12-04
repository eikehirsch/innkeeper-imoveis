// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "innkeeper-7ebb9.firebaseapp.com",
  projectId: "innkeeper-7ebb9",
  storageBucket: "innkeeper-7ebb9.appspot.com",
  messagingSenderId: "665766431336",
  appId: "1:665766431336:web:eca6f12779fac6d8a2c9dd"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);