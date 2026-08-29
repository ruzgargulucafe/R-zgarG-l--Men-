import { db, auth } from "./firebase.js";

import {
collection,
addDoc,
getDocs,
onSnapshot,
query,
orderBy,
doc,
updateDoc,
deleteDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import {
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

/* AUTH */
onAuthStateChanged(auth, user=>{
if(!user){
location.href="login.html";
}else{
start();
}
});

/* LOGOUT */
window.logout = ()=>{
signOut(auth);
};

/* BAŞLAT */
function start(){
watchOrders();
loadProducts();
loadTables();
loadFinance();
loadDebts();
}

/* =========================
   SİPARİŞ
========================= */

function watchOrders(){
const q=query(collection(db,"orders"),orderBy("createdAt","desc"));

onSnapshot(q,snap=>{
let html="";

snap.forEach(d=>{
const o=d.data();

html+=`
<div class="card p-3">
<h5>${o.table}</h5>
<p>₺${o.total}</p>
<button onclick="updateStatus('${d.id}','Hazırlanıyor')" class="btn btn-warning">Hazırla</button>
<button onclick="updateStatus('${d.id}','Teslim Edildi')" class="btn btn-success">Teslim</button>
</div>
`;
});

document.getElementById("ordersList").innerHTML=html;
});
}

window.updateStatus=async(id,status)=>{
await updateDoc(doc(db,"orders",id),{status});
};

/* =========================
   ÜRÜN
========================= */

window.addProduct=async()=>{
const name=document.getElementById("pName").value;
const price=Number(document.getElementById("pPrice").value);

await addDoc(collection(db,"products"),{
name,price,active:true
});

loadProducts();
};

async function loadProducts(){
const snap=await getDocs(collection(db,"products"));

let html="";

snap.forEach(d=>{
const p=d.data();

html+=`
<div class="card p-2 d-flex justify-content-between">
${p.name} - ₺${p.price}
<button onclick="deleteProduct('${d.id}')" class="btn btn-danger btn-sm">Sil</button>
</div>
`;
});

document.getElementById("productList").innerHTML=html;
}

window.deleteProduct=async(id)=>{
await deleteDoc(doc(db,"products",id));
loadProducts();
};

/* =========================
   MASA
========================= */

window.addTable=async()=>{
const name=document.getElementById("tableName").value;

await addDoc(collection(db,"tables"),{name});

loadTables();
};

async function loadTables(){
const snap=await getDocs(collection(db,"tables"));

let html="";

snap.forEach(d=>{
const t=d.data();

const qrLink=`https://ruzgargulucafe.github.io/RuzgarGuluMenu/menu.html?table=${t.name}`;

html+=`
<div class="card p-2">
${t.name}
<br>
<a href="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrLink}" target="_blank">QR Gör</a>
<button onclick="deleteTable('${d.id}')" class="btn btn-danger btn-sm">Sil</button>
</div>
`;
});

document.getElementById("tableList").innerHTML=html;
}

window.deleteTable=async(id)=>{
await deleteDoc(doc(db,"tables",id));
loadTables();
};

/* =========================
   CİRO
========================= */

async function loadFinance(){

const snap=await getDocs(collection(db,"orders"));

let daily=0;
let monthly=0;

const today=new Date().toDateString();
const month=new Date().getMonth();

snap.forEach(d=>{
const o=d.data();
if(!o.createdAt)return;

const date=o.createdAt.toDate();

if(date.toDateString()===today){
daily+=o.total;
}

if(date.getMonth()===month){
monthly+=o.total;
}
});

document.getElementById("daily").innerText="₺"+daily;
document.getElementById("monthly").innerText="₺"+monthly;

}

/* =========================
   BORÇ
========================= */

window.addDebt=async()=>{
const name=document.getElementById("dName").value;
const amount=Number(document.getElementById("dAmount").value);
const date=document.getElementById("dDate").value;

await addDoc(collection(db,"debts"),{
name,amount,date
});

loadDebts();
};

async function loadDebts(){
const snap=await getDocs(collection(db,"debts"));

let html="";

snap.forEach(d=>{
const debt=d.data();

html+=`
<div class="card p-2">
${debt.name} - ₺${debt.amount}
<br>Vade: ${debt.date}
</div>
`;
});

document.getElementById("debtList").innerHTML=html;
}
