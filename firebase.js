import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import { getStorage } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-storage.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCj4F_8WOwLzVoREs-gRZDXfgYEkLtNvig",
  authDomain: "ruzgarguluqr.firebaseapp.com",
  projectId: "ruzgarguluqr",
  storageBucket: "ruzgarguluqr.firebasestorage.app",
  messagingSenderId: "1034312304751",
  appId: "1:1034312304751:web:3b0e15ba06a937455a659a"
};


// 🔥 APP BAŞLAT
const app = initializeApp(firebaseConfig);


// 🔥 SERVİSLER
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app); // ⚠️ EN KRİTİK SATIR


// 🔥 EXPORT (ÇOK ÖNEMLİ)
export { db, storage, auth };
