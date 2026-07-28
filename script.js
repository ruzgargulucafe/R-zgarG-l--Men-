document.addEventListener("DOMContentLoaded", () => {

    const buttons = document.querySelectorAll(".kategori");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            button.classList.toggle("aktif");
        });
    });

});
