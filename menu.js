import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy,
    addDoc,
    serverTimestamp,
    onSnapshot,
    where
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/* ===========================
   ELEMENTLER
=========================== */

const menuContainer = document.getElementById("menuContainer");

const cartButton = document.getElementById("cartButton");
const cartCount = document.getElementById("cartCount");

const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

const sendOrderBtn = document.getElementById("sendOrder");
const callWaiterBtn = document.getElementById("callWaiter");
const requestBillBtn = document.getElementById("requestBill");

const cartModal = new bootstrap.Modal(
    document.getElementById("cartModal")
);

const ordersButton = document.getElementById("ordersButton");
const ordersCount = document.getElementById("ordersCount");
const ordersContainer = document.getElementById("ordersContainer");

const ordersModal = new bootstrap.Modal(
    document.getElementById("ordersModal")
);
/* ===========================
   DEĞİŞKENLER
=========================== */

let categories = [];
let products = [];
let cart = [];

const params = new URLSearchParams(window.location.search);

const tableName =
    params.get("table") || "Bilinmeyen Masa";

/* ===========================
   KATEGORİLER
=========================== */

async function loadCategories() {

    const snapshot = await getDocs(
        query(
            collection(db, "categories"),
            orderBy("order")
        )
    );

    categories = [];

    snapshot.forEach(doc => {

        categories.push({
            id: doc.id,
            ...doc.data()
        });

    });

}

/* ===========================
   ÜRÜNLER
=========================== */

async function loadProducts() {

    const snapshot = await getDocs(
        collection(db, "products")
    );

    products = [];

    snapshot.forEach(doc => {

        const product = {
            id: doc.id,
            ...doc.data()
        };

        if (product.active) {
            products.push(product);
        }

    });

}
/* ===========================
   MENÜYÜ OLUŞTUR
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

        <div class="card shadow-lg border-0 rounded-4 mb-4">

            <div class="card-header bg-success text-white rounded-top-4">

                <h3 class="mb-0">
                    ${category.name}
                </h3>

            </div>

            <div class="card-body">

        `;

        categoryProducts.forEach(product => {

            html += `

            <div class="d-flex justify-content-between align-items-center py-3">

                <div>

                    <h5 class="fw-bold mb-1">
                        ${product.name}
                    </h5>

                    <small class="text-muted">
                        ${product.description || ""}
                    </small>

                </div>

                <div class="text-end">

                    <span class="badge bg-success rounded-pill fs-6">

                        ₺${Number(product.price).toLocaleString("tr-TR")}

                    </span>

                    <br>

                    <button
                        class="btn btn-success btn-sm mt-2 addCart"
                        data-name="${product.name}"
                        data-price="${product.price}">

                        🛒 Sepete Ekle

                    </button>

                </div>

            </div>

            <hr>

            `;

        });

        html += `

            </div>

        </div>

        `;

        menuContainer.innerHTML += html;

    });

    bindCartButtons();

}

/* ===========================
   SEPET BUTONLARI
=========================== */

function bindCartButtons() {

    document.querySelectorAll(".addCart").forEach(button => {

        button.onclick = () => {

            const name = button.dataset.name;
            const price = Number(button.dataset.price);

            const item = cart.find(x => x.name === name);

            if (item) {

                item.qty++;

            } else {

                cart.push({
                    name,
                    price,
                    qty: 1
                });

            }

            updateCart();

        };

    });

}
/* ===========================
   SEPETİ GÜNCELLE
=========================== */

function updateCart() {

    let total = 0;
    let count = 0;

    cartItems.innerHTML = "";

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="text-center text-muted py-4">
                Sepet boş.
            </div>
        `;

    }

    cart.forEach((item, index) => {

        total += item.price * item.qty;
        count += item.qty;

        cartItems.innerHTML += `

        <div class="d-flex justify-content-between align-items-center mb-3">

            <div>

                <strong>${item.name}</strong><br>

                <small>
                    ${item.qty} x ₺${item.price.toLocaleString("tr-TR")}
                </small>

            </div>

            <div class="d-flex align-items-center gap-2">

                <button
                    class="btn btn-danger btn-sm removeItem"
                    data-index="${index}">
                    −
                </button>

                <span class="fw-bold">
                    ${item.qty}
                </span>

                <button
                    class="btn btn-success btn-sm addOne"
                    data-index="${index}">
                    +
                </button>

            </div>

        </div>

        <hr>

        `;

    });

    cartCount.innerText = count;

    cartTotal.innerText =
        "₺" + total.toLocaleString("tr-TR");

    cartButton.style.display =
        count > 0 ? "block" : "none";

    /* ===========================
       AZALT
    =========================== */

    document.querySelectorAll(".removeItem").forEach(btn => {

        btn.onclick = () => {

            const i = Number(btn.dataset.index);

            cart[i].qty--;

            if (cart[i].qty <= 0) {

                cart.splice(i, 1);

            }

            updateCart();

        };

    });

    /* ===========================
       ARTTIR
    =========================== */

    document.querySelectorAll(".addOne").forEach(btn => {

        btn.onclick = () => {

            const i = Number(btn.dataset.index);

            cart[i].qty++;

            updateCart();

        };

    });

}
/* ===========================
   SEPETİ AÇ
=========================== */

cartButton.addEventListener("click", () => {

    cartModal.show();

});
/* ===========================

   SİPARİŞLERİ AÇ

=========================== */

ordersButton.addEventListener("click", () => {

    ordersModal.show();

});
/* ===========================
   SİPARİŞ GÖNDER
=========================== */

sendOrderBtn.addEventListener("click", async () => {

    if (cart.length === 0) {

        alert("Sepet boş.");

        return;

    }

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
    );

    try {

        const docRef = await addDoc(
            collection(db, "orders"),
            {
                table: tableName,
                items: [...cart],
                total,
                status: "Bekliyor",
                createdAt: serverTimestamp()
            }
        );

        alert("✅ Siparişiniz başarıyla alındı.");

        cart = [];

        updateCart();

        cartModal.hide();

    } catch (err) {

        console.error(err);

        alert("Sipariş gönderilemedi.");

    }

});

/* ===========================
   GARSON ÇAĞIR
=========================== */

callWaiterBtn.addEventListener("click", async () => {

    try {

        await addDoc(
            collection(db, "calls"),
            {
                table: tableName,
                status: "Bekliyor",
                createdAt: serverTimestamp()
            }
        );

        alert("🔔 Garsona haber verildi.");

    } catch (err) {

        console.error(err);

        alert("Garson çağrılamadı.");

    }

});

/* ===========================
   HESAP İSTE
=========================== */

requestBillBtn.addEventListener("click", async () => {

    try {

        await addDoc(
            collection(db, "billRequests"),
            {
                table: tableName,
                status: "Bekliyor",
                createdAt: serverTimestamp()
            }
        );

        alert("💳 Hesap talebiniz garsona iletildi.");

    } catch (err) {

        console.error(err);

        alert("Hesap isteği gönderilemedi.");

    }

});
/* ===========================
   SİPARİŞ TAKİBİ
=========================== */

let unsubscribeOrders = null;

function watchOrders() {

    if (unsubscribeOrders) {
        unsubscribeOrders();
    }

    const q = query(
    collection(db, "orders"),
    where("table", "==", tableName),
    orderBy("createdAt", "desc")
);

    unsubscribeOrders = onSnapshot(q, (snapshot) => {

        let html = "";
        let activeCount = 0;

        snapshot.forEach(docSnap => {

            const order = docSnap.data();

            let badge = "";

            switch (order.status) {

                case "Bekliyor":
                    badge = `<span class="badge bg-warning">Bekliyor</span>`;
                    activeCount++;
                    break;

                case "Hazırlanıyor":
                    badge = `<span class="badge bg-primary">Hazırlanıyor</span>`;
                    activeCount++;
                    break;

                case "Teslim Edildi":
                    badge = `<span class="badge bg-success">Teslim Edildi</span>`;
                    break;

                default:
                    badge = `<span class="badge bg-secondary">${order.status}</span>`;
            }

            html += `
                <div class="card mb-3">
                    <div class="card-body">

                        <div class="d-flex justify-content-between">

                            <h5>${badge}</h5>

                            <strong>
                                ₺${Number(order.total).toLocaleString("tr-TR")}
                            </strong>

                        </div>

                        <hr>

                        ${order.items.map(item => `
                            <div>
                                ${item.qty} x ${item.name}
                            </div>
                        `).join("")}

                    </div>
                </div>
            `;

        });

        if (html === "") {

            html = `
                <div class="text-center text-muted">
                    Henüz siparişiniz bulunmuyor.
                </div>
            `;

        }

        ordersContainer.innerHTML = html;
        ordersCount.innerText = activeCount;

    });

}
/* ===========================
   BAŞLAT
=========================== */

async function init() {

    try {

        await loadCategories();

        await loadProducts();

        renderMenu();

        updateCart();

        watchOrders();

    } catch (error) {

        console.error(error);

        alert("Menü yüklenirken hata oluştu.");

    }

}

init();
