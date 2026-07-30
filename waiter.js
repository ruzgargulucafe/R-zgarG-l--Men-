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

// Sayaçlar
let lastCallCount = 0;
let lastBillCount = 0;

// Sayfa elemanları
const callsDiv = document.getElementById("calls");
const billsDiv = document.getElementById("bills");
const tablesDiv = document.getElementById("tables");

const waitingCount = document.getElementById("waitingCount");
const callCount = document.getElementById("callCount");
const billCount = document.getElementById("billCount");

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

// Seçili masa
let selectedBillId = null;
let selectedTable = null;
let selectedTotal = 0;

// Test
console.log("Waiter.js yüklendi.");

// =====================================
// GARSON ÇAĞRILARI
// =====================================

const callQuery = query(
    collection(db, "calls"),
    orderBy("createdAt", "desc")
);

onSnapshot(callQuery, (snapshot) => {

    // Yeni çağrı sesi
    if (lastCallCount !== 0 && snapshot.size > lastCallCount) {
        notificationSound.play().catch(() => {});
    }

    lastCallCount = snapshot.size;

    callsDiv.innerHTML = "";

    let activeCount = 0;

    snapshot.forEach((docSnap) => {

        const call = docSnap.data();

        if (call.status === "Tamamlandı") return;

        activeCount++;

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

    callCount.innerText = activeCount;

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
