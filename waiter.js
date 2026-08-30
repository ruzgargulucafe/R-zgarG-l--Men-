// 🔥 FIREBASE
import { db } from "./app.js"; // ❗ firebase.js değil app.js ile uyumlu

import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    where,
    getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"; // ❗ versiyon sabitlendi

// 🔊 Bildirim sesi
const notificationSound = new Audio("./assets/notification.mp3");

// Sayaçlar
let lastCallCount = 0;
let lastBillCount = 0;

// ELEMENTLER (boşsa hata vermesin)
const waitingCount = document.getElementById("waitingCount") || { innerText: 0 };
const callCount = document.getElementById("callCount") || { innerText: 0 };
const billCount = document.getElementById("billCount") || { innerText: 0 };

const callsDiv = document.getElementById("calls");
const billsDiv = document.getElementById("bills");
const tablesDiv = document.getElementById("tables");

// Modal
const billModal = document.getElementById("billModal");
const modalTable = document.getElementById("modalTable");
const modalItems = document.getElementById("modalItems");
const modalTotal = document.getElementById("modalTotal");

const closeBillBtn = document.getElementById("closeBillBtn");
const cancelBillBtn = document.getElementById("cancelBillBtn");

const splitArea = document.getElementById("splitArea");
const cashAmount = document.getElementById("cashAmount");
const cardAmount = document.getElementById("cardAmount");

// Seçili hesap
let selectedBillId = null;
let selectedTable = null;
let selectedOrders = [];
let selectedTotal = 0;

console.log("✅ waiter.js yüklendi");

// ===================================================
// GARSON ÇAĞRILARI
// ===================================================

const callQuery = query(
    collection(db, "calls"),
    orderBy("createdAt", "desc")
);

onSnapshot(callQuery, (snapshot) => {

    if (lastCallCount !== 0 && snapshot.size > lastCallCount) {
        notificationSound.play().catch(() => {});
    }

    lastCallCount = snapshot.size;

    callsDiv.innerHTML = "";

    let activeCalls = 0;

    snapshot.forEach((docSnap) => {

        const call = docSnap.data();

        if (call.status === "Tamamlandı") return;

        activeCalls++;

        callsDiv.innerHTML += `
            <div class="card">
                <h3>🔔 ${call.table}</h3>
                <p>Garson çağırıyor</p>
                <button class="callDone" data-id="${docSnap.id}">
                    ✅ Tamamlandı
                </button>
            </div>
        `;
    });

    callCount.innerText = activeCalls;

    document.querySelectorAll(".callDone").forEach(btn => {
        btn.onclick = async () => {
            await updateDoc(doc(db, "calls", btn.dataset.id), {
                status: "Tamamlandı"
            });
        };
    });

});

// ===================================================
// HESAP İSTEKLERİ
// ===================================================

const billQuery = query(
    collection(db, "billRequests"),
    orderBy("createdAt", "desc")
);

onSnapshot(billQuery, (snapshot) => {

    if (lastBillCount !== 0 && snapshot.size > lastBillCount) {
        notificationSound.play().catch(() => {});
    }

    lastBillCount = snapshot.size;

    billsDiv.innerHTML = "";

    let activeBills = 0;

    snapshot.forEach((docSnap) => {

        const bill = docSnap.data();

        if (bill.status === "Tamamlandı") return;

        activeBills++;

        billsDiv.innerHTML += `
            <div class="card">
                <h3>💳 ${bill.table}</h3>
                <p>Hesap istiyor</p>
                <button class="openBill"
                    data-id="${docSnap.id}"
                    data-table="${bill.table}">
                    👁 Aç
                </button>
            </div>
        `;
    });

    billCount.innerText = activeBills;

    document.querySelectorAll(".openBill").forEach(btn => {
        btn.onclick = async () => {
            selectedBillId = btn.dataset.id;
            selectedTable = btn.dataset.table;

            billModal.style.display = "flex";
            modalTable.innerText = selectedTable;

            await loadBill(selectedTable);
        };
    });

});

// ===================================================
// ADİSYON YÜKLE
// ===================================================

async function loadBill(tableName) {

    modalItems.innerHTML = "";
    modalTotal.innerText = "₺0";

    const orders = await getDocs(
        query(
            collection(db, "orders"),
            where("table", "==", tableName),
            where("closed", "==", false)
        )
    );

    selectedOrders = [];
    let total = 0;

    orders.forEach(docSnap => {

        const order = docSnap.data();
        selectedOrders.push(docSnap);

        (order.items || []).forEach(item => {
            total += item.price * item.qty;

            modalItems.innerHTML += `
                <div>
                    ${item.name} x${item.qty} = ₺${(item.price * item.qty).toFixed(2)}
                </div>
            `;
        });

    });

    selectedTotal = total;
    modalTotal.innerText = "₺" + total.toFixed(2);
}

// ===================================================
// HESAP KAPAT
// ===================================================

cancelBillBtn.onclick = () => {
    billModal.style.display = "none";
};

closeBillBtn.onclick = async () => {

    if (!selectedBillId) return;

    await updateDoc(doc(db, "billRequests", selectedBillId), {
        status: "Tamamlandı"
    });

    for (const orderDoc of selectedOrders) {
        await updateDoc(orderDoc.ref, {
            closed: true,
            paidAt: serverTimestamp()
        });
    }

    billModal.style.display = "none";

    alert("Hesap kapatıldı");
};

// ===================================================
// MASALAR (AKTİF)
// ===================================================

const ordersQuery = query(
    collection(db, "orders"),
    where("closed", "==", false)
);

onSnapshot(ordersQuery, (snapshot) => {

    waitingCount.innerText = snapshot.size;

    const tables = {};

    snapshot.forEach(docSnap => {

        const o = docSnap.data();

        if (!tables[o.table]) {
            tables[o.table] = { total: 0, count: 0 };
        }

        tables[o.table].count++;

        (o.items || []).forEach(i => {
            tables[o.table].total += i.price * i.qty;
        });

    });

    tablesDiv.innerHTML = "";

    Object.keys(tables).forEach(t => {

        const info = tables[t];

        tablesDiv.innerHTML += `
            <div class="card">
                <h3>${t}</h3>
                <div>${info.count} sipariş</div>
                <strong>₺${info.total.toFixed(2)}</strong>
            </div>
        `;
    });

});
