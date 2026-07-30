alert("waiter.js çalışıyor");

const testQuery = query(collection(db, "calls"));

onSnapshot(
    testQuery,
    (snapshot) => {
        alert("Calls: " + snapshot.size);
    },
    (error) => {
        alert(error.message);
    }
);
