const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOK-SHELF";
const deleteDialog = document.getElementById("deleteDialogUnreaded");
const confirmDelete = document.getElementById("confirmDeleteUnreaded");
const cancelDelete = document.getElementById("cancelDeleteUnreaded");
const deleteDialogReaded = document.getElementById("deleteDialogReaded");
const confirmDeleteReaded = document.getElementById("confirmDeleteReaded");
const cancelDeleteReaded = document.getElementById("cancelDeleteReaded");

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung Web Storage");
    return false;
  }
  return true;
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("form");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function addBook() {
  const bookName = document.getElementById("title").value;
  const bookAuthor = document.getElementById("author").value;
  const bookYear = parseInt(document.getElementById("year").value);

  const generatedId = generateId();
  const bookObject = generateBookObject(
    generatedId,
    bookName,
    bookAuthor,
    bookYear,
    false
  );
  books.push(bookObject);
  snackBar("Buku Ditambahkan");
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookList = document.getElementById("uncompleted-books");
  uncompletedBookList.innerHTML = "";

  const completedBookList = document.getElementById("completed-books");
  completedBookList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplete) uncompletedBookList.append(bookElement);
    else completedBookList.append(bookElement);
  }
});

function makeBook(bookObject) {
  const bookTitle = document.createElement("h3");
  bookTitle.classList.add("bookTitle");
  bookTitle.innerText = bookObject.title;

  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = bookObject.author + "  (" + bookObject.year + ")";

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(bookTitle, bookAuthor);

  const container = document.createElement("div");
  container.classList.add("item", "shadow");
  container.append(textContainer);
  container.setAttribute("id", `book-${bookObject.id}`);

  if (bookObject.isComplete) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");

    undoButton.addEventListener("click", function () {
      undoBookFromReaded(bookObject.id);
      snackBar("Buku Batal Dibaca");
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");

    trashButton.addEventListener("click", function () {
      deleteDialog.style.display = "block";

      confirmDelete.addEventListener("click", function () {
        removeBook(bookObject.id);
        deleteDialog.style.display = "none";
        snackBar("Buku Dihapus");
      });
      cancelDelete.addEventListener("click", function () {
        deleteDialog.style.display = "none";
      });
    });
    container.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");

    checkButton.addEventListener("click", function () {
      addBookToReaded(bookObject.id);
      snackBar("Buku Dibaca");
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");

    trashButton.addEventListener("click", function () {
      deleteDialogReaded.style.display = "block";

      confirmDeleteReaded.addEventListener("click", function () {
        removeBook(bookObject.id);
        deleteDialogReaded.style.display = "none";
        snackBar("Buku Dihapus");
      });
      cancelDeleteReaded.addEventListener("click", function () {
        deleteDialogReaded.style.display = "none";
      });
    });
    container.append(checkButton, trashButton);
  }
  return container;
}

function addBookToReaded(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;
  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromReaded(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const book of books) {
    if (book.id === bookId) {
      return book;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

searchField = document.getElementById("searchField");
searchField.addEventListener("keyup", function () {
  const inputValue = document.getElementById("searchField").value.toLowerCase();
  console.log(inputValue);
  const bookList = document.querySelectorAll(".inner > h3");
  console.log(bookList);
  for (const book of bookList) {
    const bookText = book.textContent.toLowerCase();
    if (!bookText.includes(inputValue))
      book.parentElement.parentElement.style.display = "none";
    else book.parentElement.parentElement.style.display = "flex";
  }
});

function snackBar(teks) {
  const snackBarElement = document.getElementById("snackbar");
  snackBarElement.innerText = teks;
  snackBarElement.className = "show";

  setTimeout(function () {
    snackBarElement.className = snackBarElement.className.replace("show", "");
  }, 3000);
}
