alert("1. satır çalıştı");

console.log("Bootstrap:", typeof bootstrap);import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const tableList = document.getElementById("tableList");

const newTableButton = document.getElementById("newTable");
const saveTableButton = document.getElementById("saveTable");

const tableName = document.getElementById("tableName");

let modal = null;

if (typeof bootstrap !== "undefined") {
    modal = new bootstrap.Modal(document.getElementById("tableModal"));
}

/* ===========================
   MASALARI YÜKLE
=========================== */

async function loadTables() {

    try {

        const snapshot = await getDocs(
            collection(db, "tables")
        );

        tableList.innerHTML = "";

        snapshot.forEach(doc => {

            const table = doc.data();

            tableList.innerHTML += `

            <div class="col-lg-4 col-md-6">

                <div class="card shadow border-0 rounded-4">

                    <div class="card-body text-center">

                        <h3 class="mb-3">

                            🪑 ${table.name}

                        </h3>

                        <p class="mb-3">

                            ${
                                table.active
                                ? "🟢 Aktif"
                                : "🔴 Pasif"
                            }

                        </p>

                        <div class="d-grid gap-2">

                            <button
                                class="btn btn-primary">

                                📱 QR Kod

                            </button>

                            <button
                                class="btn btn-warning">

                                ✏️ Düzenle

                            </button>

                            <button
                                class="btn btn-danger">

                                🗑️ Sil

                            </button>

                        </div>

                    </div>

                </div>

            </div>

            `;

        });

    } catch (err) {

        console.error(err);

        alert("Masalar yüklenemedi.");

    }

}

/* ===========================
   YENİ MASA
=========================== */

newTableButton.addEventListener("click", () => {

    alert("Butona basıldı");

    if (modal) {
        tableName.value = "";
        modal.show();
    }

});

    tableName.value = "";

    modal.show();

});

/* ===========================
   KAYDET
=========================== */

saveTableButton.addEventListener("click", async () => {

    if (tableName.value.trim() === "") {

        alert("Masa adı giriniz.");

        return;

    }

    try {

        await addDoc(
            collection(db, "tables"),
            {
                name: tableName.value.trim(),
                active: true
            }
        );

        modal.hide();

        await loadTables();

        alert("Masa oluşturuldu.");

    } catch (err) {

        console.error(err);

        alert("Masa oluşturulamadı.");

    }

});

/* ===========================
   BAŞLAT
=========================== */

loadTables();
