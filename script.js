document.addEventListener("DOMContentLoaded", () => {

    const accordions = document.querySelectorAll(".accordion");
    const addButtons = document.querySelectorAll(".sepeteEkle");

    const cartButton = document.getElementById("cartButton");
    const cartPanel = document.getElementById("cartPanel");
    const closeCart = document.getElementById("closeCart");

    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    const cartCount = document.getElementById("cartCount");

    // Sepet
    localStorage.removeItem("cart");
let cart = JSON.parse(localStorage.getItem("cart")) || [];
// Sepeti Kaydet
function kaydetSepet() {
    localStorage.setItem("cart", JSON.stringify(cart));
}
    
    // Kategoriler
    accordions.forEach(btn => {
        btn.onclick = () => {
            const panel = btn.nextElementSibling;
            panel.style.display =
                panel.style.display === "block" ? "none" : "block";
        };
    });

    // Sepete ekle
    addButtons.forEach(btn => {

    btn.onclick = () => {

        const isim = btn.dataset.urun;
        const fiyat = Number(btn.dataset.fiyat);

        const urun = cart.find(item => item.isim === isim);

        if (urun) {

            urun.adet++;

        } else {

            cart.push({
                isim: isim,
                fiyat: fiyat,
                adet: 1
            });

        }

        kaydetSepet();
        guncelleSepet();

    };

});

    // Sepeti aç
    cartButton.onclick = () => {
        cartPanel.classList.add("active");
    };

    // Sepeti kapat
    closeCart.onclick = () => {
        cartPanel.classList.remove("active");
    };

    function guncelleSepet() {

    cartItems.innerHTML = "";

    let toplam = 0;

    if (cart.length === 0) {

        cartItems.innerHTML = "<p>Henüz ürün eklenmedi.</p>";
        cartCount.textContent = "0";
        cartTotal.textContent = "₺0";
        return;
    }

    cart.forEach(item => {

        const araToplam = item.fiyat * item.adet;
        toplam += araToplam;

        cartItems.innerHTML += `
<div class="urun">

    <h3>${item.isim}</h3>

    <div class="adetKontrol">

        <button class="azalt" data-urun="${item.isim}">−</button>

        <span>${item.adet}</span>

        <button class="arttir" data-urun="${item.isim}">+</button>

    </div>

    <div class="fiyat">
        ₺${item.fiyat} × ${item.adet} = ₺${araToplam}
    </div>

    <button class="silUrun" data-urun="${item.isim}">
        🗑️ Kaldır
    </button>

</div>
`;

    });

    const toplamAdet = cart.reduce((t, item) => t + item.adet, 0);

    cartCount.textContent = toplamAdet;
    cartTotal.textContent = `₺${toplam}`;

    kaydetSepet();
        // Artır
document.querySelectorAll(".arttir").forEach(btn => {

    btn.onclick = () => {

        const urun = cart.find(i => i.isim === btn.dataset.urun);

        urun.adet++;

        kaydetSepet();
        guncelleSepet();

    };

});

// Azalt
document.querySelectorAll(".azalt").forEach(btn => {

    btn.onclick = () => {

        const urun = cart.find(i => i.isim === btn.dataset.urun);

        urun.adet--;

        if (urun.adet <= 0) {
            cart = cart.filter(i => i.isim !== urun.isim);
        }

        kaydetSepet();
        guncelleSepet();

    };

});

// Sil
document.querySelectorAll(".silUrun").forEach(btn => {

    btn.onclick = () => {

        cart = cart.filter(i => i.isim !== btn.dataset.urun);

        kaydetSepet();
        guncelleSepet();

    };

});
    } // silUrun forEach bitti

} // guncelleSepet bitti

guncelleSepet();

}); // DOMContentLoaded bitti
