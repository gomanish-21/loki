// Global variables
let documents = [];
let filteredDocuments = [];
let currentDocumentId = null;
let categories = [];

// Initialize the admin page
document.addEventListener("DOMContentLoaded", function () {
  loadDocuments();
  loadCategories();
});

// Navigation function
function navigateTo(url) {
  window.location.href = url;
}

// Load all documents
async function loadDocuments() {
  try {
    const response = await fetch("/api/documents");
    if (response.ok) {
      documents = await response.json();
      filteredDocuments = [...documents];
      renderDocuments();
      updateCategoryFilter();
    } else {
      showError("Failed to load documents");
    }
  } catch (error) {
    console.error("Error loading documents:", error);
    showError("Failed to load documents");
  }
}

// Load categories for filter
async function loadCategories() {
  try {
    const response = await fetch("/api/documents/categories");
    if (response.ok) {
      categories = await response.json();
      updateCategoryFilter();
    }
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

// Update category filter dropdown
function updateCategoryFilter() {
  const categoryFilter = document.getElementById("category-filter");
  if (!categoryFilter) return;

  // Clear existing options except "All Categories"
  while (categoryFilter.children.length > 1) {
    categoryFilter.removeChild(categoryFilter.lastChild);
  }

  // Add category options
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

// Render documents in table
function renderDocuments() {
  const tbody = document.getElementById("documents-tbody");
  if (!tbody) return;

  if (filteredDocuments.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="6" class="loading">No documents found</td>
            </tr>
        `;
    return;
  }

  tbody.innerHTML = filteredDocuments
    .map(
      (doc) => `
        <tr>
            <td class="title" title="${doc.title}">${doc.title}</td>
            <td><span class="category">${doc.category}</span></td>
            <td class="author">${doc.author}</td>
            <td class="status ${doc.is_published ? "published" : "draft"}">
                <i class="fas fa-${
                  doc.is_published ? "check-circle" : "clock"
                }"></i>
                ${doc.is_published ? "Published" : "Draft"}
            </td>
            <td class="updated">${formatDate(doc.updated_at)}</td>
            <td class="actions">
                <button class="action-btn view-btn" onclick="viewDocument('${
                  doc._id
                }')" title="View">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="action-btn edit-btn" onclick="editDocument('${
                  doc._id
                }')" title="Edit">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="action-btn delete-btn" onclick="deleteDocument('${
                  doc._id
                }', '${doc.title}')" title="Delete">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `
    )
    .join("");
}

// Search documents
function searchDocuments() {
  const searchTerm = document
    .getElementById("search-input")
    .value.toLowerCase();
  filterDocuments();
}

// Filter documents
function filterDocuments() {
  const searchTerm = document
    .getElementById("search-input")
    .value.toLowerCase();
  const categoryFilter = document.getElementById("category-filter").value;
  const statusFilter = document.getElementById("status-filter").value;

  filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm) ||
      doc.author.toLowerCase().includes(searchTerm) ||
      doc.content.toLowerCase().includes(searchTerm);

    const matchesCategory = !categoryFilter || doc.category === categoryFilter;
    const matchesStatus =
      !statusFilter || doc.is_published.toString() === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  renderDocuments();
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Show add document modal
function showAddDocumentModal() {
  currentDocumentId = null;
  document.getElementById("modal-title").textContent = "Add New Document";
  document.getElementById("document-form").reset();
  document.getElementById("document-modal").style.display = "block";
}

// Show edit document modal
async function editDocument(documentId) {
  try {
    const response = await fetch(`/api/documents/${documentId}`);
    if (response.ok) {
      const docData = await response.json();
      currentDocumentId = documentId;

      document.getElementById("modal-title").textContent = "Edit Document";
      document.getElementById("title").value = docData.title;
      document.getElementById("category").value = docData.category;
      document.getElementById("author").value = docData.author;
      document.getElementById("tags").value = docData.tags
        ? docData.tags.join(", ")
        : "";
      document.getElementById("content").value = docData.content;
      document.getElementById("is_published").checked = docData.is_published;

      document.getElementById("document-modal").style.display = "block";
    } else {
      showError("Failed to load document");
    }
  } catch (error) {
    console.error("Error loading document:", error);
    showError("Failed to load document");
  }
}

// View document
function viewDocument(documentId) {
  window.open(`/info?doc=${documentId}`, "_blank");
}

// Close document modal
function closeDocumentModal() {
  document.getElementById("document-modal").style.display = "none";
  document.getElementById("document-form").reset();
  currentDocumentId = null;
}

// Save document
async function saveDocument(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const documentData = {
    title: formData.get("title"),
    category: formData.get("category"),
    author: formData.get("author"),
    tags: formData.get("tags")
      ? formData
          .get("tags")
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag)
      : [],
    content: formData.get("content"),
    is_published: formData.get("is_published") === "on",
  };

  try {
    const url = currentDocumentId
      ? `/api/documents/${currentDocumentId}`
      : "/api/documents";
    const method = currentDocumentId ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(documentData),
    });

    if (response.ok) {
      const savedDocument = await response.json();
      showSuccess(
        currentDocumentId
          ? "Document updated successfully!"
          : "Document created successfully!"
      );
      closeDocumentModal();
      loadDocuments();
      loadCategories();
    } else {
      const error = await response.json();
      showError(error.detail || "Failed to save document");
    }
  } catch (error) {
    console.error("Error saving document:", error);
    showError("Failed to save document");
  }
}

// Delete document
function deleteDocument(documentId, documentTitle) {
  currentDocumentId = documentId;
  document.getElementById("delete-document-title").textContent = documentTitle;
  document.getElementById("delete-modal").style.display = "block";
}

// Confirm delete
async function confirmDelete() {
  if (!currentDocumentId) return;

  try {
    const response = await fetch(`/api/documents/${currentDocumentId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      showSuccess("Document deleted successfully!");
      closeDeleteModal();
      loadDocuments();
    } else {
      showError("Failed to delete document");
    }
  } catch (error) {
    console.error("Error deleting document:", error);
    showError("Failed to delete document");
  }
}

// Close delete modal
function closeDeleteModal() {
  document.getElementById("delete-modal").style.display = "none";
  currentDocumentId = null;
}

// Show success message
function showSuccess(message) {
  // Create a simple success notification
  const notification = document.createElement("div");
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #48bb78, #38a169);
        color: white;
        padding: 15px 20px;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(72, 187, 120, 0.4);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Show error message
function showError(message) {
  // Create a simple error notification
  const notification = document.createElement("div");
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #f56565, #e53e3e);
        color: white;
        padding: 15px 20px;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(245, 101, 101, 0.4);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 5000);
}

// Add CSS animations for notifications
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Close modals when clicking outside
window.onclick = function (event) {
  const documentModal = document.getElementById("document-modal");
  const deleteModal = document.getElementById("delete-modal");

  if (event.target === documentModal) {
    closeDocumentModal();
  }

  if (event.target === deleteModal) {
    closeDeleteModal();
  }
};

// Close modals with Escape key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeDocumentModal();
    closeDeleteModal();
  }
});

// --- AUTH LOGIC ---
async function isAuthenticated() {
  try {
    const response = await fetch("/api/documents", { method: "GET" });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function loginAdmin(event) {
  event.preventDefault();
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;
  const errorDiv = document.getElementById("login-error");
  errorDiv.style.display = "none";
  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      document.getElementById("login-modal").style.display = "none";
      document.body.style.overflow = "";
      showSuccess("Login successful!");
      document.getElementById("logout-btn").style.display = "";
      loadDocuments();
      loadCategories();
    } else {
      const data = await res.json();
      errorDiv.textContent = data.detail || "Login failed";
      errorDiv.style.display = "block";
    }
  } catch (e) {
    errorDiv.textContent = "Login failed";
    errorDiv.style.display = "block";
  }
}

async function logoutAdmin() {
  await fetch("/api/admin/logout", { method: "POST" });
  showSuccess("Logged out!");
  setTimeout(() => (window.location.href = "/"), 500);
}

// On load, check auth and show/hide logout button
window.addEventListener("DOMContentLoaded", async function () {
  if (document.getElementById("logout-btn")) {
    try {
      const ok = await isAuthenticated();
      document.getElementById("logout-btn").style.display = ok ? "" : "none";
    } catch (error) {
      // If not authenticated, hide logout button
      document.getElementById("logout-btn").style.display = "none";
    }
  }
});
