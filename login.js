import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const loginBtn = document.getElementById("loginBtn");
const errorDiv = document.getElementById("error");

loginBtn.onclick = async () => {

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // BOŞ KONTROL
  if (!email || !password) {
    errorDiv.innerText = "Email ve şifre gir!";
    return;
  }

  try {

    await signInWithEmailAndPassword(auth, email, password);

    alert("Giriş başarılı ✅");

    // ADMIN'E GÖNDER
    window.location.href = "admin.html";

  } catch (error) {

    console.log(error);

    // HATA MESAJINI DÜZGÜN GÖSTER
    switch (error.code) {

      case "auth/user-not-found":
        errorDiv.innerText = "Kullanıcı bulunamadı";
        break;

      case "auth/wrong-password":
        errorDiv.innerText = "Şifre yanlış";
        break;

      case "auth/invalid-email":
        errorDiv.innerText = "Geçersiz email";
        break;

      default:
        errorDiv.innerText = "Giriş başarısız ❌";
    }

  }

};
