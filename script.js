// 🔥 FIREBASE
import { db } from "./app.js";

import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =========================
// HTML
// =========================

const menuContent = document.getElementById("menuContent");
const cartButton = document.getElementById("cartButton");
const cartPanel = document.getElementById("cartPanel");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const clearCart = document.getElementById("clearCart");
const finishOrder = document.getElementById("finishOrder");
const masaNo = document.getElementById("masaNo");
const orderNote = document.getElementById("orderNote");

// =========================
// SEPET
// =========================

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let products = [];

// =========================
// ÜRÜNLERİ YÜKLE
// =========================

async function loadProducts() {

  menuContent.innerHTML = "Yükleniyor...";

  const snap = await getDocs(collection(db, "products"));

  products = [];

  snap.forEach(doc => {
    products.push({
      id: doc.id,
      ...doc.data()
    });
  });

  renderMenu();
}

// =========================
// MENÜ
// =========================

function renderMenu() {

  const kategoriler = [...new Set(products.map(x => x.category || "Genel"))];

  let html = "";

  kategoriler.forEach(kategori => {

    html += `
      <div class="category">
        <div class="categoryHeader">${kategori}</div>
        <div class="categoryBody" style="display:none;">
          ${products
            .filter(x => (x.category || "Genel") === kategori)
            .map(p => `
              <div class="product">
                <div>
                  <h3>${p.name}</h3>
                  <p>${p.description || ""}</p>
                  <b>₺${p.price}</b>
                </div>
                <button data-id="${p.id}" class="addCart">
                  Sepete Ekle
                </button>
              </div>
            `).join("")}
        </div>
      </div>
    `;
  });

  menuContent.innerHTML = html;

  // accordion
  document.querySelectorAll(".categoryHeader").forEach(h => {
    h.onclick = () => {
      const body = h.nextElementSibling;
      body.style.display = body.style.display === "block" ? "none" : "block";
    };
  });

  // sepete ekle
  document.querySelectorAll(".addCart").forEach(btn => {

    btn.onclick = () => {

      const id = btn.dataset.id;
      const urun = products.find(x => x.id === id);

      if (!urun) return;

      const mevcut = cart.find(x => x.id === id);

      if (mevcut) {
        mevcut.adet++;
      } else {
        cart.push({
          id: urun.id,
          name: urun.name,
          price: Number(urun.price),
          adet: 1
        });
      }

      saveCart();
    };
  });
}

// =========================
// SEPET
// =========================

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
}

function updateCart() {

  cartCount.innerText = cart.reduce((t, x) => t + x.adet, 0);

  let html = "";
  let toplam = 0;

  cart.forEach((u, i) => {

    toplam += u.price * u.adet;

    html += `
      <div>
        ${u.name} x${u.adet}
        <button data-i="${i}" class="arti">+</button>
        <button data-i="${i}" class="eksi">-</button>
      </div>
    `;
  });

  cartItems.innerHTML = html;
  cartTotal.innerText = "₺" + toplam;

  document.querySelectorAll(".arti").forEach(b => {
    b.onclick = () => {
      cart[b.dataset.i].adet++;
      saveCart();
    };
  });

  document.querySelectorAll(".eksi").forEach(b => {
    b.onclick = () => {
      cart[b.dataset.i].adet--;
      if (cart[b.dataset.i].adet <= 0) cart.splice(b.dataset.i, 1);
      saveCart();
    };
  });
}

// =========================
// SİPARİŞ
// =========================

finishOrder.onclick = async () => {

  if (cart.length === 0) return alert("Sepet boş");

  const masa = masaNo.value || "Bilinmiyor";

  let total = 0;
  cart.forEach(i => total += i.price * i.adet);

  await addDoc(collection(db, "orders"), {
    table: masa,
    items: cart,
    total: total,
    status: "Bekliyor",
    note: orderNote.value,
    createdAt: serverTimestamp()
  });

  alert("Sipariş gönderildi");

  cart = [];
  localStorage.removeItem("cart");
  saveCart();
};

// =========================
// BAŞLANGIÇ
// =========================

updateCart();

const params = new URLSearchParams(location.search);
const table = params.get("table");

if (table) masaNo.value = table;

loadProducts();
