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

// Policies navigation
function initPoliciesNav() {
    const navList = document.querySelector('.nav-list');
    if (!navList || navList.querySelector('.nav-policies')) return;

    const policiesItem = document.createElement('li');
    policiesItem.className = 'nav-policies';
    policiesItem.innerHTML = `
        <button class="nav-policies-toggle" type="button" aria-expanded="false" aria-haspopup="true">Policies <span aria-hidden="true">▾</span></button>
        <ul class="nav-policies-menu">
            <li><a href="/privacy.html" class="nav-link">Privacy Policy</a></li>
            <li><a href="/terms.html" class="nav-link">Terms of Use</a></li>
        </ul>
    `;

    navList.appendChild(policiesItem);

    const style = document.createElement('style');
    style.id = 'texim-policies-nav-style';
    style.textContent = `
        .nav-policies { position: relative; }
        .nav-policies-toggle {
            appearance: none;
            border: 0;
            background: transparent;
            color: #555555;
            font-family: 'Orbitron', sans-serif;
            font-size: 0.95rem;
            font-weight: 400;
            line-height: inherit;
            cursor: pointer;
            padding: 0;
            transition: color 0.2s;
        }
        .nav-policies-toggle:hover,
        .nav-policies.is-open .nav-policies-toggle,
        .nav-policies:focus-within .nav-policies-toggle { color: #111111; }
        .nav-policies-toggle span { display: inline-block; margin-left: .25rem; font-size: .7em; transition: transform .2s ease; }
        .nav-policies.is-open .nav-policies-toggle span { transform: rotate(180deg); }
        .nav-policies-menu {
            position: absolute;
            top: calc(100% + .7rem);
            right: 0;
            min-width: 180px;
            margin: 0;
            padding: .45rem;
            list-style: none;
            background: rgba(12, 12, 12, .98);
            border: 1px solid rgba(255, 255, 255, .12);
            border-radius: 8px;
            box-shadow: 0 12px 30px rgba(0, 0, 0, .25);
            opacity: 0;
            visibility: hidden;
            transform: translateY(-6px);
            transition: opacity .18s ease, transform .18s ease, visibility .18s ease;
            z-index: 1000;
        }
        .nav-policies:hover .nav-policies-menu,
        .nav-policies.is-open .nav-policies-menu,
        .nav-policies:focus-within .nav-policies-menu {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        .nav-policies-menu .nav-link {
            display: block;
            padding: .65rem .8rem;
            border-radius: 6px;
            white-space: nowrap;
            font-family: 'Orbitron', sans-serif;
            font-size: 0.95rem;
            color: #ffffff;
        }
        .nav-policies-menu .nav-link:hover,
        .nav-policies-menu .nav-link.active {
            background: rgba(255, 255, 255, .08);
            color: #ffffff;
        }
        @media (max-width: 768px) {
            .nav-policies { width: 100%; }
            .nav-policies-toggle { width: 100%; text-align: left; }
            .nav-policies-menu {
                position: static;
                min-width: 0;
                padding: 0 0 0 .8rem;
                margin-top: .35rem;
                background: transparent;
                border: 0;
                border-radius: 0;
                box-shadow: none;
                opacity: 1;
                visibility: visible;
                transform: none;
                display: none;
            }
            .nav-policies.is-open .nav-policies-menu { display: block; }
            .nav-policies-menu .nav-link { color: #555555; }
            .nav-policies-menu .nav-link:hover,
            .nav-policies-menu .nav-link.active { color: #111111; background: transparent; }
        }
    `;
    document.head.appendChild(style);

    const toggle = policiesItem.querySelector('.nav-policies-toggle');
    const menu = policiesItem.querySelector('.nav-policies-menu');

    function setPoliciesMenu(open) {
        policiesItem.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    toggle.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        setPoliciesMenu(!policiesItem.classList.contains('is-open'));
    });

    menu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => setPoliciesMenu(false));
    });

    document.addEventListener('click', event => {
        if (!policiesItem.contains(event.target)) setPoliciesMenu(false);
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') setPoliciesMenu(false);
    });

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const currentLink = menu.querySelector(`a[href="/${currentPage}"]`);
    if (currentLink) {
        currentLink.classList.add('active');
        toggle.classList.add('active');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPoliciesNav, { once: true });
} else {
    initPoliciesNav();
}

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
