import { db } from "./firebase.js";

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
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const notificationSound = new Audio("./assets/notification.mp3");

let lastCallCount = 0;
let lastBillCount = 0;

const callsDiv = document.getElementById("calls");
const billsDiv = document.getElementById("bills");
const tablesDiv = document.getElementById("tables");

const waitingCount = document.getElementById("waitingCount");
const callCount = document.getElementById("callCount");
const billCount = document.getElementById("billCount");

const billModal = document.getElementById("billModal");
const modalTable = document.getElementById("modalTable");
const modalItems = document.getElementById("modalItems");
const modalTotal = document.getElementById("modalTotal");

const closeBillBtn = document.getElementById("closeBillBtn");
const cancelBillBtn = document.getElementById("cancelBillBtn");

const splitArea = document.getElementById("splitArea");
const cashAmount = document.getElementById("cashAmount");
const cardAmount = document.getElementById("cardAmount");

let selectedBillId = null;
let selectedTable = null;

// =========================
// GARSON ÇAĞRILARI
// =========================

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

    const activeCalls = snapshot.docs.filter(doc =>
        doc.data().status !== "Tamamlandı"
    );

    callCount.innerText = activeCalls.length;

    activeCalls.forEach((docSnap) => {

        const call = docSnap.data();

        callsDiv.innerHTML += `
            <div class="card">

                <h2>🔔 ${call.table}</h2>

                <p>Garson çağırıyor.</p>

                <button
                    class="callDone"
                    data-id="${docSnap.id}">

                    ✅ Tamamlandı

                </button>

            </div>
        `;

    });

    document.querySelectorAll(".callDone").forEach((btn) => {

        btn.onclick = async () => {

            await updateDoc(
                doc(db, "calls", btn.dataset.id),
                {
                    status: "Tamamlandı"
                }
            );

        };

    });

});

// =========================
// HESAP İSTEKLERİ
// =========================

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

    const activeBills = snapshot.docs.filter(doc =>
        doc.data().status !== "Tamamlandı"
    );

    billCount.innerText = activeBills.length;

    activeBills.forEach((docSnap) => {

        const bill = docSnap.data();

        billsDiv.innerHTML += `
            <div class="card">

                <h2>💳 ${bill.table}</h2>

                <p>Hesap istiyor.</p>

                <button
                    class="openBill"
                    data-id="${docSnap.id}"
                    data-table="${bill.table}">

                    👁 Adisyon

                </button>

            </div>
        `;

    });

    document.querySelectorAll(".openBill").forEach((btn) => {

        btn.onclick = () => {

            selectedBillId = btn.dataset.id;
            selectedTable = btn.dataset.table;

            alert(`${selectedTable} seçildi`);

        };

    });

});
console.log("waiter.js çalıştı");
