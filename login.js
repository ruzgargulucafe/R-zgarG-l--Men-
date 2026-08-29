import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

loginBtn.onclick = async ()=>{
  try{
    await signInWithEmailAndPassword(auth,email.value,password.value);
    location.href="admin.html";
  }catch(e){
    alert(e.message);
  }
};
