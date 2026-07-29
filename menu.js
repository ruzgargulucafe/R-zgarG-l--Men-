import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const menuContainer = document.getElementById("menuContainer");

let categories = [];
let products = [];

/* ===========================
   KATEGORİLERİ YÜKLE
=========================== */

async function loadCategories() {

    const snapshot = await getDocs(
        query(
            collection(db, "categories"),
            orderBy("order")
        )
    );

    categories = [];

    snapshot.forEach(item => {
        categories.push(item.data());
    });

}

/* ===========================
   ÜRÜNLERİ YÜKLE
=========================== */

async function loadProducts() {

    const snapshot = await getDocs(
        collection(db, "products")
    );

    products = [];

    snapshot.forEach(item => {

        const product = item.data();

        if (product.active) {
            products.push(product);
        }

    });

}

/* ===========================
   MENÜYÜ GÖSTER
=========================== */

function renderMenu() {

    menuContainer.innerHTML = "";

    categories.forEach(category => {

        if (!category.active) return;

        const categoryProducts = products.filter(product =>
            product.category === category.name
        );

        if (categoryProducts.length === 0) return;

        let html = `
            <div class="card shadow-sm mb-4">
                <div class="card-header bg-success text-white">
                    <h3 class="mb-0">${category.name}</h3>
                </div>

                <div class="card-body">
        `;

        categoryProducts.forEach(product => {

            html += `
                <div class="d-flex justify-content-between align-items-center border-bottom py-3">
                    <div>
                        <h5 class="mb-1">${product.name}</h5>
                        <small class="text-muted">
                            ${product.description || ""}
                        </small>
                    </div>

                    <h5 class="text-success mb-0">
                        ₺${Number(product.price).toLocaleString("tr-TR")}
                    </h5>
                </div>
            `;

        });

        html += `
                </div>
            </div>
        `;

        menuContainer.innerHTML += html;

    });

}

/* ===========================
   BAŞLAT
=========================== */

async function init() {

    await loadCategories();
    await loadProducts();
    renderMenu();

}

init();
