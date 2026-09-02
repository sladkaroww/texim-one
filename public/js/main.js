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

  // Lightbox setup
  const links = Array.from(grid.querySelectorAll('.gallery-link'));
  if (!links.length) return;

  const lightbox = document.getElementById('lightbox');
  const lbImage = lightbox && lightbox.querySelector('.lightbox-image');
  const lbCaption = lightbox && lightbox.querySelector('.lightbox-caption');
  const closeBtn = lightbox && lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox && lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox && lightbox.querySelector('.lightbox-next');

  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = (index + links.length) % links.length;
    const href = links[currentIndex].getAttribute('href');
    const imgEl = links[currentIndex].querySelector('img');
    if (lbImage) lbImage.src = href;
    if (lbImage) lbImage.alt = imgEl ? imgEl.alt || '' : '';
    if (lbCaption) lbCaption.textContent = imgEl ? (imgEl.getAttribute('data-caption') || imgEl.alt || '') : '';
    if (lightbox) lightbox.classList.add('open');
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    if (lightbox) lightbox.classList.remove('open');
    if (lbImage) lbImage.src = '';
  }

  function showPrev() { openLightbox(currentIndex - 1); }
  function showNext() { openLightbox(currentIndex + 1); }

  links.forEach((link, idx) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(idx);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', showPrev);
  if (nextBtn) nextBtn.addEventListener('click', showNext);

  // Close when clicking outside image
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });
});