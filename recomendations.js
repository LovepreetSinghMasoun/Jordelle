// ================================
// Elements
// ================================

const booksGrid = document.getElementById("booksGrid");
const filters = document.querySelectorAll(".filter");

// ================================
// Fetch Books
// ================================

async function loadBooks(query = "romance") {
    try {
        const response = await fetch(
            `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=50`
        );

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();

        const cardsHtml = data.docs.map(book => {
            const title = book.title || "Unknown Title";

            const author = book.author_name
                ? book.author_name.join(", ")
                : "Unknown Author";

            const cover = book.cover_i
                ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                : "https://via.placeholder.com/300x450?text=No+Cover";

            const sourceUrl = book.key
                ? `https://openlibrary.org${book.key}`
                : null;

            const cardInner = `
                <img src="${cover}" alt="${title}">
                <div class="book-info">
                    <h3>${title}</h3>
                    <p class="author">${author}</p>
                    ${book.ratings_average ? `<p class="rating">⭐ ${book.ratings_average.toFixed(1)}</p>` : ""}
                    <div class="tags">
                        <span class="tag">${query}</span>
                    </div>
                </div>
            `;

            return sourceUrl
                ? `<a class="book-card" href="${sourceUrl}" target="_blank" rel="noopener noreferrer">${cardInner}</a>`
                : `<div class="book-card">${cardInner}</div>`;
        }).join("");

        booksGrid.innerHTML = cardsHtml;
    } catch (err) {
        console.error("Failed to load books:", err);
        booksGrid.innerHTML = `<p class="error">Couldn't load books right now.</p>`;
    }
}

// ================================
// Filter Buttons
// ================================

filters.forEach(button => {
    button.addEventListener("click", () => {
        filters.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        const query = button.dataset.query;
        loadBooks(query);
    });
});

// ================================
// Initial Load
// ================================

loadBooks();