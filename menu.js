import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy,
    addDoc,
    serverTimestamp,
    doc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
const menuContainer = document.getElementById("menuContainer");

let categories = [];
let products = [];
/* ===========================
   SEPET
=========================== */

let cart = [];

const cartButton = document.getElementById("cartButton");
const cartCount = document.getElementById("cartCount");

const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

const cartModal = new bootstrap.Modal(
    document.getElementById("cartModal")
);
/* ===========================
   MASA BİLGİSİ
=========================== */

const params = new URLSearchParams(window.location.search);

const tableName =
    params.get("table") || "Bilinmeyen Masa";
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
            <div class="card shadow-lg border-0 rounded-4 mb-4">
                <div class="card-header bg-success text-white rounded-top-4">
                    <h3 class="mb-0">${category.name}</h3>
                </div>

                <div class="card-body">
        `;

        categoryProducts.forEach(product => {

            html += `
    <div class="d-flex justify-content-between align-items-center py-3">

        <div>

            <h5 class="mb-1 fw-bold">
                ${product.name}
            </h5>

            <small class="text-muted">
                ${product.description || ""}
            </small>

        </div>

        <span class="badge bg-success rounded-pill fs-6">

            ₺${Number(product.price).toLocaleString("tr-TR")}

        </span>
<button
    class="btn btn-success btn-sm mt-2 addCart"
    data-name="${product.name}"
    data-price="${product.price}">

    🛒 Sepete Ekle

</button>
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
/* ===========================
   SEPETE EKLE
=========================== */

document.querySelectorAll(".addCart").forEach(button => {

    button.addEventListener("click", () => {

        const name = button.dataset.name;
        const price = Number(button.dataset.price);

        const product = cart.find(item => item.name === name);

        if (product) {

            product.qty++;

        } else {

            cart.push({
                name,
                price,
                qty: 1
            });

        }

        updateCart();

    });

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
/* ===========================
   SEPETİ GÜNCELLE
=========================== */

function updateCart() {

    let total = 0;
    let count = 0;

    cartItems.innerHTML = "";

    cart.forEach((item, index) => {

        total += item.price * item.qty;
        count += item.qty;

        cartItems.innerHTML += `

        <div class="d-flex justify-content-between align-items-center mb-3">

            <div>

                <strong>${item.name}</strong><br>

                ${item.qty} x ₺${item.price.toLocaleString("tr-TR")}

            </div>

            <div>

                <button
                    class="btn btn-sm btn-danger removeItem"
                    data-index="${index}">

                    −

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

}
/* ===========================
   SİPARİŞ GÖNDER
=========================== */

document.getElementById("sendOrder")
.addEventListener("click", async () => {

    if (cart.length === 0) {

        alert("Sepet boş.");

        return;

    }

    const total = cart.reduce(
        (sum, item) =>
            sum + item.price * item.qty,
        0
    );

    try {

        const docRef = await addDoc(collection(db, "orders"), {
    table: tableName,
    items: cart,
    total,
    status: "Bekliyor",
    createdAt: serverTimestamp()
});

localStorage.setItem("lastOrderId", docRef.id);

        alert("Siparişiniz alındı. Afiyet olsun 😊");

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

document.getElementById("callWaiter")
.addEventListener("click", async () => {

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

        alert("Garson çağrılırken hata oluştu.");

    }

});
/* ===========================
   HESAP İSTE
=========================== */

document.getElementById("requestBill")
.addEventListener("click", async () => {

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
cartButton.addEventListener("click", () => {

    cartModal.show();

});
function watchLastOrder() {

    const lastOrderId = localStorage.getItem("lastOrderId");

    if (!lastOrderId) return;

    const statusDiv = document.getElementById("orderStatus");
    const statusText = document.getElementById("statusText");

    onSnapshot(doc(db, "orders", lastOrderId), (docSnap) => {

        if (!docSnap.exists()) return;

        statusDiv.style.display = "block";

        const order = docSnap.data();

        if (order.status === "Bekliyor") {

            statusText.innerHTML =
                "🟡 Siparişiniz alındı ve mutfağa iletildi.";

        } else if (order.status === "Hazırlanıyor") {

            statusText.innerHTML =
                "👨‍🍳 Siparişiniz hazırlanıyor.";

        } else if (order.status === "Teslim Edildi") {

            statusText.innerHTML =
                "✅ Siparişiniz teslim edildi.<br>Afiyet olsun 😊";
        }

    });

}

init();
watchLastOrder();
