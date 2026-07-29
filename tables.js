import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/* ===========================
   ELEMENTLER
=========================== */

const tableList = document.getElementById("tableList");

const newTableButton = document.getElementById("newTable");
const saveTableButton = document.getElementById("saveTable");

const tableName = document.getElementById("tableName");

const tableModal = new bootstrap.Modal(
    document.getElementById("tableModal")
);

const qrModal = new bootstrap.Modal(
    document.getElementById("qrModal")
);

const qrTitle = document.getElementById("qrTitle");
const qrCode = document.getElementById("qrcode");
const qrLink = document.getElementById("qrLink");

/* ===========================
   DEĞİŞKENLER
=========================== */

let editId = null;

/* ===========================
   YENİ MASA
=========================== */

newTableButton.addEventListener("click", () => {

    editId = null;

    tableName.value = "";

    document.querySelector("#tableModal .modal-title").innerText =
        "Yeni Masa";

    tableModal.show();

});
/* ===========================
   MASALARI YÜKLE
=========================== */

async function loadTables() {

    tableList.innerHTML = "";

    try {

        const snapshot = await getDocs(
            collection(db, "tables")
        );

        snapshot.forEach(item => {

            const table = item.data();
            const id = item.id;

            tableList.innerHTML += `

            <div class="col-lg-4 col-md-6">

                <div class="card shadow border-0 rounded-4">

                    <div class="card-body">

                        <h4 class="text-center mb-3">

                            🪑 ${table.name}

                        </h4>

                        <p class="text-center">

                            ${
                                table.active
                                ? "🟢 Aktif"
                                : "🔴 Pasif"
                            }

                        </p>

                        <div class="d-grid gap-2">

                            <button
                                class="btn btn-primary qrBtn"
                                data-id="${id}"
                                data-name="${table.name}">

                                📱 QR Kod

                            </button>

                            <button
                                class="btn btn-warning editBtn"
                                data-id="${id}"
                                data-name="${table.name}">

                                ✏️ Düzenle

                            </button>

                            <button
                                class="btn btn-danger deleteBtn"
                                data-id="${id}">

                                🗑️ Sil

                            </button>

                        </div>

                    </div>

                </div>

            </div>

            `;

        });

        addEvents();

    } catch (err) {

        console.error(err);

        alert("Masalar yüklenemedi.");

    }

}
/* ===========================
   BUTON EVENTLERİ
=========================== */

function addEvents() {

    /* -----------------------
       QR KOD
    ----------------------- */

    document.querySelectorAll(".qrBtn").forEach(btn => {

        btn.onclick = () => {

            const tableName = btn.dataset.name;

            const url =
                `${location.origin}${location.pathname.replace("tables.html","menu.html")}?table=${encodeURIComponent(tableName)}`;

            qrTitle.innerText = tableName;

            qrLink.innerText = url;

            qrCode.innerHTML = "";

            new QRCode(qrCode,{
                text:url,
                width:250,
                height:250
            });

            qrModal.show();

        };

    });

    /* -----------------------
       DÜZENLE
    ----------------------- */

    document.querySelectorAll(".editBtn").forEach(btn=>{

        btn.onclick=()=>{

            editId=btn.dataset.id;

            tableName.value=btn.dataset.name;

            document.querySelector("#tableModal .modal-title").innerText =
                "Masayı Düzenle";

            tableModal.show();

        };

    });

    /* -----------------------
       SİL
    ----------------------- */

    document.querySelectorAll(".deleteBtn").forEach(btn=>{

        btn.onclick=async()=>{

            if(!confirm("Bu masa silinsin mi?"))
                return;

            try{

                await deleteDoc(
                    doc(db,"tables",btn.dataset.id)
                );

                await loadTables();

            }catch(err){

                console.error(err);

                alert("Masa silinemedi.");

            }

        };

    });

}
/* ===========================
   KAYDET (YENİ / GÜNCELLE)
=========================== */

saveTableButton.addEventListener("click", async () => {

    const name = tableName.value.trim();

    if (name === "") {
        alert("Masa adı giriniz.");
        return;
    }

    try {

        if (editId) {

            await updateDoc(
                doc(db, "tables", editId),
                {
                    name: name
                }
            );

            alert("Masa güncellendi.");

        } else {

            await addDoc(
                collection(db, "tables"),
                {
                    name: name,
                    active: true
                }
            );

            alert("Masa oluşturuldu.");

        }

        tableModal.hide();

        editId = null;

        tableName.value = "";

        await loadTables();

    } catch (err) {

        console.error(err);

        alert("İşlem başarısız.");

    }

});

/* ===========================
   BAŞLAT
=========================== */

loadTables();
