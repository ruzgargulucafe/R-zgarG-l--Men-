import { db } from "./firebase.js";

import {
collection,
query,
orderBy,
onSnapshot
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const ordersDiv = document.getElementById("orders");

const q = query(
    collection(db, "orders"),
    orderBy("tarih", "desc")
);

onSnapshot(q, (snapshot) => {

    ordersDiv.innerHTML = "";

    if (snapshot.empty) {

        ordersDiv.innerHTML = "<p>Henüz sipariş yok.</p>";
        return;

    }

    snapshot.forEach(doc => {

        const siparis = doc.data();

        let urunler = "";

        siparis.urunler.forEach(u => {

            urunler += `
                <li>
                    ${u.adet} × ${u.isim}
                    (₺${u.fiyat * u.adet})
                </li>
            `;

        });

        ordersDiv.innerHTML += `

        <div class="order">

            <h2>🪑 Masa ${siparis.masa}</h2>

            <ul>

                ${urunler}

            </ul>

            <p><strong>Toplam:</strong> ₺${siparis.toplam}</p>

            <p><strong>Not:</strong> ${siparis.not || "-"}</p>

            <p><strong>Durum:</strong> ${siparis.durum}</p>

        </div>

        `;

    });

});
