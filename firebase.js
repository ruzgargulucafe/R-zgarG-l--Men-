// Firebase importları (CDN üzerinden)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase config (SENİN VERDİĞİN DOĞRU)
const firebaseConfig = {
  apiKey: "AIzaSyCj4F_8WOwLzVoREs-gRZDXfgYEkLtNvig",
  authDomain: "ruzgarguluqr.firebaseapp.com",
  projectId: "ruzgarguluqr",
  storageBucket: "ruzgarguluqr.firebasestorage.app",
  messagingSenderId: "1034312304751",
  appId: "1:1034312304751:web:3b0e15ba06a937455a659a"
};

// Firebase başlat
const app = initializeApp(firebaseConfig);

// Servisleri al
const db = getFirestore(app);
const auth = getAuth(app);

// Dışarı aktar (EN ÖNEMLİ KISIM)
export { db, auth };
