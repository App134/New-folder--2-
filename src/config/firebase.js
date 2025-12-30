import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

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

// Initialize Firestore (Required for Google Sheets Sync)
export const db = getFirestore(app);

// Initialize Analytics (Optional)
// Initialize Analytics (Optional)
export const analytics = getAnalytics(app);

import { getAuth } from "firebase/auth";
export const auth = getAuth(app);
