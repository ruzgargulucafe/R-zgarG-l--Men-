document.addEventListener("DOMContentLoaded", () => {

    const accordions = document.querySelectorAll(".accordion");
    const cartCount = document.getElementById("cartCount");
    const addButtons = document.querySelectorAll(".sepeteEkle");

    let sepet = 0;

    // Kategorileri aç/kapat
    accordions.forEach(button => {
        button.addEventListener("click", () => {

            const panel = button.nextElementSibling;

            if (panel.style.display === "block") {
                panel.style.display = "none";
            } else {
                panel.style.display = "block";
            }
        });
    });

    // Sepete ekle
    addButtons.forEach(button => {
        button.addEventListener("click", () => {

            sepet++;
            cartCount.textContent = sepet;

            button.textContent = "✅ Sepete Eklendi";

            setTimeout(() => {
                button.textContent = "Sepete Ekle";
            }, 1000);

        });
    });

});
