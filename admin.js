// 🔥 FIREBASE IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 🔥 CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCj4F_8WOwLzVoREs-gRZDXfgYEkLtNvig",
  authDomain: "ruzgarguluqr.firebaseapp.com",
  projectId: "ruzgarguluqr"
};

// 🔥 INIT
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// 🔐 AUTH KONTROL
onAuthStateChanged(auth, user => {
  if (!user) location.href = "index.html";
});

// 🚪 LOGOUT
window.logout = () => signOut(auth);

// SAYFA DEĞİŞİM
window.page = (p) => {
  document.getElementById("title").innerText = p.toUpperCase();

  if (p === "masa") loadMasa();
  if (p === "kategori") loadKategori();
  if (p === "urun") loadUrun();
  if (p === "siparis") loadSiparis();
  if (p === "garson") loadGarson();
  if (p === "ciro") loadCiro();
};

// ================= MASA =================
async function loadMasa() {
  document.getElementById("app").innerHTML = `
    <input id="masaAd" placeholder="Masa adı">
    <button onclick="masaEkle()">Ekle</button>
    <div id="masaList"></div>
  `;

  const snap = await getDocs(collection(db, "tables"));

  let html = "";

  snap.forEach(d => {
    const t = d.data();

    const qr = `https://ruzgargulucafe.github.io/RuzgarGuluMenu/menu.html?table=${t.name}`;

    html += `
      <div class="card">
        <b>${t.name}</b><br>
        <a href="${qr}" target="_blank">QR Aç</a><br>
        <button onclick="masaSil('${d.id}')">Sil</button>
      </div>
    `;
  });

  document.getElementById("masaList").innerHTML = html;
}

// ➕ MASA EKLE
window.masaEkle = async () => {
  const val = document.getElementById("masaAd").value.trim();

  if (val === "") {
    alert("Masa adı gir");
    return;
  }

  await addDoc(collection(db, "tables"), {
    name: val
  });

  document.getElementById("masaAd").value = "";
  loadMasa();
};

// ❌ MASA SİL
window.masaSil = async (id) => {
  await deleteDoc(doc(db, "tables", id));
  loadMasa();
};

// ================= KATEGORİ =================
async function loadKategori() {
  document.getElementById("app").innerHTML = `
    <input id="katAd">
    <button onclick="kategoriEkle()">Ekle</button>
    <div id="katList"></div>
  `;

  const snap = await getDocs(collection(db, "categories"));

  let html = "";

  snap.forEach(d => {
    html += `
      ${d.data().name}
      <button onclick="kategoriSil('${d.id}')">Sil</button><br>
    `;
  });

  document.getElementById("katList").innerHTML = html;
}

window.kategoriEkle = async () => {
  const val = document.getElementById("katAd").value.trim();

  if (val === "") return alert("Kategori boş");

  await addDoc(collection(db, "categories"), { name: val });
  loadKategori();
};

window.kategoriSil = async (id) => {
  await deleteDoc(doc(db, "categories", id));
  loadKategori();
};

// ================= ÜRÜN =================
async function loadUrun() {
  document.getElementById("app").innerHTML = `
    <input id="urunAd" placeholder="Ad">
    <input id="fiyat" placeholder="Fiyat">
    <input id="aciklama" placeholder="Açıklama">
    <input id="resim" placeholder="Resim URL">
    <input id="kdv" placeholder="KDV %">
    <select id="kdvTip">
      <option value="dahil">KDV Dahil</option>
      <option value="haric">KDV Hariç</option>
    </select>
    <button onclick="urunEkle()">Ekle</button>
    <div id="urunList"></div>
  `;

  const snap = await getDocs(collection(db, "products"));

  let html = "";

  snap.forEach(d => {
    const p = d.data();

    html += `
      <div class="card">
        <img src="${p.image || ""}" width="80"><br>
        <b>${p.name}</b><br>
        ${p.price}₺<br>
        <button onclick="urunSil('${d.id}')">Sil</button>
      </div>
    `;
  });

  document.getElementById("urunList").innerHTML = html;
}

window.urunEkle = async () => {
  const name = document.getElementById("urunAd").value.trim();
  const price = Number(document.getElementById("fiyat").value);

  if (name === "" || !price) {
    alert("Eksik bilgi");
    return;
  }

  await addDoc(collection(db, "products"), {
    name,
    price,
    description: document.getElementById("aciklama").value,
    image: document.getElementById("resim").value,
    kdv: Number(document.getElementById("kdv").value),
    kdvType: document.getElementById("kdvTip").value
  });

  loadUrun();
};

window.urunSil = async (id) => {
  await deleteDoc(doc(db, "products", id));
  loadUrun();
};

// ================= SİPARİŞ =================
function loadSiparis() {
  onSnapshot(collection(db, "orders"), snap => {

    let html = "";

    snap.forEach(d => {
      const o = d.data();

      html += `
        <div class="card">
          <b>${o.table}</b><br>
          ${o.items?.map(i => i.name + " x" + i.qty).join("<br>")}
          <br>${o.total}₺
        </div>
      `;
    });

    document.getElementById("app").innerHTML = html;
  });
}

// ================= GARSON =================
function loadGarson() {

  let html = "";

  onSnapshot(collection(db, "calls"), snap => {
    html = "<h3>Garson</h3>";

    snap.forEach(d => {
      html += `
        <div class="card">
          Masa ${d.data().table}
          <button onclick="silCall('${d.id}')">Temizle</button>
        </div>
      `;
    });

    document.getElementById("app").innerHTML = html;
  });

  onSnapshot(collection(db, "billRequests"), snap => {

    let h = "<h3>Hesap</h3>";

    snap.forEach(d => {
      h += `
        <div class="card">
          Masa ${d.data().table}
          <button onclick="silBill('${d.id}')">Temizle</button>
        </div>
      `;
    });

    document.getElementById("app").innerHTML += h;
  });
}

window.silCall = async (id) => {
  await deleteDoc(doc(db, "calls", id));
};

window.silBill = async (id) => {
  await deleteDoc(doc(db, "billRequests", id));
};

// ================= CİRO =================
async function loadCiro() {

  let daily = 0;
  let monthly = 0;

  const snap = await getDocs(collection(db, "orders"));

  const today = new Date().toDateString();
  const month = new Date().getMonth();

  snap.forEach(d => {
    const o = d.data();
    if (!o.createdAt) return;

    const t = new Date(o.createdAt.seconds * 1000);

    if (t.toDateString() === today) daily += o.total;
    if (t.getMonth() === month) monthly += o.total;
  });

  document.getElementById("app").innerHTML = `
    <h3>Günlük: ${daily}₺</h3>
    <h3>Aylık: ${monthly}₺</h3>
  `;
}

// START
page("masa");
