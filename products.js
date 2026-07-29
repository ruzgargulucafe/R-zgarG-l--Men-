import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const name = document.getElementById("name");
const description = document.getElementById("description");
const price = document.getElementById("price");
const category = document.getElementById("category");

const saveProduct = document.getElementById("saveProduct");
const productList = document.getElementById("productList");

async function listele() {

    productList.innerHTML = "";

    const snapshot = await getDocs(collection(db, "products"));

    snapshot.forEach((doc) => {

        const p = doc.data();

        productList.innerHTML += `

        <div class="product">

            <h3>${p.name}</h3>

            <p>${p.description}</p>

            <p><strong>Kategori:</strong> ${p.category}</p>

            <p><strong>Fiyat:</strong> ₺${p.price}</p>

        </div>

        `;

    });

}

saveProduct.addEventListener("click", async () => {
alert("Buton çalıştı");
  
    if (name.value.trim() === "") {

        alert("Ürün adı boş olamaz.");

        return;

    }

    await addDoc(collection(db, "products"), {

        name: name.value,
        description: description.value,
        price: Number(price.value),
        category: category.value,
        active: true,
        image: ""

    });

    name.value = "";
    description.value = "";
    price.value = "";

    alert("Ürün eklendi.");

    listele();

});

listele();
