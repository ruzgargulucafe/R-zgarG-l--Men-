import { db } from "./firebase.js";
alert("script.js çalıştı");
import {
collection,
getDocs,
addDoc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// =========================
// HTML Elemanları
// =========================

const menuContent = document.getElementById("menuContent");

const cartButton = document.getElementById("cartButton");

const cartPanel = document.getElementById("cartPanel");

const closeCart = document.getElementById("closeCart");

const cartItems = document.getElementById("cartItems");

const cartCount = document.getElementById("cartCount");

const cartTotal = document.getElementById("cartTotal");

const clearCart = document.getElementById("clearCart");

const finishOrder = document.getElementById("finishOrder");

const masaNo = document.getElementById("masaNo");

const orderNote = document.getElementById("orderNote");

// =========================
// Sepet
// =========================

let cart = JSON.parse(localStorage.getItem("cart")) || [];

let products = [];


// =========================
// Menü Yükle
// =========================

async function loadProducts() {

menuContent.innerHTML = `
<h2 style="text-align:center;padding:40px;">
Menü Yükleniyor...
</h2>
`;

try {

const snapshot = await getDocs(collection(db,"products"));

products = [];

snapshot.forEach(doc=>{

const data = doc.data();

if(data.active){

products.push({

id:doc.id,

...data

});

}

});

renderMenu();

}
catch(err){

console.error(err);

menuContent.innerHTML = `
<h2 style="color:red;text-align:center;padding:30px;">
${err.message}
</h2>
`;

}


// =========================
// Menü Oluştur
// =========================

function renderMenu(){

const kategoriler = [...new Set(products.map(x=>x.category))];

let html="";

kategoriler.forEach(kategori=>{

html+=`

<div class="category">

<div class="categoryHeader">

${kategori}

</div>

<div class="categoryBody" style="display:none;">

`;

products
.filter(x=>x.category===kategori)
.forEach(urun=>{

html+=`

<div class="product">

<div class="productLeft">

${urun.image ? `
<img src="${urun.image}" class="productImage">
` : ""}

<h3>${urun.name}</h3>

<p>${urun.description || ""}</p>

<strong>₺${Number(urun.price).toLocaleString("tr-TR")}</strong>

</div>

<div class="productRight">

<button
class="addCart"
data-id="${urun.id}">
Sepete Ekle
</button>

</div>

</div>

`;

});

html+=`

</div>

</div>

`;

});

menuContent.innerHTML=html;
// =========================
// Accordion
// =========================

document.querySelectorAll(".categoryHeader").forEach(header=>{

header.addEventListener("click",()=>{

const body=header.nextElementSibling;

document.querySelectorAll(".categoryBody").forEach(item=>{

if(item!==body){

item.style.display="none";

}

});

body.style.display=
body.style.display==="block"
? "none"
: "block";

});

});

// =========================
// Sepete Ekle
// =========================

document.querySelectorAll(".addCart").forEach(btn=>{

btn.addEventListener("click",()=>{

const id=btn.dataset.id;

const urun=products.find(x=>x.id===id);

if(!urun) return;

const mevcut=cart.find(x=>x.id===id);

if(mevcut){

mevcut.adet++;

}
else{

cart.push({

id:urun.id,

name:urun.name,

price:Number(urun.price),

adet:1

});

}

saveCart();

});

});

}

// =========================
// Sepeti Kaydet
// =========================

function saveCart(){

localStorage.setItem(
"cart",
JSON.stringify(cart)
);

updateCart();

}

// =========================
// Sepeti Güncelle
// =========================

function updateCart(){

cartCount.innerText=cart.reduce(
(toplam,x)=>toplam+x.adet,
0
);

if(cart.length===0){

cartItems.innerHTML="Henüz ürün eklenmedi.";

cartTotal.innerHTML="₺0";

return;

}

let html="";

let toplam=0;

cart.forEach((urun,index)=>{

const tutar=urun.price*urun.adet;

toplam+=tutar;

html+=`

<div class="cartItem">

<div>

<strong>${urun.name}</strong>

<br>

₺${urun.price.toLocaleString("tr-TR")}

</div>

<div class="cartButtons">

<button
class="eksi"
data-index="${index}">

−

</button>

<span>

${urun.adet}

</span>

<button
class="arti"
data-index="${index}">

+

</button>

<button
class="sil"
data-index="${index}">

🗑

</button>

</div>

</div>

`;

});

cartItems.innerHTML=html;

cartTotal.innerHTML=
"₺"+
toplam.toLocaleString("tr-TR");

bindCartButtons();

}
// =========================
// Sepet Butonları
// =========================

function bindCartButtons(){

document.querySelectorAll(".arti").forEach(btn=>{

btn.onclick=()=>{

const index=Number(btn.dataset.index);

cart[index].adet++;

saveCart();

};

});

document.querySelectorAll(".eksi").forEach(btn=>{

btn.onclick=()=>{

const index=Number(btn.dataset.index);

cart[index].adet--;

if(cart[index].adet<=0){

cart.splice(index,1);

}

saveCart();

};

});

document.querySelectorAll(".sil").forEach(btn=>{

btn.onclick=()=>{

const index=Number(btn.dataset.index);

cart.splice(index,1);

saveCart();

};

});

}

// =========================
// Sepeti Temizle
// =========================

clearCart.addEventListener("click",()=>{

if(!confirm("Sepet temizlensin mi?")) return;

cart=[];

saveCart();

});

// =========================
// Sepet Paneli
// =========================

cartButton.addEventListener("click",()=>{

cartPanel.classList.add("active");

});

closeCart.addEventListener("click",()=>{

cartPanel.classList.remove("active");

});

// =========================
// Siparişi Tamamla
// =========================

finishOrder.addEventListener("click",async()=>{

if(cart.length===0){

alert("Sepet boş.");

return;

}

if(masaNo.value===""){

alert("Lütfen masa seçiniz.");

return;

}

const toplam=cart.reduce((t,x)=>{

return t+(x.price*x.adet);

},0);

const siparis={

masa:masaNo.value,

not:orderNote.value,

urunler:cart,

toplam,

durum:"Yeni Sipariş",

tarih:serverTimestamp()

};

try{

await addDoc(

collection(db,"orders"),

siparis

);

alert("Siparişiniz başarıyla gönderildi.");
cart=[];
localStorage.removeItem("cart");
orderNote.value="";

masaNo.value="";

saveCart();

cartPanel.classList.remove("active");

// =========================
// WhatsApp Mesajı
// =========================

let mesaj="🍽️ Rüzgar Gülü Cafe & Beach Restaurant\n\n";

mesaj+="📍 Masa: "+siparis.masa+"\n\n";

mesaj+="🛒 Siparişler\n\n";

siparis.urunler.forEach(item=>{

mesaj+=`${item.name} x${item.adet} = ₺${(item.price*item.adet).toLocaleString("tr-TR")}\n`;

});

mesaj+=`\n💰 Toplam: ₺${toplam.toLocaleString("tr-TR")}`;

if(siparis.not.trim()!==""){

mesaj+=`\n\n📝 Not:\n${siparis.not}`;

}

// Telefon numarasını kendi numaranla değiştir
const telefon="905428351609";

window.open(
`https://wa.me/${telefon}?text=${encodeURIComponent(mesaj)}`,
"_blank"
);

}
catch(err){

console.error(err);

alert("Sipariş gönderilirken hata oluştu.");

}

});

// =========================
// Sayfa Açılışı
// =========================

updateCart();
const params = new URLSearchParams(window.location.search);

const masa = params.get("masa");

if(masa){

    masaNo.value = masa;

}
loadProducts();

console.log("SCRIPT SON SATIR ÇALIŞTI");
