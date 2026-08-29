import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const auth = getAuth();

onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.href = "login.html";
  }

});
