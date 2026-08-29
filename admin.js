import { db, auth, storage } from "./firebase.js";

import {
collection, addDoc, getDocs, doc, deleteDoc,
onSnapshot, query, orderBy, updateDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-storage.js";

/* AUTH */
onAuthStateChanged(auth,u=>{
if(!u) location.href="login.html";
else start();
});

/* LOGOUT */
window.logout=()=>signOut(auth);

/* NAV */
window.show=id=>{
document.querySelectorAll(".section").forEach(s=>s.style.display="none");
document.getElementById(id).style.display="block";
};

/* START */
function start(){
show("products");
loadProducts();
loadCategories();
loadTables();
watchOrders();
}

/* ÜRÜN EKLE */
addProductBtn.onclick=async()=>{
let url="";
if(pImage.files[0]){
const r=ref(storage,"products/"+Date.now());
await uploadBytes(r,pImage.files[0]);
url=await getDownloadURL(r);
}

await addDoc(collection(db,"products"),{
name:pName.value,
price:Number(pPrice.value),
category:pCategory.value,
vat:Number(pKdv.value),
image:url,
active:true
});

loadProducts();
};

/* ÜRÜN LİSTE */
async function loadProducts(){
const snap=await getDocs(collection(db,"products"));
let html="";
snap.forEach(d=>{
const p=d.data();
html+=`<div>${p.name} ₺${p.price}</div>`;
});
productList.innerHTML=html;
}

/* KATEGORİ */
addCategoryBtn.onclick=async()=>{
await addDoc(collection(db,"categories"),{
name:cName.value,
active:true
});
loadCategories();
};

async function loadCategories(){
const snap=await getDocs(collection(db,"categories"));
let html="";
snap.forEach(d=>{
html+=`<div>${d.data().name}</div>`;
});
categoryList.innerHTML=html;
}

/* MASA */
addTableBtn.onclick=async()=>{
await addDoc(collection(db,"tables"),{
name:tableName.value
});
loadTables();
};

async function loadTables(){
const snap=await getDocs(collection(db,"tables"));
let html="";
snap.forEach(d=>{
const t=d.data();
const qr=`menu.html?table=${t.name}`;
html+=`<div>${t.name} <a href="https://api.qrserver.com/v1/create-qr-code/?data=${qr}" target="_blank">QR</a></div>`;
});
tableList.innerHTML=html;
}

/* SİPARİŞ */
function watchOrders(){
const q=query(collection(db,"orders"),orderBy("createdAt","desc"));

onSnapshot(q,snap=>{
let html="";
snap.forEach(d=>{
const o=d.data();
html+=`
<div>
${o.table} ₺${o.total}
<button onclick="updateStatus('${d.id}','Hazır')">Hazır</button>
<button onclick="updateStatus('${d.id}','Teslim')">Teslim</button>
</div>
`;
});
ordersList.innerHTML=html;
});
}

window.updateStatus=async(id,s)=>{
await updateDoc(doc(db,"orders",id),{status:s});
};
