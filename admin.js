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
    orderBy("tarih", "desc")
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

        let durumClass = "yeni";

        switch (siparis.durum) {

            case "Hazırlanıyor":
                durumClass = "hazirlaniyor";
                break;

            case "Hazır":
                durumClass = "hazir";
                break;

            case "Teslim Edildi":
                durumClass = "teslim";
                break;

        }

        let urunler = "";

        siparis.urunler.forEach((u) => {

            urunler += `
<li>
<strong>${u.adet}x</strong>
${u.name}
— ₺${u.adet * u.price}
</li>
`;

        });

        let saat = "-";

        if (siparis.tarih?.toDate) {

            saat = siparis.tarih
                .toDate()
                .toLocaleTimeString("tr-TR", {
                    hour: "2-digit",
                    minute: "2-digit"
                });

        }

        ordersDiv.innerHTML += `

<div class="order ${durumClass}">

<h2>🪑 Masa ${siparis.masa}</h2>

<p><strong>🕒 Saat:</strong> ${saat}</p>

<ul>

${urunler}

</ul>

<p><strong>💰 Toplam:</strong> ₺${siparis.toplam}</p>

<p><strong>📝 Not:</strong> ${siparis.not || "-"}</p>

<p><strong>📌 Durum:</strong> ${siparis.durum}</p>

<button
class="durumBtn"
data-id="${id}"
data-durum="${siparis.durum}">

Durumu Değiştir

</button>

</div>

`;

    });

    document.querySelectorAll(".durumBtn").forEach((btn) => {

        btn.addEventListener("click", async () => {

            const ref = doc(db, "orders", btn.dataset.id);

            let yeniDurum;

            switch (btn.dataset.durum) {

                case "Yeni Sipariş":
                    yeniDurum = "Hazırlanıyor";
                    break;

                case "Hazırlanıyor":
                    yeniDurum = "Hazır";
                    break;

                case "Hazır":
                    yeniDurum = "Teslim Edildi";
                    break;

                default:
                    yeniDurum = "Yeni Sipariş";

            }

            await updateDoc(ref, {
                durum: yeniDurum
            });

        });

    });

});
