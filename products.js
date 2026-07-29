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
                        <div class="mt-3 d-flex justify-content-between align-items-center">

                            <span class="badge ${urun.active ? "bg-success" : "bg-secondary"}">
                                ${urun.active ? "🟢 Aktif" : "⚪ Pasif"}
                            </span>

                            <strong class="text-primary">
                                ₺${Number(urun.price).toLocaleString("tr-TR")}
                            </strong>

                        </div>

                        <div class="d-grid gap-2 mt-3">

                            <button
                                class="btn btn-warning editProduct"
                                data-id="${urun.id}">
                                ✏️ Düzenle
                            </button>

                            <button
                                class="btn btn-danger deleteProduct"
                                data-id="${urun.id}">
                                🗑️ Sil
                            </button>

                        </div>

                    </div>

                </div>

            </div>

        `;

    });

    bindButtons();

}

function bindButtons(){

    document.querySelectorAll(".deleteProduct").forEach(btn=>{

        btn.onclick=()=>{

            const id=btn.dataset.id;

            deleteProduct(id);

        };

    });

    document.querySelectorAll(".editProduct").forEach(btn=>{

        btn.onclick=()=>{

            const id=btn.dataset.id;

            openEditModal(id);

        };

    });

}

searchProduct.addEventListener("input",()=>{

    const text=searchProduct.value.toLowerCase();

    const sonuc=products.filter(x=>

        x.name.toLowerCase().includes(text) ||

        (x.category||"").toLowerCase().includes(text)

    );

    renderProducts(sonuc);

});
// =========================
// Ürün Sil
// =========================

async function deleteProduct(id){

    if(!confirm("Bu ürünü silmek istediğinize emin misiniz?")){
        return;
    }

    try{

        await deleteDoc(doc(db,"products",id));

        products=products.filter(x=>x.id!==id);

        updateDashboard();

        renderProducts(products);

        alert("Ürün silindi.");

    }catch(err){

        console.error(err);

        alert(err.message);

    }

}

// =========================
// Düzenleme
// =========================

let editingId=null;

function openEditModal(id){

    editingId=id;

    const urun=products.find(x=>x.id===id);

    if(!urun){
        return;
    }

    document.getElementById("name").value=urun.name||"";
    document.getElementById("description").value=urun.description||"";
    document.getElementById("price").value=urun.price||"";
    document.getElementById("category").value=urun.category||"";
    document.getElementById("image").value=urun.image||"";

    const modal=new bootstrap.Modal(
        document.getElementById("productModal")
    );

    modal.show();

}

// =========================
// Yeni Ürün Butonu
// =========================

document
.getElementById("newProduct")
.addEventListener("click",()=>{

    editingId=null;

    document.getElementById("name").value="";
    document.getElementById("description").value="";
    document.getElementById("price").value="";
    document.getElementById("category").value="";
    document.getElementById("image").value="";

    const modal=new bootstrap.Modal(
        document.getElementById("productModal")
    );

    modal.show();

});
// =========================
// Ürün Kaydet
// =========================

document
.getElementById("saveProduct")
.addEventListener("click", async ()=>{

    const name=document.getElementById("name").value.trim();
    const description=document.getElementById("description").value.trim();
    const price=Number(document.getElementById("price").value);
    const category=document.getElementById("category").value.trim();
    const image=document.getElementById("image").value.trim();

    if(name===""){

        alert("Ürün adı boş olamaz.");

        return;

    }

    if(price<=0){

        alert("Geçerli fiyat giriniz.");

        return;

    }

    const data={

        name,
        description,
        price,
        category,
        image,
        active:true

    };

    try{

        if(editingId){

            await updateDoc(
                doc(db,"products",editingId),
                data
            );

            alert("Ürün güncellendi.");

        }else{

            await addDoc(
                collection(db,"products"),
                data
            );

            alert("Yeni ürün eklendi.");

        }

        bootstrap.Modal
        .getInstance(
            document.getElementById("productModal")
        )
        .hide();

        await loadProducts();

    }catch(err){

        console.error(err);

        alert(err.message);

    }

});
