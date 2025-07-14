// Global variables
let currentFormatType = "sql";
let historyData = [];

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

  // Reload history
  loadHistory().then(() => {
    refreshBtn.innerHTML = originalIcon;
    refreshBtn.style.pointerEvents = "";

    // Show success feedback
    refreshBtn.style.background = "rgba(40, 167, 69, 0.3)";
    setTimeout(() => {
      refreshBtn.style.background = "";
    }, 2000);
  });
}

// DOM elements
const formatBtns = document.querySelectorAll(".format-btn");
const formatBtn = document.getElementById("format-btn");
const inputText = document.getElementById("input-text");
const outputText = document.getElementById("output-text");
const indentSize = document.getElementById("indent-size");
const errorMessage = document.getElementById("error-message");
const historyList = document.getElementById("history-list");
const clearInputBtn = document.getElementById("clear-input");
const copyOutputBtn = document.getElementById("copy-output");
const downloadOutputBtn = document.getElementById("download-output");
const expandOutputBtn = document.getElementById("expand-output");
const clearHistoryBtn = document.getElementById("clear-history");

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  setupEventListeners();
  loadHistory();
  setupSampleData();
});

// Setup event listeners
function setupEventListeners() {
  // Format type selection (SQL only)
  formatBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      formatBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFormatType = btn.dataset.type;
      updatePlaceholder();
    });
  });

  // Format button
  formatBtn.addEventListener("click", formatContent);

  // Clear input
  clearInputBtn.addEventListener("click", clearInput);

  // Copy output
  copyOutputBtn.addEventListener("click", copyOutput);

  // Download output
  downloadOutputBtn.addEventListener("click", downloadOutput);

  // Expand output
  expandOutputBtn.addEventListener("click", toggleExpandOutput);

  // Clear history
  clearHistoryBtn.addEventListener("click", clearHistory);

  // Keyboard shortcuts
  document.addEventListener("keydown", handleKeyboardShortcuts);
}

// Toggle expand/collapse of the output section
function toggleExpandOutput() {
  const editorContainer = document.querySelector(".editor-container");
  const outputSection = document.querySelector(".output-section");

  editorContainer.classList.toggle("expanded");
  outputSection.classList.toggle("expanded");

  const icon = expandOutputBtn.querySelector("i");
  if (editorContainer.classList.contains("expanded")) {
    icon.classList.remove("fa-expand-alt");
    icon.classList.add("fa-compress-alt");
  } else {
    icon.classList.remove("fa-compress-alt");
    icon.classList.add("fa-expand-alt");
  }
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
  // Ctrl/Cmd + Enter to format
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    formatContent();
  }

  // Ctrl/Cmd + Shift + C to copy
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "C") {
    e.preventDefault();
    copyOutput();
  }
}

// Update placeholder based on format type
function updatePlaceholder() {
  inputText.placeholder =
    "Paste your SQL here...\n\nExample:\nSELECT name,age FROM users WHERE age>25 ORDER BY name;";
}

// Format content
async function formatContent() {
  const content = inputText.value.trim();

  if (!content) {
    showError("Please enter some content to format.");
    return;
  }

  try {
    formatBtn.disabled = true;
    formatBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Formatting...';

    const response = await fetch("/api/format", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: content,
        format_type: currentFormatType,
        indent_size: parseInt(indentSize.value),
      }),
    });

    const result = await response.json();

    if (response.ok) {
      if (result.is_valid) {
        outputText.textContent = result.formatted_content;
        hideError();
        showSuccess();

        // Reload history if new item was added
        if (result.history_id) {
          await loadHistory();
        }
      } else {
        outputText.textContent = result.formatted_content;
        showError(result.error_message);
      }
    } else {
      showError("An error occurred while formatting. Please try again.");
    }
  } catch (error) {
    console.error("Formatting error:", error);
    showError("Network error. Please check your connection and try again.");
  } finally {
    formatBtn.disabled = false;
    formatBtn.innerHTML = '<i class="fas fa-magic"></i> Format';
  }
}

// Show error message
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
  errorMessage.scrollIntoView({ behavior: "smooth", block: "center" });
}

// Hide error message
function hideError() {
  errorMessage.classList.add("hidden");
}

// Show success animation
function showSuccess() {
  outputText.classList.add("success");
  setTimeout(() => {
    outputText.classList.remove("success");
  }, 300);
}

// Clear input
function clearInput() {
  inputText.value = "";
  outputText.textContent = "";
  hideError();
  inputText.focus();
}

// Copy output to clipboard
async function copyOutput() {
  const content = outputText.textContent;

  if (!content) {
    showError("No formatted content to copy.");
    return;
  }

  try {
    await navigator.clipboard.writeText(content);

    // Show temporary success message
    const originalText = copyOutputBtn.innerHTML;
    copyOutputBtn.innerHTML = '<i class="fas fa-check"></i>';
    copyOutputBtn.style.background = "#28a745";
    copyOutputBtn.style.color = "white";

    setTimeout(() => {
      copyOutputBtn.innerHTML = originalText;
      copyOutputBtn.style.background = "";
      copyOutputBtn.style.color = "";
    }, 2000);
  } catch (error) {
    console.error("Copy failed:", error);
    showError("Failed to copy to clipboard. Please try again.");
  }
}

// Download output
function downloadOutput() {
  const content = outputText.textContent;

  if (!content) {
    showError("No formatted content to download.");
    return;
  }

  const extension = currentFormatType === "json" ? "json" : "sql";
  const filename = `formatted.${extension}`;

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Load history
async function loadHistory() {
  try {
    const response = await fetch("/api/history?limit=20");
    const history = await response.json();

    historyData = history;
    renderHistory();
  } catch (error) {
    console.error("Failed to load history:", error);
    historyList.innerHTML = '<div class="error">Failed to load history</div>';
  }
}

// Render history
function renderHistory() {
  if (historyData.length === 0) {
    historyList.innerHTML =
      '<div class="loading">No history yet. Start formatting to see your history here!</div>';
    return;
  }

  historyList.innerHTML = "";

  historyData.forEach((item) => {
    const historyItem = createHistoryItem(item);
    historyList.appendChild(historyItem);
  });
}

// Create history item element
function createHistoryItem(item) {
  const template = document.getElementById("history-item-template");
  const clone = template.content.cloneNode(true);

  const historyItem = clone.querySelector(".history-item");
  const formatTypeBadge = clone.querySelector(".format-type-badge");
  const timestamp = clone.querySelector(".timestamp");
  const previewContent = clone.querySelector(".preview-content");
  const loadBtn = clone.querySelector(".load-history-btn");
  const deleteBtn = clone.querySelector(".delete-history-btn");

  // Set format type badge
  formatTypeBadge.textContent = item.format_type;
  formatTypeBadge.classList.add(item.format_type);

  // Set timestamp
  const date = new Date(item.timestamp);
  timestamp.textContent = formatTimestamp(date);

  // Set preview content
  previewContent.textContent = item.formatted_content.substring(0, 200);
  if (item.formatted_content.length > 200) {
    previewContent.textContent += "...";
  }

  // Load button
  loadBtn.addEventListener("click", () => {
    loadHistoryItem(item);
  });

  // Delete button
  deleteBtn.addEventListener("click", () => {
    deleteHistoryItem(item.id);
  });

  return historyItem;
}

// Load history item
function loadHistoryItem(item) {
  // Set format type
  formatBtns.forEach((btn) => btn.classList.remove("active"));
  const formatBtn = document.querySelector(`[data-type="${item.format_type}"]`);
  if (formatBtn) {
    formatBtn.classList.add("active");
    currentFormatType = item.format_type;
  }

  // Set indent size
  indentSize.value = item.indent_size;

  // Set content
  inputText.value = item.content;
  outputText.textContent = item.formatted_content;

  // Update placeholder
  updatePlaceholder();

  // Hide any errors
  hideError();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Delete history item
async function deleteHistoryItem(id) {
  if (!confirm("Are you sure you want to delete this item from history?")) {
    return;
  }

  try {
    const response = await fetch(`/api/history/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      await loadHistory();
    } else {
      showError("Failed to delete history item.");
    }
  } catch (error) {
    console.error("Delete error:", error);
    showError("Failed to delete history item.");
  }
}

// Clear all history
async function clearHistory() {
  if (
    !confirm(
      "Are you sure you want to clear all history? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    const response = await fetch("/api/history", {
      method: "DELETE",
    });

    if (response.ok) {
      await loadHistory();
    } else {
      showError("Failed to clear history.");
    }
  } catch (error) {
    console.error("Clear history error:", error);
    showError("Failed to clear history.");
  }
}

// Format timestamp
function formatTimestamp(date) {
  const now = new Date();
  const diff = now - date;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) {
    return "Just now";
  } else if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else if (days < 7) {
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Setup sample data
function setupSampleData() {
  updatePlaceholder();

  // Add some sample SQL for demonstration
  const sampleSQL = `SELECT u.name,u.email,o.order_date,o.total_amount FROM users u INNER JOIN orders o ON u.id=o.user_id WHERE o.order_date>='2023-01-01' AND o.total_amount>100 ORDER BY o.total_amount DESC LIMIT 10;`;

  // Store samples for easy access
  window.sampleData = {
    sql: sampleSQL,
  };
}

// Add sample data buttons (optional enhancement)
function addSampleButtons() {
  const controls = document.querySelector(".controls");

  const sampleContainer = document.createElement("div");
  sampleContainer.className = "sample-buttons";
  sampleContainer.innerHTML = `
        <button class="sample-btn" data-type="sql">Sample SQL</button>
    `;

  controls.appendChild(sampleContainer);

  // Add event listeners for sample buttons
  sampleContainer.querySelectorAll(".sample-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.type;
      inputText.value = window.sampleData[type];

      // Switch to correct format type
      formatBtns.forEach((b) => b.classList.remove("active"));
      document.querySelector(`[data-type="${type}"]`).classList.add("active");
      currentFormatType = type;
      updatePlaceholder();
    });
  });
}

// Initialize sample buttons if needed
// addSampleButtons();
