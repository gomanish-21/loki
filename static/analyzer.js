document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById("analyze-btn");
  const inputText = document.getElementById("input-text");
  const outputText = document.getElementById("output-text");
  const clearInputBtn = document.getElementById("clear-input");
  const errorMessage = document.getElementById("error-message");

  analyzeBtn.addEventListener("click", async () => {
    const sql = inputText.value.trim();
    if (!sql) {
      showError("Please enter some SQL to analyze.");
      return;
    }

    try {
      const response = await fetch("/api/analyze-sql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "An unknown error occurred.");
      }

      const data = await response.json();
      outputText.textContent = data.analysis;
      hideError();
    } catch (error) {
      showError(error.message);
    }
  });

  clearInputBtn.addEventListener("click", () => {
    inputText.value = "";
    outputText.textContent = "";
    hideError();
  });

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
  }

  function hideError() {
    errorMessage.classList.add("hidden");
  }
});

function navigateTo(url) {
  window.location.href = url;
}
