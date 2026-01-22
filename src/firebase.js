import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBrkYmyvSd9kwG3yyV2uJroQaPdKuCGPZs",
    authDomain: "finance-dashboard-05062006.firebaseapp.com",
    projectId: "finance-dashboard-05062006",
    storageBucket: "finance-dashboard-05062006.firebasestorage.app",
    messagingSenderId: "364186341082",
    appId: "1:364186341082:web:a281ca054f89160e809fe3",
    measurementId: "G-VGERHL1GEC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
