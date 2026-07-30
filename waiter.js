import { db } from "./firebase.js";

import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const callsDiv = document.getElementById("calls");

const q = query(
    collection(db,"calls"),
    orderBy("createdAt","desc")
);

onSnapshot(q,(snapshot)=>{

    callsDiv.innerHTML="";

    snapshot.forEach((document)=>{

        const call=document.data();
        const id=document.id;

        if(call.status==="Tamamlandı") return;

        callsDiv.innerHTML+=`

<div class="card">

<h2>🔔 ${call.table}</h2>

<p>Garson çağırıyor.</p>

<button
class="doneBtn"
data-id="${id}">

✅ Tamamlandı

</button>

</div>

`;

    });

    document.querySelectorAll(".doneBtn").forEach((btn)=>{

        btn.onclick=async()=>{

            await updateDoc(
                doc(db,"calls",btn.dataset.id),
                {
                    status:"Tamamlandı"
                }
            );

        };

    });

});
