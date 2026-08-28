import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "BURAYA_API_KEY",
  authDomain: "BURAYA_AUTH_DOMAIN",
  projectId: "BURAYA_PROJECT_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loginBtn = document.getElementById("loginBtn");

loginBtn.onclick = async () => {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);

    alert("Giriş başarılı ✅");

    window.location.href = "admin.html";

  } catch (error) {
    document.getElementById("error").innerText = "Hatalı giriş ❌";
  }

};
