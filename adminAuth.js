import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 🔥 CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCj4F_8WOwLzVoREs-gRZDXfgYEkLtNvig",
  authDomain: "ruzgarguluqr.firebaseapp.com",
  projectId: "ruzgarguluqr"
};

// 🔥 INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔐 AUTH KONTROL
onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.href = "index.html"; // login sayfan
    return;
  }

  // 🔥 ADMIN KONTROL
  if (user.email !== "caferuzgargulu@gmail.com") {
    alert("Yetkisiz kullanıcı");
    window.location.href = "index.html";
  }

});
