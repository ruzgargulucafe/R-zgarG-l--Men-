// 🔥 FIREBASE
import { db } from "./app.js";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =========================
// ELEMENT
// =========================

const ordersDiv = document.getElementById("orders");

// =========================
// SİPARİŞLER
// =========================

const q = query(
  collection(db, "orders"),
  orderBy("createdAt", "desc")
);

onSnapshot(q, (snap) => {

  let html = "";

  snap.forEach((d) => {

    const o = d.data();

    // kapalıları gösterme
    if (o.closed) return;

    const durum = o.status || "Bekliyor";

    let itemsHTML = "";

    (o.items || []).forEach(i => {
      itemsHTML += `<div class="item">${i.name} x${i.qty}</div>`;
    });

    html += `
      <div class="card ${durum}">

        <h2>🍽 Masa: ${o.table}</h2>

        ${itemsHTML}

        <h3>₺${o.total}</h3>

        ${
          durum === "Bekliyor"
          ? `<button onclick="baslat('${d.id}')">Hazırlamaya Başla</button>`
          : ""
        }

        ${
          durum === "Hazırlanıyor"
          ? `<button onclick="hazir('${d.id}')">Hazır Yap</button>`
          : ""
        }

        ${
          durum === "Hazır"
          ? `<button onclick="teslim('${d.id}')">Teslim Edildi</button>`
          : ""
        }

      </div>
    `;
  });

  ordersDiv.innerHTML = html;

});

// =========================
// DURUM GÜNCELLE
// =========================

window.baslat = async (id) => {
  await updateDoc(doc(db, "orders", id), {
    status: "Hazırlanıyor"
  });
};

window.hazir = async (id) => {
  await updateDoc(doc(db, "orders", id), {
    status: "Hazır"
  });
};

window.teslim = async (id) => {
  await updateDoc(doc(db, "orders", id), {
    status: "Teslim"
  });
};
