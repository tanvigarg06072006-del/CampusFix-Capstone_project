
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAbMfEH9mLvN--t5c9tupiMuSSEXcfdWW0",
  authDomain: "campusfix-b94a1.firebaseapp.com",
  projectId: "campusfix-b94a1",
  storageBucket: "campusfix-b94a1.firebasestorage.app",
  messagingSenderId: "726221711894",
  appId: "1:726221711894:web:ce7fd985d9c6d4c14d6337",
  measurementId: "G-6XPR3FX71E"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;
