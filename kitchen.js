import { db } from "./firebase.js";
import { collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const q=query(collection(db,"orders"),orderBy("createdAt","desc"));

onSnapshot(q,snap=>{
let html="";
snap.forEach(d=>{
const o=d.data();

if(o.status!=="Bekliyor") return;

html+=`<div>${o.table} - ${o.total}</div>`;
});
document.body.innerHTML=html;
});
