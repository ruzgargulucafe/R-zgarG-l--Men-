import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const productCount = document.getElementById("productCount");
const categoryCount = document.getElementById("categoryCount");
const tableCount = document.getElementById("tableCount");
const orderCount = document.getElementById("orderCount");

async function loadDashboard() {

    try {

        const products = await getDocs(collection(db, "products"));
        const categories = await getDocs(collection(db, "categories"));
        const tables = await getDocs(collection(db, "tables"));
        const orders = await getDocs(collection(db, "orders"));

        productCount.textContent = products.size;
        categoryCount.textContent = categories.size;
        tableCount.textContent = tables.size;

        let waiting = 0;

        orders.forEach(doc => {

            const data = doc.data();

            if (data.status === "Bekliyor") {
                waiting++;
            }

        });

        orderCount.textContent = waiting;

    } catch (err) {

        console.error(err);

    }

}

loadDashboard();
