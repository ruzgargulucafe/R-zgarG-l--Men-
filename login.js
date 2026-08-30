// 🔥 FIREBASE
import { auth } from "./app.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 🔥 DOM
const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");

// 🔐 LOGIN
loginBtn.onclick = async () => {

  const mail = email.value.trim();
  const pass = password.value;

  if(!mail || !pass){
    alert("Email ve şifre gir");
    return;
  }

  try{

    const userCred = await signInWithEmailAndPassword(auth, mail, pass);

    // 🔒 ADMIN KONTROL
    if(userCred.user.email !== "caferuzgargulu@gmail.com"){
      alert("Yetkisiz kullanıcı");
      return;
    }

    alert("Giriş başarılı");
    location.href = "admin.html";

  }catch(e){
    alert("Hata: " + e.message);
  }

};
