import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import { db } from "./firebase.js";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/* ===========================
   AUTH KONTROL
=========================== */

const auth = getAuth();

onAuthStateChanged(auth, (user) => {

  if (!user) {
    alert("Giriş yapmalısın!");
    window.location.href = "login.html";
    return;
  }

  console.log("Admin giriş yaptı:", user.email);

  startAdminPanel(); // 🔥 sadece login sonrası başlat

});

/* ===========================
   ADMIN PANEL BAŞLAT
=========================== */

function startAdminPanel() {

  const ordersDiv = document.getElementById("orders");

  const q = query(
    collection(db, "orders"),
    orderBy("createdAt", "desc")
  );

  let ilkYukleme = true;

  onSnapshot(q, (snapshot) => {

    // 🔔 Yeni sipariş sesi
    if (!ilkYukleme && snapshot.docChanges().some(c => c.type === "added")) {

      const ses = new Audio("https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg");
      ses.play().catch(() => {});

    }

    ilkYukleme = false;

    ordersDiv.innerHTML = "";

    if (snapshot.empty) {

      ordersDiv.innerHTML = `
        <div id="bos">
          Henüz sipariş yok...
        </div>
      `;
      return;
    }

    snapshot.forEach((document) => {

      const siparis = document.data();
      const id = document.id;

      const items = siparis.items || [];
      const status = siparis.status || "Bekliyor";

      /* ===========================
         DURUM RENK
      =========================== */

      let durumClass = "yeni";

      switch (status) {
        case "Hazırlanıyor":
          durumClass = "hazirlaniyor";
          break;

        case "Teslim Edildi":
          durumClass = "teslim";
          break;

        default:
          durumClass = "yeni";
      }

      /* ===========================
         ÜRÜNLER
      =========================== */

      let urunler = "";

      items.forEach((u) => {
        urunler += `
        <li>
          <strong>${u.qty}x</strong>
          ${u.name}
          — ₺${(u.qty * u.price).toLocaleString("tr-TR")}
        </li>
        `;
      });

      /* ===========================
         SAAT
      =========================== */

      let saat = "-";

      if (siparis.createdAt?.toDate) {
        saat = siparis.createdAt.toDate().toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit"
        });
      }

      /* ===========================
         HTML
      =========================== */

      ordersDiv.innerHTML += `

      <div class="order ${durumClass}">

        <h2>🪑 ${siparis.table}</h2>

        <p><strong>🕒 Saat:</strong> ${saat}</p>

        <ul>
          ${urunler}
        </ul>

        <p><strong>💰 Toplam:</strong> ₺${Number(siparis.total).toLocaleString("tr-TR")}</p>

        <p><strong>📌 Durum:</strong> ${status}</p>

        ${status !== "Teslim Edildi" ? `
        <button
          class="durumBtn"
          data-id="${id}"
          data-status="${status}">

          ${status === "Bekliyor"
            ? "👨‍🍳 Hazırlanmaya Başla"
            : "✅ Teslim Edildi"}

        </button>
        ` : ""}

      </div>

      `;

    });

    bindButtons();

  });

}

/* ===========================
   BUTON EVENT
=========================== */

function bindButtons() {

  document.querySelectorAll(".durumBtn").forEach((btn) => {

    btn.addEventListener("click", async () => {

      const id = btn.dataset.id;
      const current = btn.dataset.status;

      let yeniDurum;

      switch (current) {

        case "Bekliyor":
          yeniDurum = "Hazırlanıyor";
          break;

        case "Hazırlanıyor":
          yeniDurum = "Teslim Edildi";
          break;

        default:
          return;

      }

      try {

        await updateDoc(doc(db, "orders", id), {
          status: yeniDurum,
          closed: yeniDurum === "Teslim Edildi"
        });

      } catch (err) {

        console.error(err);
        alert("Durum güncellenemedi (yetki kontrol et)");

      }

    });

  });

}
