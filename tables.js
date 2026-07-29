import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const tableList = document.getElementById("tableList");

async function loadTables(){

    const snapshot = await getDocs(
        collection(db,"tables")
    );

    tableList.innerHTML="";

    snapshot.forEach(doc=>{

        const table=doc.data();

        tableList.innerHTML+=`

        <div class="col-md-4 mb-4">

            <div class="card shadow">

                <div class="card-body text-center">

                    <h3>🪑 ${table.name}</h3>

                    <p>

                        ${
                            table.active
                            ? "🟢 Aktif"
                            : "🔴 Pasif"
                        }

                    </p>

                    <button
                        class="btn btn-primary w-100">

                        QR Kod Oluştur

                    </button>

                </div>

            </div>

        </div>

        `;

    });

}

loadTables();
