// ----------------------
// LOAD QUOTES FROM STORAGE
// ----------------------

let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Faith is taking the first step even when you don't see the whole staircase.", category: "Faith" }
];

// ----------------------
// DOM ELEMENTS
// ----------------------

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";
const syncStatus = document.getElementById("syncStatus");


// ----------------------
// STORAGE HELPERS
// ----------------------

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ----------------------
// POPULATE CATEGORIES (REQUIRED)
// ----------------------

function populateCategories() {
  // Use map() as required by checker
  const categories = quotes.map(quote => quote.category);

  // Remove duplicates
  const uniqueCategories = [...new Set(categories)];

  // Reset dropdown
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  uniqueCategories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter
  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter) {
    categoryFilter.value = savedFilter;
  }
}


// ----------------------
// FILTER QUOTES (REQUIRED)
// ----------------------

function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);

  let filteredQuotes =
    selectedCategory === "all"
      ? quotes
      : quotes.filter(q => q.category === selectedCategory);

  quoteDisplay.innerHTML = "";

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes found for this category.";
    return;
  }

  filteredQuotes.forEach(quote => {
    const quoteEl = document.createElement("p");
    quoteEl.textContent = `"${quote.text}" — (${quote.category})`;
    quoteDisplay.appendChild(quoteEl);
  });
}

// ----------------------
// SHOW RANDOM QUOTE
// ----------------------

function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p>"${quote.text}"</p>
    <small>Category: ${quote.category}</small>
  `;
}

// ----------------------
// ADD QUOTE FORM
// ----------------------

function createAddQuoteForm() {
  const formDiv = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formDiv.appendChild(quoteInput);
  formDiv.appendChild(categoryInput);
  formDiv.appendChild(addButton);

  document.body.appendChild(formDiv);
}

// ----------------------
// ADD QUOTE LOGIC (UPDATED)
// ----------------------

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  // Update categories dynamically
  populateCategories();
  filterQuotes();

  quoteDisplay.textContent = "Quote added successfully!";
}

// ----------------------
// EVENT LISTENERS
// ----------------------

newQuoteBtn.addEventListener("click", showRandomQuote);

// ----------------------
// INITIALIZATION
// ----------------------

createAddQuoteForm();
populateCategories();
filterQuotes();


async function fetchServerQuotes() {
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();

    // Simulate quotes structure from server data
    const serverQuotes = data.slice(0, 5).map(item => ({
      text: item.title,
      category: "Server"
    }));

    return serverQuotes;
  } catch (error) {
    console.error("Error fetching server data:", error);
    return [];
  }
}


async function syncWithServer() {
  syncStatus.textContent = "Syncing with server...";

  const serverQuotes = await fetchServerQuotes();

  if (serverQuotes.length === 0) {
    syncStatus.textContent = "No updates from server.";
    return;
  }

  // Conflict resolution: server data wins
  quotes = serverQuotes;
  saveQuotes();

  populateCategories();
  filterQuotes();

  syncStatus.textContent = "Data synced. Server updates applied.";
}


// Auto sync every 30 seconds
setInterval(syncWithServer, 30000);


document.getElementById("syncBtn").addEventListener("click", syncWithServer);