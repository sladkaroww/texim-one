import { animate } from 'https://cdn.jsdelivr.net/npm/motion@11.12.0/+esm';

const PRESETS = {
    blur: {
        opacity: [0, 1],
        filter: ['blur(12px)', 'blur(0px)'],
    },
    'fade-in-blur': {
        opacity: [0, 1],
        y: [20, 0],
        filter: ['blur(12px)', 'blur(0px)'],
    },
    fade: {
        opacity: [0, 1],
    },
    slide: {
        opacity: [0, 1],
        y: [20, 0],
    },
    scale: {
        opacity: [0, 1],
        scale: [0, 1],
    },
};

export function TextEffect(element, options = {}) {
    if (!element || element.dataset.textEffectReady === 'true') return;

    const {
        per = 'word',
        preset = 'fade',
        delay = 0,
        speedReveal = 1,
        speedSegment = 1,
    } = options;

    const text = element.textContent.trim();
    if (!text) return;

    const segments = per === 'word' ? text.split(/(\s+)/) : [text];
    const words = segments.filter((segment) => !/^\s+$/.test(segment));

    element.textContent = '';
    element.dataset.textEffectReady = 'true';
    element.setAttribute('aria-label', text);

    segments.forEach((segment) => {
        const span = document.createElement('span');
        span.textContent = segment;

        if (/^\s+$/.test(segment)) {
            span.style.whiteSpace = 'pre';
        } else {
            span.setAttribute('aria-hidden', 'true');
            span.style.display = 'inline-block';
            span.style.whiteSpace = 'pre';
            span.style.opacity = '0';
        }

        element.appendChild(span);
    });

    const wordElements = Array.from(element.children).filter(
        (span) => span.getAttribute('aria-hidden') === 'true'
    );

    const presetValues = PRESETS[preset] || PRESETS.fade;

    animate(wordElements, presetValues, {
        duration: 0.3 / speedSegment,
        delay: (index) => delay + (index * 0.05) / speedReveal,
        ease: 'easeOut',
    });
}
