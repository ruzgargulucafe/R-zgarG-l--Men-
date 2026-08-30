// 🔥 FIREBASE
import { db } from "./app.js";

import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 📌 MASA
const masa = new URLSearchParams(location.search).get("table");

if (!masa) {
  alert("QR ile giriş yap");
  document.body.innerHTML = "Geçersiz giriş";
  throw new Error("Masa yok");
}

// 🛒 SEPET
let cart = [];

// 🔥 ÜRÜNLERİ YÜKLE
async function load() {

  const snap = await getDocs(collection(db, "products"));

  let html = "";

  snap.forEach(d => {

    const p = d.data();

    html += `
      <div class="card">
        <h3>${p.name}</h3>
        <p>${p.description || ""}</p>
        <b>${p.price}₺</b>
        <button onclick="add('${d.id}','${p.name}',${p.price})">
          Sepete Ekle
        </button>
      </div>
    `;
  });

  document.getElementById("menu").innerHTML = html;
}

// ➕ SEPET
window.add = (id, name, price) => {

  const item = cart.find(x => x.id === id);

  if (item) {
    item.qty++;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }

  renderCart();
};

// 🧾 SEPET GÜNCELLE
function renderCart() {

  let html = "";
  let total = 0;

  cart.forEach(i => {
    html += `${i.name} x ${i.qty}<br>`;
    total += i.price * i.qty;
  });

  document.getElementById("cartList").innerHTML = html;
  document.getElementById("total").innerText = "Toplam: " + total + "₺";
}

// 📦 SİPARİŞ GÖNDER
window.sendOrder = async () => {

  if (cart.length === 0) {
    alert("Sepet boş");
    return;
  }

  let total = 0;
  cart.forEach(i => total += i.price * i.qty);

  await addDoc(collection(db, "orders"), {
    table: masa,
    items: cart,
    total: total,
    status: "Bekliyor",
    createdAt: serverTimestamp()
  });

  alert("Sipariş gönderildi");

  cart = [];
  renderCart();
};

// 🚀 START
load();
