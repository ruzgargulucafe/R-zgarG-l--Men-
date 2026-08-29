const firebaseConfig = {
  apiKey: "AIzaSyCj4F_8WOwLzVoREs-gRZDXfgYEkLtNvig",
  authDomain: "ruzgarguluqr.firebaseapp.com",
  projectId: "ruzgarguluqr",
  storageBucket: "ruzgarguluqr.firebasestorage.app",
  messagingSenderId: "1034312304751",
  appId: "1:1034312304751:web:3b0e15ba06a937455a659a"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();
