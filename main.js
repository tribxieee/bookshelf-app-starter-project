/* main.js (ganti seluruh file dengan ini) */
const STORAGE_KEY = "BOOKSHELF_APPS";
const FILTER_KEY = "BOOKSHELF_FILTER";

let books = [];
let editingId = null;

// Ambil filter terakhir dari localStorage, default "all"
let currentFilter = localStorage.getItem(FILTER_KEY) || "all";

/* DOM */
const form = document.getElementById("bookForm");
const titleInput = document.getElementById("title");
const authorInput = document.getElementById("author");
const yearInput = document.getElementById("year");
const isCompleteInput = document.getElementById("isComplete");
const submitButton = form.querySelector('[type="submit"]');

const incompleteList = document.getElementById("incompleteBookList");
const completeList = document.getElementById("completeBookList");

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

const btnAll = document.getElementById("filter-all");
const btnUnread = document.getElementById("filter-unread");
const btnRead = document.getElementById("filter-read");

/* Init */
document.addEventListener("DOMContentLoaded", () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) books = JSON.parse(data);
  setActiveFilterButton(currentFilter);
  renderBooks();
});

/* Storage */
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}
function saveFilter() {
  localStorage.setItem(FILTER_KEY, currentFilter);
}

function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

/* Create card DOM */
function createBookElement(book) {
  const col = document.createElement("div");
  col.className = "col-12 col-md-6";

  const wrapper = document.createElement("div");
  wrapper.className = "card p-3 shadow-sm";
  wrapper.setAttribute("data-bookid", book.id);
  wrapper.setAttribute("data-testid", "bookItem");

  const statusBtnLabel = book.isComplete ? "Selesai" : "Tandai Selesai";
  const statusBtnClass = book.isComplete ? "btn-success" : "btn-secondary";

  wrapper.innerHTML = `
    <h5 data-testid="bookItemTitle" class="mb-1">${escapeHtml(book.title)}</h5>
    <p class="mb-1 small" data-testid="bookItemAuthor">Penulis: ${escapeHtml(book.author)}</p>
    <p class="mb-2 small text-muted" data-testid="bookItemYear">Tahun: ${escapeHtml(String(book.year))}</p>

    <div class="d-flex justify-content-between mt-2 gap-2">
      <button class="btn btn-sm ${statusBtnClass} flex-grow-1" 
              data-testid="bookItemIsCompleteButton">
        ${statusBtnLabel}
      </button>

      <button class="btn btn-warning btn-sm text-white" data-testid="bookItemEditButton">
        Edit
      </button>

      <button class="btn btn-danger btn-sm" data-testid="bookItemDeleteButton">
        Hapus
      </button>
    </div>
  `;

  col.appendChild(wrapper);

  wrapper.querySelector('[data-testid="bookItemIsCompleteButton"]')
    .addEventListener("click", () => toggleBookStatusWithConfirm(book.id));

  wrapper.querySelector('[data-testid="bookItemEditButton"]')
    .addEventListener("click", () => enterEditMode(book.id));

  wrapper.querySelector('[data-testid="bookItemDeleteButton"]')
    .addEventListener("click", () => deleteBook(book.id));

  return col;
}

/* Rendering (filter + search) */
function renderBooks() {
  // empty list containers
  incompleteList.innerHTML = "";
  completeList.innerHTML = "";

  const q = (searchInput.value || "").toLowerCase().trim();

  books.forEach(book => {
    // if search query present and title doesn't match, skip
    if (q && !book.title.toLowerCase().includes(q)) return;

    const elm = createBookElement(book);
    if (book.isComplete) {
      completeList.appendChild(elm);
    } else {
      incompleteList.appendChild(elm);
    }
  });

  // Apply filter: show/hide the lists themselves (not parent)
  if (currentFilter === "all") {
    incompleteList.style.display = "";
    completeList.style.display = "";
  } else if (currentFilter === "unread") {
    incompleteList.style.display = "";
    completeList.style.display = "none";
  } else if (currentFilter === "read") {
    incompleteList.style.display = "none";
    completeList.style.display = "";
  }
}

/* Form submit: add or update */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const year = Number(yearInput.value);
  const isComplete = Boolean(isCompleteInput.checked);

  if (!title || !author || !year) {
    Swal.fire({ icon: "error", title: "Isi semua field", timer: 1200, showConfirmButton: false });
    return;
  }

  if (editingId) {
    const book = books.find(b => b.id === editingId);
    if (book) {
      book.title = title;
      book.author = author;
      book.year = year;
      book.isComplete = isComplete;
      saveData();
      renderBooks();
      Swal.fire({ icon: "success", title: "Perubahan disimpan", timer: 1000, showConfirmButton: false });
    }
    editingId = null;
    submitButton.innerHTML = `<i class="bi bi-plus-circle"></i> Simpan Buku`;
  } else {
    const newBook = {
      id: generateId(),
      title,
      author,
      year,
      isComplete,
    };
    books.push(newBook);
    saveData();
    renderBooks();
    Swal.fire({ icon: "success", title: "Buku ditambahkan!", timer: 1200, showConfirmButton: false });
  }

  form.reset();
});

/* Delete with confirmation */
function deleteBook(id) {
  Swal.fire({
    title: "Hapus buku ini?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#e74c3c",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Hapus"
  }).then((result) => {
    if (result.isConfirmed) {
      books = books.filter(b => b.id !== id);
      if (editingId === id) {
        editingId = null;
        form.reset();
        submitButton.innerHTML = `<i class="bi bi-plus-circle"></i> Simpan Buku`;
      }
      saveData();
      renderBooks();
      Swal.fire({ icon: "success", title: "Dihapus!", timer: 1000, showConfirmButton: false });
    }
  });
}

/* Enter edit mode (in-place edit, no delete+add) */
function enterEditMode(id) {
  const book = books.find(b => b.id === id);
  if (!book) return;

  editingId = id;
  titleInput.value = book.title;
  authorInput.value = book.author;
  yearInput.value = book.year;
  isCompleteInput.checked = book.isComplete;

  submitButton.innerHTML = `<i class="bi bi-pencil-square"></i> Perbarui Buku`;

  Swal.fire({
    icon: "info",
    title: "Edit mode aktif",
    text: "Ubah data lalu tekan Perbarui Buku",
    timer: 1100,
    showConfirmButton: false,
  });

  titleInput.focus();
}

/* Toggle status with confirmation when marking as complete */
function toggleBookStatusWithConfirm(id) {
  const book = books.find(b => b.id === id);
  if (!book) return;

  if (!book.isComplete) {
    Swal.fire({
      title: "Sudah selesai membaca?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, sudah",
      cancelButtonText: "Belum",
    }).then(result => {
      if (result.isConfirmed) {
        book.isComplete = true;
        saveData();
        renderBooks();
        Swal.fire({ icon: "success", title: "Selesai", timer: 900, showConfirmButton: false });
      }
    });
  } else {
    // langsung tandai belum tanpa konfirmasi
    book.isComplete = false;
    saveData();
    renderBooks();
    Swal.fire({ icon: "info", title: "Belum Selesai", timer: 700, showConfirmButton: false });
  }
}

/* Filter buttons (set filter, save it, update UI, re-render) */
btnAll.addEventListener("click", () => {
  currentFilter = "all";
  saveFilter();
  setActiveFilterButton(currentFilter);
  renderBooks();
});
btnUnread.addEventListener("click", () => {
  currentFilter = "unread";
  saveFilter();
  setActiveFilterButton(currentFilter);
  renderBooks();
});
btnRead.addEventListener("click", () => {
  currentFilter = "read";
  saveFilter();
  setActiveFilterButton(currentFilter);
  renderBooks();
});

function setActiveFilterButton(filter) {
  // simple active toggling
  [btnAll, btnUnread, btnRead].forEach(b => b.classList.remove("active"));
  if (filter === "all") btnAll.classList.add("active");
  else if (filter === "unread") btnUnread.classList.add("active");
  else if (filter === "read") btnRead.classList.add("active");
}

/* Search */
searchButton.addEventListener("click", () => renderBooks());
searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") renderBooks();
});

/* escape HTML */
function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
}
