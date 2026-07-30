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
    orderBy("createdAt", "desc")
);

let ilkYukleme = true;

onSnapshot(q, (snapshot) => {

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

        let saat = "-";

        if (siparis.createdAt?.toDate) {

            saat = siparis.createdAt
                .toDate()
                .toLocaleTimeString("tr-TR", {
                    hour: "2-digit",
                    minute: "2-digit"
                });

        }

        ordersDiv.innerHTML += `

<div class="order ${durumClass}">

<h2>🪑 ${siparis.table}</h2>

<p><strong>🕒 Saat:</strong> ${saat}</p>

<ul>

${urunler}

</ul>

<p><strong>💰 Toplam:</strong> ₺${Number(siparis.total).toLocaleString("tr-TR")}</p>

<p><strong>📝 Not:</strong> ${siparis.not || "-"}</p>

<p><strong>📌 Durum:</strong> ${status}</p>

<button
class="durumBtn"
data-id="${id}"
data-durum="${status}">

${status === "Bekliyor"
    ? "👨‍🍳 Hazırlanmaya Başla"
    : status === "Hazırlanıyor"
    ? "✅ Teslim Edildi"
    : "✔️ Tamamlandı"}

</button>

</div>

`;

    });

    document.querySelectorAll(".durumBtn").forEach((btn) => {

        btn.addEventListener("click", async () => {

            const ref = doc(db, "orders", btn.dataset.id);

            let yeniDurum;

            switch (btn.dataset.durum) {

    case "Bekliyor":
        yeniDurum = "Hazırlanıyor";
        break;

    case "Hazırlanıyor":
        yeniDurum = "Teslim Edildi";
        break;

    default:
        yeniDurum = "Bekliyor";

}

await updateDoc(ref, {
    status: yeniDurum
});

        });

    });

});
