import { db } from "./firebase.js";

import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    where,
    getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const notificationSound = new Audio("./assets/notification.mp3");

// Sayaçlar
let lastCallCount = 0;
let lastBillCount = 0;

// Sayfa elemanları
const callsDiv = document.getElementById("calls");
const billsDiv = document.getElementById("bills");
const tablesDiv = document.getElementById("tables");

const waitingCount = document.getElementById("waitingCount");
const callCount = document.getElementById("callCount");
const billCount = document.getElementById("billCount");

// Modal
const billModal = document.getElementById("billModal");
const modalTable = document.getElementById("modalTable");
const modalItems = document.getElementById("modalItems");
const modalTotal = document.getElementById("modalTotal");

const closeBillBtn = document.getElementById("closeBillBtn");
const cancelBillBtn = document.getElementById("cancelBillBtn");

const splitArea = document.getElementById("splitArea");
const cashAmount = document.getElementById("cashAmount");
const cardAmount = document.getElementById("cardAmount");

// Seçili masa
let selectedBillId = null;
let selectedTable = null;
let selectedTotal = 0;

// Test
console.log("Waiter.js yüklendi.");
