import { db } from "./firebase.js";
const CLOUD_NAME = "hklqbgmd";
const UPLOAD_PRESET = "RuzgarGuluCafe";

import {
collection,
getDocs,
addDoc,
updateDoc,
deleteDoc,
doc,
query,
orderBy
}
from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/* ===========================
   DOM
=========================== */

const productList = document.getElementById("productList");
const searchInput = document.getElementById("searchProduct");

const totalProducts = document.getElementById("totalProducts");
const activeProducts = document.getElementById("activeProducts");
const categoryCount = document.getElementById("categoryCount");
const orderCount = document.getElementById("orderCount");

const modalElement = document.getElementById("productModal");
const modal = new bootstrap.Modal(modalElement);

const form = {
    name: document.getElementById("name"),
    description: document.getElementById("description"),
    price: document.getElementById("price"),
    category: document.getElementById("category"),
    vat: document.getElementById("vat"),
    imageFile: document.getElementById("imageFile"),
    previewImage: document.getElementById("previewImage")
};

const saveButton = document.getElementById("saveProduct");
const newButton = document.getElementById("newProduct");

/* ===========================
   GLOBAL
=========================== */

let products = [];
let editingId = null;
let uploadedImageUrl = "";
/* ===========================
   FOTOĞRAF ÖNİZLEME
=========================== */

form.imageFile.addEventListener("change", () => {

    const file = form.imageFile.files[0];

    if (!file) return;

    form.previewImage.src = URL.createObjectURL(file);

    form.previewImage.style.display = "block";

});
/* ===========================
   KATEGORİLERİ YÜKLE
=========================== */

async function loadCategories() {

    const snapshot = await getDocs(

        query(

            collection(db,"categories"),

            orderBy("order")

        )

    );

    form.category.innerHTML=`
        <option value="">
            Kategori Seçiniz
        </option>
    `;

    snapshot.forEach(item=>{

        const category=item.data();

        if(category.active){

            form.category.innerHTML+=`

            <option value="${category.name}">

                ${category.name}

            </option>

            `;

        }

    });

}
/* ===========================
   ÜRÜNLERİ YÜKLE
=========================== */

async function loadProducts() {

    try {

        const snapshot = await getDocs(collection(db, "products"));

        products = [];

        snapshot.forEach((item) => {

            products.push({
                id: item.id,
                ...item.data()
            });

        });

        updateDashboard();
        renderProducts(products);

    } catch (err) {

        console.error(err);
        alert("Ürünler yüklenemedi.");

    }

}

/* ===========================
   DASHBOARD
=========================== */

function updateDashboard() {

    totalProducts.textContent = products.length;

    activeProducts.textContent =
        products.filter(p => p.active).length;

    categoryCount.textContent =
        [...new Set(products.map(p => p.category))].length;

    // Şimdilik sipariş sayısı hazır değil
    orderCount.textContent = "-";

}

/* ===========================
   ARAMA
=========================== */

searchInput.addEventListener("input", () => {

    const value = searchInput.value
        .trim()
        .toLowerCase();

    if (value === "") {

        renderProducts(products);
        return;

    }

    const filtered = products.filter(product => {

        return (
            product.name.toLowerCase().includes(value) ||
            (product.category || "")
                .toLowerCase()
                .includes(value)
        );

    });

    renderProducts(filtered);

});
/* ===========================
   ÜRÜNLERİ GÖSTER
=========================== */

function renderProducts(list) {

    productList.innerHTML = "";

    if (list.length === 0) {

        productList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning text-center">
                    Ürün bulunamadı.
                </div>
            </div>
        `;

        return;
    }

    list.forEach(product => {

        const image = product.image && product.image.trim() !== ""
            ? product.image
            : "https://placehold.co/600x400?text=R%C3%BCzgar+G%C3%BCl%C3%BC";

        productList.innerHTML += `

        <div class="col-lg-4 col-md-6">

            <div class="card shadow-sm h-100">

                <img
                    src="${image}"
                    class="card-img-top"
                    alt="${product.name}">

                <div class="card-body d-flex flex-column">

                    <h5 class="fw-bold">
                        ${product.name}
                    </h5>

                    <p class="text-muted small flex-grow-1">
                        ${product.description || ""}
                    </p>

                    <span class="badge bg-primary mb-2">
                        ${product.category || "-"}
                    </span>

                    <h4 class="text-success mb-3">
                        ₺${Number(product.price).toLocaleString("tr-TR")}
                    </h4>

                    <div class="d-flex justify-content-between align-items-center mb-3">

                        <span class="badge ${
                            product.active
                                ? "bg-success"
                                : "bg-secondary"
                        }">

                            ${
                                product.active
                                    ? "Aktif"
                                    : "Pasif"
                            }

                        </span>

                        <div class="form-check form-switch">

                            <input
                                class="form-check-input toggleProduct"
                                type="checkbox"
                                data-id="${product.id}"
                                ${product.active ? "checked" : ""}>

                        </div>

                    </div>

                    <div class="d-grid gap-2">

                        <button
                            class="btn btn-warning editProduct"
                            data-id="${product.id}">

                            ✏️ Düzenle

                        </button>

                        <button
                            class="btn btn-danger deleteProduct"
                            data-id="${product.id}">

                            🗑️ Sil

                        </button>

                    </div>

                </div>

            </div>

        </div>

        `;

    });

    bindEvents();

}
/* ===========================
   EVENTLER
=========================== */

function bindEvents() {

    // Düzenle
    document.querySelectorAll(".editProduct").forEach(button => {

        button.addEventListener("click", () => {

            openEditModal(button.dataset.id);

        });

    });

    // Sil
    document.querySelectorAll(".deleteProduct").forEach(button => {

        button.addEventListener("click", () => {

            deleteProduct(button.dataset.id);

        });

    });

    // Aktif / Pasif
    document.querySelectorAll(".toggleProduct").forEach(button => {

        button.addEventListener("change", () => {

            toggleProduct(button.dataset.id);

        });

    });

}

/* ===========================
   CLOUDINARY YÜKLE
=========================== */

async function uploadImage(file){

    const formData = new FormData();

    formData.append("file", file);

    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(

        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,

        {
            method:"POST",
            body:formData
        }

    );

    const result = await response.json();

    if(!result.secure_url){

        throw new Error("Fotoğraf yüklenemedi.");

    }

    return result.secure_url;

}

/* ===========================
   FORMU TEMİZLE
=========================== */

function clearForm() {

    editingId = null;

    form.name.value = "";
    form.description.value = "";
    form.price.value = "";
    form.category.value = "";
    form.vat.value = "20";

    form.imageFile.value = "";

    form.previewImage.src = "";
    form.previewImage.style.display = "none";

    uploadedImageUrl = "";

}

/* ===========================
   MODAL AÇ
=========================== */

function openEditModal(id) {

    const product = products.find(p => p.id === id);

    if (!product) return;

    editingId = id;

    form.name.value = product.name || "";
    form.description.value = product.description || "";
    form.price.value = product.price || "";
    form.category.value = product.category || "";
    form.vat.value = product.vat || "20";
   
    uploadedImageUrl = product.image || "";

if (uploadedImageUrl) {

    form.previewImage.src = uploadedImageUrl;
    form.previewImage.style.display = "block";

} else {

    form.previewImage.src = "";
    form.previewImage.style.display = "none";

}

form.imageFile.value = "";

    modal.show();

}

/* ===========================
   YENİ ÜRÜN
=========================== */

newButton.addEventListener("click", () => {

    clearForm();

    modal.show();

});
/* ===========================
   ÜRÜN KAYDET
=========================== */

saveButton.addEventListener("click", saveProduct);

async function saveProduct() {

    let imageUrl = uploadedImageUrl;

if (form.imageFile.files.length > 0) {

    imageUrl = await uploadImage(form.imageFile.files[0]);

}

const data = {
    name: form.name.value.trim(),
    description: form.description.value.trim(),
    price: Number(form.price.value),
    category: form.category.value,
    vat: Number(form.vat.value),
    image: imageUrl,
    active: true
};

    if (data.name === "") {
        alert("Ürün adı giriniz.");
        return;
    }

    if (isNaN(data.price) || data.price <= 0) {
        alert("Geçerli fiyat giriniz.");
        return;
    }
   if (data.category === "") {
    alert("Kategori seçiniz.");
    return;
}
    try {

        if (editingId) {

            const eskiUrun = products.find(p => p.id === editingId);

            await updateDoc(
                doc(db, "products", editingId),
                {
                    ...data,
                    active: eskiUrun ? eskiUrun.active : true
                }
            );

            alert("Ürün güncellendi.");

        } else {

            await addDoc(
                collection(db, "products"),
                data
            );

            alert("Yeni ürün eklendi.");

        }

        modal.hide();

        clearForm();

        await loadProducts();

    } catch (err) {

        console.error(err);

        alert("Kayıt sırasında hata oluştu.");

    }

}

/* ===========================
   ÜRÜN SİL
=========================== */

async function deleteProduct(id) {

    if (!confirm("Bu ürünü silmek istiyor musunuz?"))
        return;

    try {

        await deleteDoc(doc(db, "products", id));

        await loadProducts();

    } catch (err) {

        console.error(err);

        alert("Silme işlemi başarısız.");

    }

}

/* ===========================
   AKTİF / PASİF
=========================== */

async function toggleProduct(id) {

    const product = products.find(p => p.id === id);

    if (!product) return;

    try {

        await updateDoc(
            doc(db, "products", id),
            {
                active: !product.active
            }
        );

        await loadProducts();

    } catch (err) {

        console.error(err);

        alert("Durum değiştirilemedi.");

    }

}

/* ===========================
   BAŞLAT
=========================== */

async function init(){

    await loadCategories();

    await loadProducts();

}
init();
