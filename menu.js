import { db } from "./firebase.js";
import { collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

let cart=[];

async function load(){
const snap=await getDocs(collection(db,"products"));

let html="";

snap.forEach(d=>{
const p=d.data();

html+=`
<div>
<h3>${p.name}</h3>
<p>${p.description}</p>
<b>₺${p.price}</b>
<button onclick="add('${p.name}',${p.price})">Sepete</button>
</div>
`;
});

menu.innerHTML=html;
}

window.add=(n,p)=>{
cart.push({name:n,price:p});
};

window.sendOrder=async()=>{
await addDoc(collection(db,"orders"),{
items:cart,
total:cart.reduce((a,b)=>a+b.price,0),
status:"Bekliyor",
createdAt:new Date()
});
alert("Gönderildi");
cart=[];
};

load();
