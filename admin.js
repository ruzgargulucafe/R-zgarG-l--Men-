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

/* =========================
   AUTH
========================= */

onAuthStateChanged(auth, user=>{
if(!user){
location.href="login.html";
}else{
start();
}
});

/* =========================
   LOGOUT
========================= */

window.logout = async ()=>{
await signOut(auth);
location.href="login.html";
};

/* =========================
   SAYFA GEÇİŞ
========================= */

window.show = (id)=>{
document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));

const el = document.getElementById(id);
if(el){
el.classList.add("active");
}
};

/* =========================
   BAŞLAT
========================= */

function start(){
watchOrders();
loadProducts();
loadCategories();
loadTables();
loadFinance();
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
<div class="card p-3 mb-2">
<h5>${o.table}</h5>
<p>₺${o.total}</p>

<button onclick="updateStatus('${d.id}','Hazırlanıyor')" class="btn btn-warning btn-sm">
Hazırla
</button>

<button onclick="updateStatus('${d.id}','Teslim Edildi')" class="btn btn-success btn-sm">
Teslim
</button>

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

if(!name || !price){
alert("Ürün adı ve fiyat gir!");
return;
}

await addDoc(collection(db,"products"),{
name,
price,
active:true
});

loadProducts();
};

async function loadProducts(){

const snap=await getDocs(collection(db,"products"));

let html="";

snap.forEach(d=>{
const p=d.data();

html+=`
<div class="card p-2 d-flex justify-content-between mb-2">
${p.name} - ₺${p.price}

<button onclick="deleteProduct('${d.id}')" class="btn btn-danger btn-sm">
Sil
</button>

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
   KATEGORİ
========================= */

window.addCategory=async()=>{

const name=document.getElementById("cName").value;

if(!name){
alert("Kategori adı gir!");
return;
}

await addDoc(collection(db,"categories"),{
name,
active:true,
order:Date.now()
});

loadCategories();
};

async function loadCategories(){

const snap=await getDocs(collection(db,"categories"));

let html="";

snap.forEach(d=>{
const c=d.data();

html+=`
<div class="card p-2 mb-2">
${c.name}
</div>
`;
});

document.getElementById("categoryList").innerHTML=html;
}

/* =========================
   MASA
========================= */

window.addTable=async()=>{

const name=document.getElementById("tableName").value;

if(!name){
alert("Masa adı gir!");
return;
}

await addDoc(collection(db,"tables"),{name});

loadTables();
};

async function loadTables(){

const snap=await getDocs(collection(db,"tables"));

let html="";

snap.forEach(d=>{
const t=d.data();

const qr=`https://ruzgargulucafe.github.io/RuzgarGuluMenu/menu.html?table=${t.name}`;

html+=`
<div class="card p-2 mb-2">

${t.name}

<br>

<a target="_blank"
href="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qr}">
QR
</a>

<button onclick="deleteTable('${d.id}')" class="btn btn-danger btn-sm">
Sil
</button>

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
   BUTON FIX (KRİTİK)
========================= */

window.addEventListener("DOMContentLoaded", () => {

const btnOrders = document.getElementById("btnOrders");
const btnProducts = document.getElementById("btnProducts");
const btnCategories = document.getElementById("btnCategories");
const btnTables = document.getElementById("btnTables");
const btnFinance = document.getElementById("btnFinance");

if(btnOrders) btnOrders.onclick = () => show("orders");
if(btnProducts) btnProducts.onclick = () => show("products");
if(btnCategories) btnCategories.onclick = () => show("categories");
if(btnTables) btnTables.onclick = () => show("tables");
if(btnFinance) btnFinance.onclick = () => show("finance");

});
