import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/* ===========================
   DOM
=========================== */

const categoryList = document.getElementById("categoryList");
const searchInput = document.getElementById("searchCategory");

const totalCategories = document.getElementById("totalCategories");
const activeCategories = document.getElementById("activeCategories");

const modal = new bootstrap.Modal(
    document.getElementById("categoryModal")
);

const categoryName =
    document.getElementById("categoryName");

const categoryActive =
    document.getElementById("categoryActive");

const saveButton =
    document.getElementById("saveCategory");

const newButton =
    document.getElementById("newCategory");

/* ===========================
   GLOBAL
=========================== */

let categories = [];
let editingId = null;

/* ===========================
   KATEGORİLERİ YÜKLE
=========================== */

async function loadCategories() {

    try {

        const snapshot =
            await getDocs(collection(db, "categories"));

        categories = [];

        snapshot.forEach(item => {

            categories.push({
                id: item.id,
                ...item.data()
            });

        });

        updateDashboard();

        renderCategories(categories);

    } catch (err) {

        console.error(err);

        alert("Kategoriler yüklenemedi.");

    }

}
/* ===========================
   DASHBOARD
=========================== */

function updateDashboard() {

    totalCategories.textContent = categories.length;

    activeCategories.textContent =
        categories.filter(c => c.active).length;

}

/* ===========================
   KATEGORİLERİ GÖSTER
=========================== */

function renderCategories(list) {

    categoryList.innerHTML = "";

    if (list.length === 0) {

        categoryList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning text-center">
                    Henüz kategori eklenmemiş.
                </div>
            </div>
        `;

        return;

    }

    list
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .forEach(category => {

            categoryList.innerHTML += `

            <div class="col-lg-4 col-md-6">

                <div class="card shadow-sm h-100">

                    <div class="card-body">

                        <h5 class="fw-bold">
                            📂 ${category.name}
                        </h5>

                        <p class="text-muted">

                            Sıra :
                            <strong>${category.order ?? "-"}</strong>

                        </p>

                        <span class="badge ${
                            category.active
                                ? "bg-success"
                                : "bg-secondary"
                        }">

                            ${
                                category.active
                                    ? "Aktif"
                                    : "Pasif"
                            }

                        </span>

                        <div class="d-grid gap-2 mt-3">

                            <button
                                class="btn btn-warning editCategory"
                                data-id="${category.id}">

                                ✏️ Düzenle

                            </button>

                            <button
                                class="btn btn-danger deleteCategory"
                                data-id="${category.id}">

                                🗑️ Sil

                            </button>

                        </div>

                    </div>

                </div>

            </div>

            `;

        });

    bindEvents();

}
/* ===========================
   EVENTLER
=========================== */

function bindEvents() {

    // Düzenle
    document.querySelectorAll(".editCategory").forEach(button => {

        button.addEventListener("click", () => {

            openEditModal(button.dataset.id);

        });

    });

    // Sil
    document.querySelectorAll(".deleteCategory").forEach(button => {

        button.addEventListener("click", () => {

            deleteCategory(button.dataset.id);

        });

    });

}

/* ===========================
   ARAMA
=========================== */

searchInput.addEventListener("input", () => {

    const value = searchInput.value
        .trim()
        .toLowerCase();

    if (value === "") {

        renderCategories(categories);

        return;

    }

    const filtered = categories.filter(category =>

        (category.name || "")
            .toLowerCase()
            .includes(value)

    );

    renderCategories(filtered);

});

/* ===========================
   FORMU TEMİZLE
=========================== */

function clearForm() {

    editingId = null;

    categoryName.value = "";

    categoryActive.checked = true;

}

/* ===========================
   MODAL AÇ
=========================== */

function openEditModal(id) {

    const category = categories.find(c => c.id === id);

    if (!category) return;

    editingId = id;

    categoryName.value = category.name || "";

    categoryActive.checked = category.active;

    modal.show();

}

/* ===========================
   YENİ KATEGORİ
=========================== */

newButton.addEventListener("click", () => {

    clearForm();

    modal.show();

});
/* ===========================
   KATEGORİ KAYDET
=========================== */

saveButton.addEventListener("click", saveCategory);

async function saveCategory() {

    const data = {
        name: categoryName.value.trim(),
        active: categoryActive.checked
    };

    if (data.name === "") {
        alert("Kategori adı giriniz.");
        return;
    }

    try {

        if (editingId) {

            const eskiKategori = categories.find(c => c.id === editingId);

            await updateDoc(
                doc(db, "categories", editingId),
                {
                    ...data,
                    order: eskiKategori?.order ?? 1
                }
            );

            alert("Kategori güncellendi.");

        } else {

            const maxOrder =
                categories.length > 0
                    ? Math.max(...categories.map(c => c.order || 0))
                    : 0;

            await addDoc(
                collection(db, "categories"),
                {
                    ...data,
                    order: maxOrder + 1
                }
            );

            alert("Kategori eklendi.");

        }

        modal.hide();

        clearForm();

        await loadCategories();

    } catch (err) {

        console.error(err);

        alert("Kategori kaydedilemedi.");

    }

}

/* ===========================
   KATEGORİ SİL
=========================== */

async function deleteCategory(id) {

    if (!confirm("Bu kategoriyi silmek istiyor musunuz?"))
        return;

    try {

        await deleteDoc(
            doc(db, "categories", id)
        );

        await loadCategories();

    } catch (err) {

        console.error(err);

        alert("Kategori silinemedi.");

    }

}

/* ===========================
   BAŞLAT
=========================== */

async function init() {

    await loadCategories();

}

init();
