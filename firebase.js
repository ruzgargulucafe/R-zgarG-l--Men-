import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

document.getElementById("loginBtn").onclick = async () => {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Email ve şifre gir!");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);

    alert("Giriş başarılı ✅");
    window.location.href = "admin.html";

  } catch (error) {
    console.log(error);
    alert(error.code); // 👈 NET hata gör
  }

};
