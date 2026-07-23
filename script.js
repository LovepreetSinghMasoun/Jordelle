// ==============================
// DOM ELEMENTS
// ==============================
const searchInput = document.querySelector(".search-box input");
const searchButton = document.querySelector(".search-box button");
const moodButtons = document.querySelectorAll(".mood-grid button");

// ==============================
// EVENT LISTENERS
// ==============================
searchButton.addEventListener("click", handleSearch);

searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch();
});

moodButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const cleanText = button.innerText.replace(/[^a-zA-Z\s]/g, "").trim();
        searchInput.value = cleanText;
        handleSearch();
    });
});

// Load a default set of books as soon as the page opens
window.addEventListener("DOMContentLoaded", () => {
    searchBooks("romance", true);
});

// ==============================
// SEARCH HANDLER
// ==============================
async function handleSearch() {
    const query = searchInput.value.trim();

    if (!query) {
        alert("Tell me what kind of romance you want ✨");
        return;
    }

    searchButton.innerHTML = "Searching ✨";

    try {
        await searchBooks(query, false);
    } catch (error) {
        console.error("Search failed:", error);
        alert("Something went wrong fetching recommendations.");
    } finally {
        searchButton.innerHTML = "Find My Book";
    }
}

// ==============================
// API FETCH & COMBINE
// ==============================
async function searchBooks(query, isInitialLoad = false) {
    // isInitialLoad avoids forcing "romance" twice into the query text
    const term = isInitialLoad ? query : `${query} romance`;
    const safeQuery = encodeURIComponent(term);

    const openLibraryReq = fetch(`https://openlibrary.org/search.json?q=${safeQuery}&limit=20`)
        .then((res) => res.json())
        .catch(() => ({ docs: [] }));

    const googleBooksReq = fetch(`https://www.googleapis.com/books/v1/volumes?q=${safeQuery}&maxResults=20`)
        .then((res) => res.json())
        .catch(() => ({ items: [] }));

    const [openData, googleData] = await Promise.all([openLibraryReq, googleBooksReq]);

    const books = [];

    // Open Library results
    if (openData.docs) {
        openData.docs.slice(0, 10).forEach((book) => {
            books.push({
                title: book.title,
                author: book.author_name?.[0] || "Unknown Author",
                cover: book.cover_i
                    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                    : null,
                link: book.key ? `https://openlibrary.org${book.key}` : null
            });
        });
    }

    // Google Books results
    if (googleData.items) {
        googleData.items.slice(0, 10).forEach((book) => {
            const info = book.volumeInfo;
            books.push({
                title: info.title,
                author: info.authors?.[0] || "Unknown Author",
                cover: info.imageLinks?.thumbnail?.replace("http://", "https://") || null,
                link: info.infoLink || info.canonicalVolumeLink || null
            });
        });
    }

    displayBooks(books);
}

// ==============================
// DISPLAY RESULTS
// ==============================
function displayBooks(books) {
    const container = document.querySelector(".books");
    container.innerHTML = "";

    if (books.length === 0) {
        container.innerHTML = "<p>No romantic reads found. Try another prompt!</p>";
        return;
    }

    books.forEach((book) => {
        const coverUrl = book.cover || "images/default-book.jpg";
        const href = book.link || "#";

        container.innerHTML += `
            <a class="book" href="${href}" target="_blank" rel="noopener noreferrer">
                <img src="${coverUrl}" alt="${book.title} cover" loading="lazy">
                <h3>${book.title}</h3>
                <p>${book.author}</p>
                <span>❤️ Romance</span>
            </a>
        `;
    });
}