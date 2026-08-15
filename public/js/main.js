// Preloader
window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        preloader.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 300);
    }
});

// Year in footer
const yearSpan = document.getElementById('year');
if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
}

// Shuffle gallery items on every page load to randomize thumbnail order
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.gallery-grid');
  if (!grid) return;

  // Fisher-Yates shuffle of the DOM elements
  const items = Array.from(grid.children);
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  // Re-append in shuffled order
  items.forEach(item => grid.appendChild(item));
});
