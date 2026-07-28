document.addEventListener("DOMContentLoaded", () => {

    // ELEMENTLER
    const accordions = document.querySelectorAll(".accordion");
    const addButtons = document.querySelectorAll(".sepeteEkle");

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
    accordions.forEach(btn => {
        btn.addEventListener("click", () => {

            const panel = btn.nextElementSibling;

            if (panel.style.display === "block") {
                panel.style.display = "none";
            } else {
                panel.style.display = "block";
            }

        });
    });

    // SEPETE EKLE
    addButtons.forEach(btn => {

        btn.addEventListener("click", () => {

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

finishOrder.addEventListener("click", () => {

    if (cart.length === 0) {
        alert("Sepetiniz boş.");
        return;
    }

    let mesaj = "🍽️ Rüzgar Gülü Cafe & Beach Restaurant\n\n";
    mesaj += "📋 Sipariş:\n\n";

    cart.forEach(item => {
        mesaj += `• ${item.adet} x ${item.isim} - ₺${item.fiyat * item.adet}\n`;
    });

    const toplam = cart.reduce((t, u) => t + (u.fiyat * u.adet), 0);

    mesaj += `\n💰 Toplam: ₺${toplam}`;

    // BURAYA KENDİ TELEFON NUMARANI YAZ
    const telefon = "905428351609";

    const url = `https://wa.me/${telefon}?text=${encodeURIComponent(mesaj)}`;
window.location.href = url;

});
    guncelleSepet();

});
