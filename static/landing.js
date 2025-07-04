// Landing page functionality
document.addEventListener("DOMContentLoaded", function () {
  // Add click event listeners to tool cards
  const toolCards = document.querySelectorAll(".tool-card");

  toolCards.forEach((card) => {
    card.addEventListener("click", function () {
      // Add click animation
      this.style.transform = "scale(0.98)";
      setTimeout(() => {
        this.style.transform = "";
      }, 150);
    });
  });
});

// Navigation function
function navigateTo(path) {
  // Add loading state
  const clickedCard = event.currentTarget;
  const originalContent = clickedCard.innerHTML;

  clickedCard.innerHTML =
    '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';
  clickedCard.style.pointerEvents = "none";

  // Navigate after a brief delay for visual feedback
  setTimeout(() => {
    window.location.href = path;
  }, 300);
}

// Add loading spinner styles
const style = document.createElement("style");
style.textContent = `
  .loading-spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;
    color: #667eea;
    font-size: 1.5rem;
  }
`;
document.head.appendChild(style);
