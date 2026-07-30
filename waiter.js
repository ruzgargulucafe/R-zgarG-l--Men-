import { db } from "./firebase.js";

import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
const notificationSound = new Audio("./assets/notification.mp3");

let lastCallCount = 0;
let lastBillCount = 0;
const billsDiv = document.getElementById("bills");
const callsDiv = document.getElementById("calls");

const q = query(
    collection(db,"calls"),
    orderBy("createdAt","desc")
);

onSnapshot(q,(snapshot)=>{
if (lastCallCount !== 0 && snapshot.size > lastCallCount) {
    notificationSound.play().catch(() => {});
}

lastCallCount = snapshot.size;
    callsDiv.innerHTML="";

    snapshot.forEach((document)=>{

        const call=document.data();
        const id=document.id;

        if(call.status==="Tamamlandı") return;

        callsDiv.innerHTML+=`

<div class="card">

<h2>🔔 ${call.table}</h2>

<p>Garson çağırıyor.</p>

<button
class="doneBtn"
data-id="${id}">

✅ Tamamlandı

</button>

</div>

`;

    });

    document.querySelectorAll(".doneBtn").forEach((btn)=>{

        btn.onclick=async()=>{

            await updateDoc(
                doc(db,"calls",btn.dataset.id),
                {
                    status:"Tamamlandı"
                }
            );

        };

    });

});
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

    snapshot.forEach((document) => {

        const bill = document.data();
        const id = document.id;

        if (bill.status === "Tamamlandı") return;

        billsDiv.innerHTML += `

<div class="card">

<h2>💳 ${bill.table}</h2>

<p>Hesap istiyor.</p>

<button
class="billDone"
data-id="${id}">

💰 Hesap Alındı

</button>

</div>

`;

    });

    document.querySelectorAll(".billDone").forEach((btn) => {

        btn.onclick = async () => {

            await updateDoc(
                doc(db, "billRequests", btn.dataset.id),
                {
                    status: "Tamamlandı"
                }
            );

        };

    });

});
