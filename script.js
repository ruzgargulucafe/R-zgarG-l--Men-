import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

    const menuContent = document.getElementById("menuContent");

    const cartButton = document.getElementById("cartButton");
    const cartPanel = document.getElementById("cartPanel");
    const closeCart = document.getElementById("closeCart");

    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    const cartCount = document.getElementById("cartCount");
    const clearCart = document.getElementById("clearCart");

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    function kaydetSepet() {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    async function menuyuYukle() {

        const snapshot = await getDocs(collection(db, "products"));

        const kategoriler = {};

        snapshot.forEach((doc) => {

            const urun = doc.data();

            if (!urun.active) return;

            if (!kategoriler[urun.category]) {
                kategoriler[urun.category] = [];
            }

            kategoriler[urun.category].push(urun);

        });

        menuContent.innerHTML = "";

        Object.keys(kategoriler).forEach((kategori) => {

            let html = `

            <section class="kategori">

                <button class="accordion">

                    ${kategori}

                </button>

                <div class="panel">

            `;

            kategoriler[kategori].forEach((urun) => {

                html += `

                <div class="urun">

                    <h3>${urun.name}</h3>

                    <p>${urun.description}</p>

                    <div class="fiyat">

                        ₺${urun.price}

                    </div>

                    <button
                        class="sepeteEkle"
                        data-urun="${urun.name}"
                        data-fiyat="${urun.price}">

                        Sepete Ekle

                    </button>

                </div>

                `;

            });

            html += `

                </div>

            </section>

            `;

            menuContent.innerHTML += html;

        });

        menuEventleriniBagla();

    }

    function menuEventleriniBagla() {

        document.querySelectorAll(".accordion").forEach(btn => {

            btn.onclick = () => {

                const panel = btn.nextElementSibling;

                panel.style.display =
                    panel.style.display === "block"
                    ? "none"
                    : "block";

            };

        });

        document.querySelectorAll(".sepeteEkle").forEach(btn => {

            btn.onclick = () => {

                const isim = btn.dataset.urun;
                const fiyat = Number(btn.dataset.fiyat);

                const mevcut = cart.find(x => x.isim === isim);

                if (mevcut) {

                    mevcut.adet++;

                } else {

                    cart.push({
                        isim,
                        fiyat,
                        adet: 1
                    });

                }

                kaydetSepet();
                guncelleSepet();

            };

        });

    }
                 // SEPET AÇ
    cartButton.addEventListener("click", () => {
        cartPanel.classList.add("active");
    });

    // SEPET KAPAT
    closeCart.addEventListener("click", () => {
        cartPanel.classList.remove("active");
    });

    // SEPETİ TEMİZLE
    if (clearCart) {

        clearCart.addEventListener("click", () => {

            if (confirm("Sepeti temizlemek istiyor musunuz?")) {

                cart = [];

                kaydetSepet();

                guncelleSepet();

            }

        });

    }

    function guncelleSepet() {

        cartItems.innerHTML = "";

        if (cart.length === 0) {

            cartItems.innerHTML =
                "<p>Henüz ürün eklenmedi.</p>";

            cartCount.textContent = "0";
            cartTotal.textContent = "₺0";

            return;

        }

        let toplam = 0;

        cart.forEach(item => {

            const araToplam =
                item.fiyat * item.adet;

            toplam += araToplam;

            cartItems.innerHTML += `

            <div class="urun">

                <h3>${item.isim}</h3>

                <div class="adetKontrol">

                    <button
                        class="azalt"
                        data-urun="${item.isim}">

                        −

                    </button>

                    <span>${item.adet}</span>

                    <button
                        class="arttir"
                        data-urun="${item.isim}">

                        +

                    </button>

                </div>

                <div class="fiyat">

                    ₺${item.fiyat}
                    ×
                    ${item.adet}
                    =
                    ₺${araToplam}

                </div>

                <button
                    class="silUrun"
                    data-urun="${item.isim}">

                    🗑️ Kaldır

                </button>

            </div>

            `;

        });

        cartCount.textContent =
            cart.reduce((t, u) => t + u.adet, 0);

        cartTotal.textContent =
            `₺${toplam}`;

        kaydetSepet();

        document.querySelectorAll(".arttir").forEach(btn => {

            btn.onclick = () => {

                const urun =
                    cart.find(
                        u => u.isim === btn.dataset.urun
                    );

                urun.adet++;

                kaydetSepet();

                guncelleSepet();

            };

        });

        document.querySelectorAll(".azalt").forEach(btn => {

            btn.onclick = () => {

                const urun =
                    cart.find(
                        u => u.isim === btn.dataset.urun
                    );

                urun.adet--;

                if (urun.adet <= 0) {

                    cart =
                        cart.filter(
                            u => u.isim !== urun.isim
                        );

                }

                kaydetSepet();

                guncelleSepet();

            };

        });

        document.querySelectorAll(".silUrun").forEach(btn => {

            btn.onclick = () => {

                cart =
                    cart.filter(
                        u => u.isim !== btn.dataset.urun
                    );

                kaydetSepet();

                guncelleSepet();

            };

        });

    }
        // SİPARİŞ
    const finishOrder = document.getElementById("finishOrder");
    const masaNo = document.getElementById("masaNo");
    const orderNote = document.getElementById("orderNote");

    finishOrder.addEventListener("click", async () => {

        if (cart.length === 0) {
            alert("Sepetiniz boş.");
            return;
        }

        if (masaNo.value === "") {
            alert("Lütfen masa numarasını seçiniz.");
            return;
        }

        const toplam = cart.reduce(
            (t, u) => t + (u.fiyat * u.adet),
            0
        );

        try {

            await addDoc(collection(db, "orders"), {

                masa: masaNo.value,
                not: orderNote.value,
                urunler: cart,
                toplam: toplam,
                durum: "Yeni Sipariş",
                tarih: serverTimestamp()

            });

        } catch (e) {

            alert(
                "Firebase Hatası\n\n" +
                e.message
            );

            return;

        }

        let mesaj =
`🍽️ Rüzgar Gülü Cafe & Beach Restaurant

🪑 Masa No: ${masaNo.value}

📋 Sipariş

${cart.map(item =>
`• ${item.adet} x ${item.isim} - ₺${item.fiyat * item.adet}`
).join("\n")}

💰 Toplam: ₺${toplam}

📝 Sipariş Notu:
${orderNote.value || "-"}`;

        const telefon = "905428351609";

        window.location.href =
            `https://wa.me/${telefon}?text=${encodeURIComponent(mesaj)}`;

        cart = [];

        kaydetSepet();

        guncelleSepet();

        orderNote.value = "";

        masaNo.value = "";

    });

    // SAYFA AÇILIŞI
    guncelleSepet();
    menuyuYukle();

});
