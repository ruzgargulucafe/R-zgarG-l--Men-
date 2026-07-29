import { db } from "./firebase.js";

import {
collection,
getDocs,
addDoc,
updateDoc,
deleteDoc,
doc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const productList=document.getElementById("productList");
const searchProduct=document.getElementById("searchProduct");

const totalProducts=document.getElementById("totalProducts");
const activeProducts=document.getElementById("activeProducts");
const categoryCount=document.getElementById("categoryCount");
const orderCount=document.getElementById("orderCount");

let products=[];

async function loadProducts(){

const snapshot=await getDocs(collection(db,"products"));

products=[];

snapshot.forEach((d)=>{

products.push({
id:d.id,
...d.data()
});

});

updateDashboard();

renderProducts(products);

}

function updateDashboard(){

totalProducts.innerHTML=products.length;

activeProducts.innerHTML=
products.filter(x=>x.active).length;

categoryCount.innerHTML=
new Set(products.map(x=>x.category)).size;

}

function renderProducts(list){

productList.innerHTML="";

list.forEach((urun)=>{

productList.innerHTML+=`

<div class="col-lg-4">

<div class="card shadow h-100">

${urun.image?

`<img src="${urun.image}"
class="card-img-top"
style="height:220px;object-fit:cover;">`

:""}

<div class="card-body">

<h5>${urun.name}</h5>

<p class="text-muted">

${urun.description||""}

</p>

<h4>

₺${Number(urun.price).toLocaleString("tr-TR")}

</h4>

<span class="badge bg-primary">

${urun.category}

</span>

<hr>
