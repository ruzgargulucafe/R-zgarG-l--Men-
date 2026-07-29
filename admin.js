import { db } from "./firebase.js";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const ordersDiv = document.getElementById("orders");

const q = query(
  collection(db, "orders"),
  orderBy("tarih", "desc")
);

onSnapshot(q, (snapshot) => {

  ordersDiv.innerHTML = "";

  if (snapshot.empty) {
    ordersDiv.innerHTML = "<p>Henüz sipariş yok.</p>";
    return;
  }

  snapshot.forEach((document) => {

    const siparis = document.data();
    const id = document.id;

    let urunler = "";

    siparis.urunler.forEach((u) => {
      urunler += `
        <li>
          ${u.adet} × ${u.isim}
          (₺${u.fiyat * u.adet})
        </li>
      `;
    });

    ordersDiv.innerHTML += `
      <div class="order">

        <h2>🪑 Masa ${siparis.masa}</h2>

        <ul>
          ${urunler}
        </ul>

        <p><strong>Toplam:</strong> ₺${siparis.toplam}</p>

        <p><strong>Not:</strong> ${siparis.not || "-"}</p>

        <p><strong>Durum:</strong> ${siparis.durum}</p>

        <button
          class="durumBtn"
          data-id="${id}"
          data-durum="${siparis.durum}">
          Durumu Değiştir
        </button>

      </div>
    `;

  });

  document.querySelectorAll(".durumBtn").forEach((btn) => {

    btn.addEventListener("click", async () => {

      const ref = doc(db, "orders", btn.dataset.id);

      let yeniDurum;

      switch (btn.dataset.durum) {

        case "Yeni Sipariş":
          yeniDurum = "Hazırlanıyor";
          break;

        case "Hazırlanıyor":
          yeniDurum = "Hazır";
          break;

        case "Hazır":
          yeniDurum = "Teslim Edildi";
          break;

        default:
          yeniDurum = "Yeni Sipariş";

      }

      await updateDoc(ref, {
        durum: yeniDurum
      });

    });

  });

});
