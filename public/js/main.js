// Preloader
window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        preloader.style.transition = 'opacity 0.3s ease';
        setTimeout(() => { preloader.style.display = 'none'; }, 300);
    }
});

// Year in footer
const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

// Mobile navigation
function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('#mobileNav');
    if (!toggle || !nav || toggle.dataset.mobileNavReady === 'true') return;

    toggle.dataset.mobileNavReady = 'true';

    function setMenu(open) {
        toggle.classList.toggle('is-open', open);
        nav.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    toggle.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        setMenu(!nav.classList.contains('is-open'));
    });

    nav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => setMenu(false));
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') setMenu(false);
    });

    document.addEventListener('click', event => {
        if (!nav.classList.contains('is-open')) return;
        if (!nav.contains(event.target) && !toggle.contains(event.target)) setMenu(false);
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) setMenu(false);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNav, { once: true });
} else {
    initMobileNav();
}

// Gallery + Lightbox
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.gallery-grid');
    if (!grid) return;
    const items = Array.from(grid.children);
    for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
    }
    items.forEach(item => grid.appendChild(item));
    const links = Array.from(grid.querySelectorAll('.gallery-link'));
    if (!links.length) return;

    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Image gallery');
    lb.innerHTML = '<button class="lightbox-close" aria-label="Close">&times;</button><button class="lightbox-nav lightbox-prev" aria-label="Previous">&#8249;</button><img class="lightbox-image" alt=""><button class="lightbox-nav lightbox-next" aria-label="Next">&#8250;</button><div class="lightbox-caption"></div><div class="lightbox-counter"></div>';
    document.body.appendChild(lb);
    const lbImage = lb.querySelector('.lightbox-image');
    const lbCaption = lb.querySelector('.lightbox-caption');
    const lbCounter = lb.querySelector('.lightbox-counter');
    const closeBtn = lb.querySelector('.lightbox-close');
    const prevBtn = lb.querySelector('.lightbox-prev');
    const nextBtn = lb.querySelector('.lightbox-next');
    let currentIndex = 0, isOpen = false, swapTimer = null;
    const captionFor = link => { const img = link.querySelector('img'); return img ? (img.getAttribute('data-caption') || img.alt || '') : ''; };
    const preload = index => { const i = (index + links.length) % links.length; const img = new Image(); img.src = links[i].getAttribute('href'); };
    function show(index) {
        currentIndex = (index + links.length) % links.length;
        const link = links[currentIndex], href = link.getAttribute('href'), thumb = link.querySelector('img');
        lbImage.classList.add('lightbox-image--loading');
        clearTimeout(swapTimer);
        swapTimer = setTimeout(() => {
            lbImage.onload = lbImage.onerror = () => lbImage.classList.remove('lightbox-image--loading');
            lbImage.src = href;
            lbImage.alt = thumb ? (thumb.alt || '') : '';
            lbCaption.textContent = captionFor(link);
            lbCounter.textContent = (currentIndex + 1) + ' / ' + links.length;
            preload(currentIndex + 1);
            preload(currentIndex - 1);
        }, 160);
    }
    function open(index) { currentIndex = index; show(index); lb.classList.add('open'); document.body.style.overflow = 'hidden'; isOpen = true; setTimeout(() => closeBtn.focus(), 50); }
    function close() { lb.classList.remove('open'); document.body.style.overflow = ''; isOpen = false; clearTimeout(swapTimer); setTimeout(() => { lbImage.src = ''; lbImage.classList.remove('lightbox-image--loading'); }, 300); }
    function showPrev() { if (isOpen) show(currentIndex - 1); }
    function showNext() { if (isOpen) show(currentIndex + 1); }
    links.forEach((link, idx) => link.addEventListener('click', e => { e.preventDefault(); open(idx); }));
    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => { if (!isOpen) return; if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') showPrev(); else if (e.key === 'ArrowRight') showNext(); });
    let touchStartX = 0, touchStartY = 0;
    lb.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; }, { passive: true });
    lb.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - touchStartX, dy = e.changedTouches[0].clientY - touchStartY; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) dx < 0 ? showNext() : showPrev(); }, { passive: true });
});
