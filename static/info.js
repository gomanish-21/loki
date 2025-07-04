// INFO page functionality
let documentsData = [];
let filteredDocuments = [];

document.addEventListener("DOMContentLoaded", function () {
  loadDocuments();
  loadCategories();
});

// Navigation function
function navigateTo(path) {
  window.location.href = path;
}

// Refresh data function
function refreshData() {
  const refreshBtn = document.querySelector(".refresh-btn");
  const originalIcon = refreshBtn.innerHTML;

  refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  refreshBtn.style.pointerEvents = "none";

  // Simulate refresh
  setTimeout(() => {
    refreshBtn.innerHTML = originalIcon;
    refreshBtn.style.pointerEvents = "";

    // Show success feedback
    refreshBtn.style.background = "rgba(40, 167, 69, 0.3)";
    setTimeout(() => {
      refreshBtn.style.background = "";
    }, 2000);
  }, 1000);
}

// Show details modal
function showDetails(category, item) {
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalContent = document.getElementById("modal-content");

  // Set modal title
  modalTitle.textContent = `${category} - ${item}`;

  // Load content based on category and item
  const content = getDetailsContent(category, item);
  modalContent.innerHTML = content;

  // Show modal
  modal.style.display = "block";

  // Prevent body scroll
  document.body.style.overflow = "hidden";
}

// Close modal
function closeModal() {
  const modal = document.getElementById("modal");
  modal.style.display = "none";

  // Restore body scroll
  document.body.style.overflow = "";
}

// Load documents from API
async function loadDocuments() {
  try {
    const response = await fetch("/api/info/documents");
    if (response.ok) {
      documentsData = await response.json();
      filteredDocuments = [...documentsData];
      renderDocuments();
    } else {
      console.error("Failed to load documents");
    }
  } catch (error) {
    console.error("Error loading documents:", error);
  }
}

// Load categories from API
async function loadCategories() {
  try {
    const response = await fetch("/api/info/categories");
    if (response.ok) {
      const data = await response.json();
      const categorySelect = document.getElementById("category-select");

      data.categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
      });
    } else {
      console.error("Failed to load categories");
    }
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

// Render documents
function renderDocuments() {
  const grid = document.getElementById("documents-grid");

  if (filteredDocuments.length === 0) {
    grid.innerHTML = '<div class="loading">No documents found.</div>';
    return;
  }

  grid.innerHTML = filteredDocuments
    .map((doc) => createDocumentCard(doc))
    .join("");

  // Add click events to document cards
  document.querySelectorAll(".document-card").forEach((card, index) => {
    card.addEventListener("click", () => {
      showDocumentDetails(filteredDocuments[index]);
    });
  });
}

// Create document card HTML
function createDocumentCard(doc) {
  const excerpt = doc.content.replace(/[#*`]/g, "").substring(0, 150) + "...";
  const date = new Date(doc.updated_at).toLocaleDateString();

  return `
    <div class="document-card">
      <div class="document-header">
        <div class="document-icon">
          <i class="fas fa-file-alt"></i>
        </div>
        <div class="document-content">
          <h3>${doc.title}</h3>
          <div class="category">${doc.category}</div>
          <div class="excerpt">${excerpt}</div>
        </div>
      </div>
      <div class="document-footer">
        <div class="document-tags">
          ${doc.tags
            .slice(0, 3)
            .map((tag) => `<span class="document-tag">${tag}</span>`)
            .join("")}
        </div>
        <div class="document-date">${date}</div>
      </div>
    </div>
  `;
}

// Filter documents by category
function filterDocuments() {
  const category = document.getElementById("category-select").value;
  const searchTerm = document
    .getElementById("search-input")
    .value.toLowerCase();

  filteredDocuments = documentsData.filter((doc) => {
    const matchesCategory = !category || doc.category === category;
    const matchesSearch =
      !searchTerm ||
      doc.title.toLowerCase().includes(searchTerm) ||
      doc.content.toLowerCase().includes(searchTerm) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchTerm));

    return matchesCategory && matchesSearch;
  });

  renderDocuments();
}

// Search documents
function searchDocuments() {
  filterDocuments();
}

// Show document details in modal
function showDocumentDetails(doc) {
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalContent = document.getElementById("modal-content");

  modalTitle.textContent = doc.title;

  // Convert markdown-like content to HTML
  const content = convertMarkdownToHtml(doc.content);

  modalContent.innerHTML = `
    <div class="document-details">
      <div class="document-meta">
        <span class="category">${doc.category}</span>
        <span class="author">By ${doc.author}</span>
        <span class="date">Updated: ${new Date(
          doc.updated_at
        ).toLocaleDateString()}</span>
      </div>
      <div class="document-tags">
        ${doc.tags
          .map((tag) => `<span class="document-tag">${tag}</span>`)
          .join("")}
      </div>
      <div class="document-body">
        ${content}
      </div>
    </div>
  `;

  modal.style.display = "block";
  document.body.style.overflow = "hidden";
}

// Convert markdown-like content to HTML
function convertMarkdownToHtml(content) {
  return content
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /```sql\n([\s\S]*?)\n```/g,
      '<pre><code class="sql">$1</code></pre>'
    )
    .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>");
}

// Close modal when clicking outside
document.addEventListener("click", function (event) {
  const modal = document.getElementById("modal");
  const modalContent = modal.querySelector(".modal-content");

  if (event.target === modal) {
    closeModal();
  }
});

// Close modal with Escape key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeModal();
  }
});
