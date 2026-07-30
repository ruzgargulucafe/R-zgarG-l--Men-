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

let lastOrderCount = 0;
const ordersDiv = document.getElementById("orders");

const q = query(
    collection(db, "orders"),
    orderBy("createdAt", "desc")
);
onSnapshot(q, (snapshot) => {
if (lastOrderCount !== 0 && snapshot.size > lastOrderCount) {

    notificationSound.play().catch(() => {});

}

lastOrderCount = snapshot.size;
    ordersDiv.innerHTML = "";

    snapshot.forEach((document) => {

        const siparis = document.data();
        const id = document.id;

        if (siparis.status === "Teslim Edildi") return;

        let urunler = "";

        (siparis.items || []).forEach((u)=>{

            urunler += `
            <li>
                <strong>${u.qty}x</strong>
                ${u.name}
            </li>
            `;

        });

        ordersDiv.innerHTML += `

<div class="card">

<h2>🪑 ${siparis.table}</h2>

<ul>

${urunler}

</ul>

<p><strong>Durum:</strong> ${siparis.status}</p>

<button
class="durumBtn"
data-id="${id}"
data-status="${siparis.status}">

${siparis.status==="Bekliyor"
? "👨‍🍳 Hazırlamaya Başla"
: "✅ Hazırlandı"}

</button>

</div>

`;

    });

    document.querySelectorAll(".durumBtn").forEach((btn)=>{

        btn.onclick = async()=>{

            const ref = doc(db,"orders",btn.dataset.id);

            let yeniDurum =
                btn.dataset.status==="Bekliyor"
                ? "Hazırlanıyor"
                : "Teslim Edildi";

            await updateDoc(ref,{
                status:yeniDurum
            });

        };

    });

});
