localStorage.clear();
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

        cart.forEach(item => {

    const araToplam = item.fiyat * item.adet;

    toplam += araToplam;

    cartItems.innerHTML += `
        <div class="urun">

            <h3>${item.isim}</h3>

            <p>Adet: ${item.adet}</p>

            <div class="fiyat">
                ₺${item.fiyat} × ${item.adet} = ₺${araToplam}
            </div>

        </div>
    `;

});

        if(cart.length===0){

            cartItems.innerHTML="<p>Henüz ürün eklenmedi.</p>";

        }

        cartCount.textContent = cart.length;
        cartTotal.textContent = "₺"+toplam;

    }

    guncelleSepet();
});
