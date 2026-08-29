import { db, auth } from "./firebase.js";

import {
collection,
addDoc,
getDocs,
doc,
deleteDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import {
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

/* AUTH */
onAuthStateChanged(auth, user=>{
if(!user) location.href="login.html";
else start();
});

/* LOGOUT */
window.logout = async ()=>{
await signOut(auth);
location.href="login.html";
};

/* SAYFA */
window.show = (id)=>{
document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
document.getElementById(id).classList.add("active");
};

/* START */
function start(){
loadProducts();
loadCategories();
loadTables();
}

/* =========================
   KATEGORİ
========================= */

window.addCategory = async ()=>{
const name = document.getElementById("cName").value;

await addDoc(collection(db,"categories"),{
name,
active:true
});

loadCategories();
};

async function loadCategories(){
const snap = await getDocs(collection(db,"categories"));

let html="";
let options="";

snap.forEach(d=>{
const c=d.data();

html+=`<div>${c.name}</div>`;
options+=`<option>${c.name}</option>`;
});

document.getElementById("categoryList").innerHTML=html;
document.getElementById("pCategory").innerHTML=options;
}

/* =========================
   ÜRÜN
========================= */

window.addProduct = async ()=>{

const name=document.getElementById("pName").value;
const price=Number(document.getElementById("pPrice").value);
const description=document.getElementById("pDesc").value;
const kdv=Number(document.getElementById("pKdv").value);
const image=document.getElementById("pImage").value;
const category=document.getElementById("pCategory").value;

await addDoc(collection(db,"products"),{
name,
price,
description,
kdv,
image,
category,
active:true
});

loadProducts();
};

async function loadProducts(){
const snap = await getDocs(collection(db,"products"));

let html="";

snap.forEach(d=>{
const p=d.data();

html+=`
<div class="card p-2 mb-2">
${p.name} - ₺${p.price}
<br>${p.description || ""}
<br>KDV: %${p.kdv || 0}
<br><img src="${p.image}" width="80">
<button onclick="deleteProduct('${d.id}')">Sil</button>
</div>
`;
});

document.getElementById("productList").innerHTML=html;
}

window.deleteProduct = async(id)=>{
await deleteDoc(doc(db,"products",id));
loadProducts();
};

/* =========================
   MASA
========================= */

window.addTable = async ()=>{
const name=document.getElementById("tableName").value;

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
<a target="_blank" href="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qr}">QR</a>
<button onclick="deleteTable('${d.id}')">Sil</button>
</div>
`;
});

document.getElementById("tableList").innerHTML=html;
}

window.deleteTable = async(id)=>{
await deleteDoc(doc(db,"tables",id));
loadTables();
};
