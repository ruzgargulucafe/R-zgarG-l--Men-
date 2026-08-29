import { db, auth } from "./firebase.js";

import {
collection,
addDoc,
getDocs,
onSnapshot,
query,
doc,
updateDoc,
deleteDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import {
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

/* =========================
   AUTH
========================= */

onAuthStateChanged(auth, user => {

    if (!user) {
        location.href = "login.html";
        return;
    }

    console.log("Giriş yapıldı:", user.email);

    start();
});

/* =========================
   LOGOUT
========================= */

window.logout = async () => {
    await signOut(auth);
    location.href = "login.html";
};

/* =========================
   BAŞLAT
========================= */

function start() {
    watchOrders();
    loadProducts();
    loadTables();
    loadFinance();
    loadDebts();
}

/* =========================
   SİPARİŞ
========================= */

function watchOrders() {

    const q = query(collection(db, "orders")); // ❗ orderBy kaldırıldı

    onSnapshot(q, snap => {

        let html = "";

        snap.forEach(d => {

            const o = d.data();

            html += `
            <div class="card p-3 mb-2">
                <h5>${o.table || "-"}</h5>
                <p>₺${o.total || 0}</p>

                <button onclick="updateStatus('${d.id}','Hazırlanıyor')" class="btn btn-warning btn-sm">Hazırla</button>

                <button onclick="updateStatus('${d.id}','Teslim Edildi')" class="btn btn-success btn-sm">Teslim</button>
            </div>
            `;
        });

        const el = document.getElementById("ordersList");
        if (el) el.innerHTML = html;
    });
}

window.updateStatus = async (id, status) => {
    await updateDoc(doc(db, "orders", id), { status });
};

/* =========================
   ÜRÜN
========================= */

window.addProduct = async () => {

    const name = document.getElementById("pName")?.value;
    const price = Number(document.getElementById("pPrice")?.value);

    if (!name || !price) {
        alert("Ürün adı ve fiyat gir");
        return;
    }

    await addDoc(collection(db, "products"), {
        name,
        price,
        active: true
    });

    loadProducts();
};

async function loadProducts() {

    const snap = await getDocs(collection(db, "products"));

    let html = "";

    snap.forEach(d => {

        const p = d.data();

        html += `
        <div class="card p-2 mb-2 d-flex justify-content-between">
            ${p.name} - ₺${p.price}

            <button onclick="deleteProduct('${d.id}')" class="btn btn-danger btn-sm">
                Sil
            </button>
        </div>
        `;
    });

    const el = document.getElementById("productList");
    if (el) el.innerHTML = html;
}

window.deleteProduct = async (id) => {
    await deleteDoc(doc(db, "products", id));
    loadProducts();
};

/* =========================
   MASA
========================= */

window.addTable = async () => {

    const name = document.getElementById("tableName")?.value;

    if (!name) {
        alert("Masa adı gir");
        return;
    }

    await addDoc(collection(db, "tables"), { name });

    loadTables();
};

async function loadTables() {

    const snap = await getDocs(collection(db, "tables"));

    let html = "";

    snap.forEach(d => {

        const t = d.data();

        const qrLink = `https://ruzgargulucafe.github.io/RuzgarGuluMenu/menu.html?table=${t.name}`;

        html += `
        <div class="card p-2 mb-2">
            ${t.name}
            <br>

            <a href="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrLink}" target="_blank">
                QR Gör
            </a>

            <button onclick="deleteTable('${d.id}')" class="btn btn-danger btn-sm">
                Sil
            </button>
        </div>
        `;
    });

    const el = document.getElementById("tableList");
    if (el) el.innerHTML = html;
}

window.deleteTable = async (id) => {
    await deleteDoc(doc(db, "tables", id));
    loadTables();
};

/* =========================
   CİRO
========================= */

async function loadFinance() {

    const snap = await getDocs(collection(db, "orders"));

    let daily = 0;
    let monthly = 0;

    const today = new Date().toDateString();
    const month = new Date().getMonth();

    snap.forEach(d => {

        const o = d.data();

        if (!o.createdAt) return;

        const date = o.createdAt.toDate();

        if (date.toDateString() === today) {
            daily += o.total || 0;
        }

        if (date.getMonth() === month) {
            monthly += o.total || 0;
        }
    });

    const dEl = document.getElementById("daily");
    const mEl = document.getElementById("monthly");

    if (dEl) dEl.innerText = "₺" + daily;
    if (mEl) mEl.innerText = "₺" + monthly;
}

/* =========================
   BORÇ
========================= */

window.addDebt = async () => {

    const name = document.getElementById("dName")?.value;
    const amount = Number(document.getElementById("dAmount")?.value);
    const date = document.getElementById("dDate")?.value;

    if (!name || !amount) {
        alert("Eksik bilgi");
        return;
    }

    await addDoc(collection(db, "debts"), {
        name,
        amount,
        date
    });

    loadDebts();
};

async function loadDebts() {

    const snap = await getDocs(collection(db, "debts"));

    let html = "";

    snap.forEach(d => {

        const debt = d.data();

        html += `
        <div class="card p-2 mb-2">
            ${debt.name} - ₺${debt.amount}
            <br>
            Vade: ${debt.date || "-"}
        </div>
        `;
    });

    const el = document.getElementById("debtList");
    if (el) el.innerHTML = html;
}
