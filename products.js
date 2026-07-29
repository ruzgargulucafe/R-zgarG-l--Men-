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

// Ürünleri Listele
async function listele() {

    productList.innerHTML = "<p>Yükleniyor...</p>";

    try {

        const snapshot = await getDocs(collection(db, "products"));

        productList.innerHTML = "";

        if (snapshot.empty) {
            productList.innerHTML = "<p>Henüz ürün yok.</p>";
            return;
        }

        snapshot.forEach((doc) => {

            const p = doc.data();

            productList.innerHTML += `
                <div class="product">

                    ${p.image ? `<img src="${p.image}" class="productImage">` : ""}

                    <h3>${p.name}</h3>

                    <p>${p.description || ""}</p>

                    <p><strong>Kategori:</strong> ${p.category}</p>

                    <p><strong>Fiyat:</strong> ₺${Number(p.price).toLocaleString("tr-TR")}</p>

                </div>
            `;

        });

    } catch (err) {

        productList.innerHTML =
            `<p style="color:red;">${err.message}</p>`;

        console.error(err);

    }

}

// Ürün Kaydet
saveProduct.addEventListener("click", async () => {

    if (name.value.trim() === "") {
        alert("Ürün adı boş olamaz.");
        return;
    }

    if (price.value.trim() === "") {
        alert("Fiyat giriniz.");
        return;
    }

    try {

        const docRef = await addDoc(collection(db, "products"), {

            name: name.value.trim(),
            description: description.value.trim(),
            price: Number(price.value),
            category: category.value,
            active: true,
            image: ""

        });

        alert("Ürün eklendi.\nBelge ID: " + docRef.id);

        name.value = "";
        description.value = "";
        price.value = "";

        await listele();

    } catch (err) {

        console.error(err);

        alert("HATA:\n\n" + err.message);

    }

});

// Sayfa Açılışı
listele();
