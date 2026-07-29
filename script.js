import { db } from "./firebase.js";

import {
collection,
addDoc,
serverTimestamp,
getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
const menuContent =
document.getElementById("menuContent");
    // ELEMENTLER

    const cartButton = document.getElementById("cartButton");
    const cartPanel = document.getElementById("cartPanel");
    const closeCart = document.getElementById("closeCart");

    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    const cartCount = document.getElementById("cartCount");
    const clearCart = document.getElementById("clearCart");

    // SEPET
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    function kaydetSepet() {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    // ACCORDION
    
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
    // SEPETE EKLE
    
            }

            kaydetSepet();
            guncelleSepet();
            
        
        });

    });

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

    // GÜNCELLE
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

            const araToplam = item.fiyat * item.adet;

            toplam += araToplam;

            cartItems.innerHTML += `
            <div class="urun">

                <h3>${item.isim}</h3>

                <div class="adetKontrol">

                    <button class="azalt"
                        data-urun="${item.isim}">
                        −
                    </button>

                    <span>${item.adet}</span>

                    <button class="arttir"
                        data-urun="${item.isim}">
                        +
                    </button>

                </div>

                <div class="fiyat">
                    ₺${item.fiyat} × ${item.adet} = ₺${araToplam}
                </div>

                <button class="silUrun"
                    data-urun="${item.isim}">
                    🗑️ Kaldır
                </button>

            </div>
            `;

        });

        cartCount.textContent =
            cart.reduce((t, u) => t + u.adet, 0);

        cartTotal.textContent = `₺${toplam}`;

        kaydetSepet();
        // ARTIR
        document.querySelectorAll(".arttir").forEach(btn => {

            btn.addEventListener("click", () => {

                const urun = cart.find(u => u.isim === btn.dataset.urun);

                if (!urun) return;

                urun.adet++;

                kaydetSepet();
                guncelleSepet();

            });

        });

        // AZALT
        document.querySelectorAll(".azalt").forEach(btn => {

            btn.addEventListener("click", () => {

                const urun = cart.find(u => u.isim === btn.dataset.urun);

                if (!urun) return;

                urun.adet--;

                if (urun.adet <= 0) {
                    cart = cart.filter(u => u.isim !== urun.isim);
                }

                kaydetSepet();
                guncelleSepet();

            });

        });

        // SİL
        document.querySelectorAll(".silUrun").forEach(btn => {

            btn.addEventListener("click", () => {

                cart = cart.filter(u => u.isim !== btn.dataset.urun);

                kaydetSepet();
                guncelleSepet();

            });

        });

    }

    // SAYFA AÇILINCA
    const finishOrder = document.getElementById("finishOrder");
const masaNo = document.getElementById("masaNo");
const orderNote = document.getElementById("orderNote");
finishOrder.addEventListener("click", async () => {
    alert("Buton çalıştı");
    if (cart.length === 0) {
        alert("Sepetiniz boş.");
        return;
    }

    if (masaNo.value === "") {
    alert("Lütfen masa numarasını seçiniz.");
    return;
}
console.log("Masa:", masaNo.value);
console.log("Not:", orderNote.value);
    const toplam = cart.reduce((t, u) => t + (u.fiyat * u.adet), 0);
    try {

    console.log("1 - Firebase kayıt başlıyor");

    const docRef = await addDoc(collection(db, "orders"), {

        masa: masaNo.value,
        not: orderNote.value,
        urunler: cart,
        toplam: toplam,
        durum: "Yeni Sipariş",
        tarih: serverTimestamp()

    });

    console.log("2 - Başarılı");
    console.log(docRef.id);

} catch (e) {

    console.error(e);

    alert(
        "Firebase Hatası:\n\n" +
        e.code +
        "\n\n" +
        e.message
    );

    return;

}

let mesaj =
`🍽️ Rüzgar Gülü Cafe & Beach Restaurant

🪑 Masa No: ${masaNo.value}

📋 Sipariş:

${cart.map(item => `• ${item.adet} x ${item.isim} - ₺${item.fiyat * item.adet}`).join("\n")}

💰 Toplam: ₺${toplam}

📝 Sipariş Notu:
${orderNote.value || "-"}`;
    // BURAYA KENDİ TELEFON NUMARANI YAZ
    const telefon = "905428351609";

    const url = `https://wa.me/${telefon}?text=${encodeURIComponent(mesaj)}`;
window.location.href = url;
cart = [];
kaydetSepet();
guncelleSepet();
orderNote.value = "";
masaNo.value = "";
    
});
    guncelleSepet();
menuyuYukle();
            function menuEventleriniBagla() {

    // Accordion
    document.querySelectorAll(".accordion").forEach(btn => {

        btn.onclick = () => {

            const panel = btn.nextElementSibling;

            panel.style.display =
                panel.style.display === "block"
                ? "none"
                : "block";

        };

    });

    // Sepete Ekle
    document.querySelectorAll(".sepeteEkle").forEach(btn => {

        btn.onclick = () => {

            const isim = btn.dataset.urun;
            const fiyat = Number(btn.dataset.fiyat);

            const mevcut = cart.find(u => u.isim === isim);

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
});
