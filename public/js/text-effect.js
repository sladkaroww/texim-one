import { animate } from 'https://cdn.jsdelivr.net/npm/motion@11.12.0/+esm';

const DEFAULT_STAGGER = 0.05;
const DEFAULT_DURATION = 0.3;

export function TextEffect(element, {
    per = 'word',
    preset = 'fade',
    delay = 0,
    speedReveal = 1,
    speedSegment = 1,
} = {}) {
    if (!element || element.dataset.textEffectReady === 'true') return;

    const text = element.textContent.trim();
    if (!text) return;

    const segments = per === 'word' ? text.split(/(\s+)/) : [text];
    element.textContent = '';
    element.dataset.textEffectReady = 'true';

    const visibleSegments = [];

    segments.forEach((segment) => {
        const span = document.createElement('span');
        span.setAttribute('aria-hidden', 'true');
        span.style.display = 'inline-block';
        span.style.whiteSpace = 'pre';
        span.textContent = segment;

        if (/^\s+$/.test(segment)) {
            span.style.display = 'inline';
        } else {
            visibleSegments.push(span);
        }

        element.appendChild(span);
    });

    const from = {
        blur: { opacity: 0, filter: 'blur(12px)' },
        'fade-in-blur': { opacity: 0, y: 20, filter: 'blur(12px)' },
        scale: { opacity: 0, scale: 0 },
        fade: { opacity: 0 },
        slide: { opacity: 0, y: 20 },
    }[preset] || { opacity: 0 };

    const to = {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        scale: 1,
    };

    visibleSegments.forEach((span, index) => {
        animate(span, from, {
            duration: DEFAULT_DURATION / speedSegment,
            delay: delay + (index * DEFAULT_STAGGER) / speedReveal,
            easing: 'ease-out',
        });

        animate(span, to, {
            duration: DEFAULT_DURATION / speedSegment,
            delay: delay + (index * DEFAULT_STAGGER) / speedReveal,
            easing: 'ease-out',
        });
    });
}

window.TextEffect = TextEffect;
