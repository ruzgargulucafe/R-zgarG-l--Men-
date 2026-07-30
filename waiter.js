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

// Bildirim sesi
const notificationSound = new Audio("./assets/notification.mp3");

// Sayaçlar
let lastCallCount = 0;
let lastBillCount = 0;

// Sayfa elemanları
const waitingCount = document.getElementById("waitingCount");
const callCount = document.getElementById("callCount");
const billCount = document.getElementById("billCount");

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

console.log("✅ waiter.js başarıyla yüklendi.");

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

    callCount.innerText = activeCalls;

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

                <h2>💳 ${bill.table}</h2>

                <p>Hesap istiyor.</p>

                <button
                    class="openBill"
                    data-id="${docSnap.id}"
                    data-table="${bill.table}">

                    👁 Adisyonu Aç

                </button>

            </div>
        `;

    });

    billCount.innerText = activeBills;

    document.querySelectorAll(".openBill").forEach((btn) => {

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
// ADİSYONU YÜKLE
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

    const grouped = {};

    orders.forEach((docSnap) => {

        const order = docSnap.data();

        selectedOrders.push(docSnap);

        (order.items || []).forEach((item) => {

            if (!grouped[item.name]) {

                grouped[item.name] = {
                    qty: 0,
                    price: item.price
                };

            }

            grouped[item.name].qty += item.qty;

total += item.price * item.qty;

        });

    });

    Object.keys(grouped).forEach((name) => {

        const item = grouped[name];

        modalItems.innerHTML += `

            <div style="
                display:flex;
                justify-content:space-between;
                padding:10px 0;
                border-bottom:1px solid #444;">

                <span>${item.qty} x ${name}</span>

                <strong>
                    ₺${(item.qty * item.price).toFixed(2)}
                </strong>

            </div>

        `;

    });

    selectedTotal = total;

    modalTotal.innerText = "₺" + total.toFixed(2);

}

// ===================================================
// HESABI KAPAT
// ===================================================

cancelBillBtn.onclick = () => {

    billModal.style.display = "none";

    selectedBillId = null;
    selectedTable = null;
    selectedOrders = [];
    selectedTotal = 0;

    modalItems.innerHTML = "";
    modalTotal.innerText = "₺0";

    document.querySelector("input[value='Nakit']").checked = true;
splitArea.style.display = "none";
cashAmount.value = "";
cardAmount.value = "";
    
};

document.querySelectorAll("input[name='payment']").forEach(radio => {

    radio.addEventListener("change", () => {

        splitArea.style.display =
            radio.value === "Split" && radio.checked
                ? "block"
                : "none";

    });

});

closeBillBtn.onclick = async () => {

    if (!selectedBillId || !selectedTable) return;

    const paymentType =
        document.querySelector("input[name='payment']:checked").value;

    if (paymentType === "Split") {

    const cash = Number(document.getElementById("cashAmount").value || 0);
    const card = Number(document.getElementById("cardAmount").value || 0);

    if (cash + card !== selectedTotal) {

        alert("Nakit + Kart toplamı hesap tutarı ile aynı olmalıdır.");

        return;

    }

}
    
    // Bill isteğini kapat
    await updateDoc(
        doc(db, "billRequests", selectedBillId),
        {
            status: "Tamamlandı"
        }
    );

    // Açık siparişleri kapat

    console.log("selectedOrders:", selectedOrders);
    
    for (const orderDoc of selectedOrders) {

        await updateDoc(orderDoc.ref, {

            closed: true,

            paymentType,

            paidAt: serverTimestamp()

        });

    }

    billModal.style.display = "none";

    alert(`${selectedTable} hesabı kapatıldı.`);
selectedBillId = null;
selectedTable = null;
selectedOrders = [];
selectedTotal = 0;

modalItems.innerHTML = "";
modalTotal.innerText = "₺0";

    document.querySelector("input[value='Nakit']").checked = true;
splitArea.style.display = "none";
cashAmount.value = "";
cardAmount.value = "";
    
};

// ===================================================
// MASALAR
// ===================================================

const ordersQuery = query(
    collection(db, "orders"),
    where("closed", "==", false)
);

onSnapshot(ordersQuery, (snapshot) => {

    waitingCount.innerText = snapshot.size;

    const tables = {};

    snapshot.forEach((docSnap) => {

        const order = docSnap.data();

        if (!tables[order.table]) {

            tables[order.table] = {

                total: 0,
                status: order.status,
                orderCount: 0

            };

        }

        tables[order.table].status = order.status;
        tables[order.table].orderCount++;

        (order.items || []).forEach(item => {

    tables[order.table].total +=
        item.price * item.qty;

});

    });

    tablesDiv.innerHTML = "";

    Object.keys(tables)
        .sort()
        .forEach((table) => {

            const info = tables[table];

            let color = "#28a745";

            if (info.status === "Bekliyor")
                color = "#ff9800";

            if (info.status === "Hazırlanıyor")
                color = "#2196f3";

            tablesDiv.innerHTML += `

            <div
                class="table"
                style="
                    background:${color};
                    padding:18px;
                    border-radius:12px;
                ">

                <h3>${table}</h3>

                <div>
                    ${info.orderCount} Sipariş
                </div>

                <div style="margin-top:8px;font-weight:bold;">
                    ₺${info.total.toFixed(2)}
                </div>

                <div style="margin-top:8px;font-size:14px;">
                    ${info.status}
                </div>

            </div>

            `;

        });

});
