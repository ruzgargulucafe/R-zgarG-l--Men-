let currentUser = null;

function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
    .then(res => {
        currentUser = res.user;

        if(currentUser.email !== "caferuzgargulu@gmail.com"){
            alert("Yetkisiz!");
            return;
        }

        alert("Giriş başarılı");
        loadProducts();
        loadOrders();
    })
    .catch(err => alert(err.message));
}

function addProduct() {
    const name = document.getElementById("name").value;
    const price = document.getElementById("price").value;

    db.collection("products").add({
        name,
        price
    });
}

function deleteProduct(id) {
    db.collection("products").doc(id).delete();
}

function loadProducts() {
    db.collection("products").onSnapshot(snapshot => {
        const div = document.getElementById("products");
        div.innerHTML = "";

        snapshot.forEach(doc => {
            const p = doc.data();

            div.innerHTML += `
                <div>
                    ${p.name} - ${p.price} ₺
                    <button onclick="deleteProduct('${doc.id}')">Sil</button>
                </div>
            `;
        });
    });
}

function loadOrders() {
    db.collection("orders").onSnapshot(snapshot => {
        const div = document.getElementById("orders");
        div.innerHTML = "";

        snapshot.forEach(doc => {
            const o = doc.data();

            div.innerHTML += `
                <div class="order">
                    Masa: ${o.table} <br>
                    ${o.items.map(i => i.name).join(", ")} <br>
                    Durum: ${o.status}
                </div>
            `;
        });
    });
}
