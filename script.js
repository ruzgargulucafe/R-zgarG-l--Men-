document.addEventListener("DOMContentLoaded", () => {

    const accordions = document.querySelectorAll(".accordion");
    const addButtons = document.querySelectorAll(".sepeteEkle");

    const cartButton = document.getElementById("cartButton");
    const cartPanel = document.getElementById("cartPanel");
    const closeCart = document.getElementById("closeCart");

    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    const cartCount = document.getElementById("cartCount");

    let cart = [];

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

            cart.push({
                isim: btn.dataset.urun,
                fiyat: Number(btn.dataset.fiyat)
            });

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

            toplam += item.fiyat;

            cartItems.innerHTML += `
                <div class="urun">
                    <h3>${item.isim}</h3>
                    <div class="fiyat">₺${item.fiyat}</div>
                </div>
            `;

        });

        if(cart.length===0){

            cartItems.innerHTML="<p>Henüz ürün eklenmedi.</p>";

        }

        cartCount.textContent = cart.length;
        cartTotal.textContent = "₺"+toplam;

    }

});
