// 🔥 FIREBASE IMPORT
import { initializeApp, getApps, getApp } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getFirestore } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { getAuth } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 🔥 CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCj4F_8WOwLzVoREs-gRZDXfgYEkLtNvig",
  authDomain: "ruzgarguluqr.firebaseapp.com",
  projectId: "ruzgarguluqr"
};

// 🔥 INIT (TEK SEFER GARANTİ)
const app = !getApps().length 
  ? initializeApp(firebaseConfig) 
  : getApp();

// 🔥 SERVİSLER
const db = getFirestore(app);
const auth = getAuth(app);

// 🔥 GLOBAL (çok önemli)
window.db = db;
window.auth = auth;

// 🔥 EXPORT
export { db, auth };
