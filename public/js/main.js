// Mobile navigation
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');
const navClose = document.getElementById('navClose');
const navLinks = document.querySelectorAll('.nav-link');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        nav.classList.add('active');
        navToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
}

if (navClose) {
    navClose.addEventListener('click', () => closeNav());
}

function closeNav() {
    if (nav) {
        nav.classList.remove('active');
    }
    if (navToggle) {
        navToggle.classList.remove('active');
    }
    document.body.style.overflow = '';
}

navLinks.forEach(link => {
    link.addEventListener('click', () => closeNav());
});

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
