const STORAGE_KEY = "BOOKSHELF_APPS";
let books = [];

const form = document.getElementById("bookForm");
const titleInput = document.getElementById("title");
const authorInput = document.getElementById("author");
const yearInput = document.getElementById("year");
const isCompleteInput = document.getElementById("isComplete");

const incompleteList = document.getElementById("incompleteBookList");
const completeList = document.getElementById("completeBookList");

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem(STORAGE_KEY)) {
    books = JSON.parse(localStorage.getItem(STORAGE_KEY));
  }
  renderBooks();
});

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

function generateId() {
  return +new Date();
}

function createBookElement(book) {
  const col = document.createElement("div");
  col.className = "col-md-6";

  const wrapper = document.createElement("div");
  wrapper.className = "card p-3 shadow-sm";
  wrapper.setAttribute("data-bookid", book.id);
  wrapper.setAttribute("data-testid", "bookItem");

  wrapper.innerHTML = `
    <h5 data-testid="bookItemTitle">${book.title}</h5>
    <p data-testid="bookItemAuthor">Penulis: ${book.author}</p>
    <p data-testid="bookItemYear">Tahun: ${book.year}</p>

    <div class="d-flex justify-content-between mt-2">
      <button class="btn btn-sm ${book.isComplete ? "btn-secondary" : "btn-success"}" 
              data-testid="bookItemIsCompleteButton">
        ${book.isComplete ? "Belum" : "Selesai"}
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
    .addEventListener("click", () => toggleBookStatus(book.id));

  wrapper.querySelector('[data-testid="bookItemEditButton"]')
    .addEventListener("click", () => editBook(book.id));

  wrapper.querySelector('[data-testid="bookItemDeleteButton"]')
    .addEventListener("click", () => deleteBook(book.id));

  return col;
}

function renderBooks() {
  incompleteList.innerHTML = "";
  completeList.innerHTML = "";

  books.forEach(book => {
    const elm = createBookElement(book);
    book.isComplete ? completeList.appendChild(elm) : incompleteList.appendChild(elm);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const newBook = {
    id: generateId(),
    title: titleInput.value,
    author: authorInput.value,
    year: Number(yearInput.value),
    isComplete: isCompleteInput.checked,
  };

  books.push(newBook);
  saveData();
  renderBooks();

  Swal.fire({
    icon: "success",
    title: "Buku ditambahkan!",
    timer: 1200,
    showConfirmButton: false,
  });

  form.reset();
});

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
      saveData();
      renderBooks();

      Swal.fire({
        icon: "success",
        title: "Dihapus!",
        timer: 1000,
        showConfirmButton: false,
      });
    }
  });
}

function editBook(id) {
  const book = books.find(b => b.id === id);

  titleInput.value = book.title;
  authorInput.value = book.author;
  yearInput.value = book.year;
  isCompleteInput.checked = book.isComplete;

  deleteBook(id);

  Swal.fire({
    icon: "info",
    title: "Edit mode aktif",
    text: "Silakan ubah data di form",
    timer: 1500,
    showConfirmButton: false,
  });
}

function toggleBookStatus(id) {
  const book = books.find(b => b.id === id);
  book.isComplete = !book.isComplete;

  saveData();
  renderBooks();
}

searchButton.addEventListener("click", () => {
  const q = searchInput.value.toLowerCase();

  document.querySelectorAll("[data-testid='bookItemTitle']").forEach((title) => {
    const card = title.closest(".col-md-6");
    card.style.display = title.innerText.toLowerCase().includes(q) ? "block" : "none";
  });
});
