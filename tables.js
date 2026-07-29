import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const tableList = document.getElementById("tableList");

async function loadTables() {

    const snapshot = await getDocs(collection(db, "tables"));

    tableList.innerHTML = "";

    snapshot.forEach(doc => {

        const table = doc.data();

        tableList.innerHTML += `
            <div class="col-md-4 mb-3">

                <div class="card shadow-sm">

                    <div class="card-body text-center">

                        <h3>🪑 ${table.name}</h3>

                        <p>${table.active ? "🟢 Aktif" : "🔴 Pasif"}</p>

                    </div>

                </div>

            </div>
        `;

    });

}

loadTables();
