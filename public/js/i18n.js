/* Robust i18n for TEXIM ONE
   - Non-blocking, defensive, small footprint
   - Reads/writes localStorage texim_lang
   - Applies data-i18n and data-i18n-placeholder
   - Exposes window.t(key) and window.setLang(lang)
   - Safe to run multiple times
*/
(function () {
  'use strict';

  const I18N_KEY = 'texim_lang';

  // Minimal dictionary. Keep in sync with server-side HTML fallbacks.
  const SITE_STRINGS = {
    en: {
      'nav.home': 'Home',
      'nav.about': 'About',
      'nav.convoy': 'Convoy',
      'nav.media': 'Media',
      'nav.join': 'Join Us',
      'nav.invite': 'Invite',

      'hero.subtitle': 'Virtual Trucking Logistics',
      'hero.text': 'TEXIM ONE is a virtual trucking company that shows up for convoys across the TruckersMP community. Planning an event? Invite us along; no pressure, no obligations.',
      'hero.btn1': 'Our Convoys',
      'hero.btn2': 'Media',
      'hero.invite': 'Invite us to a convoy',
      'hero.discord': 'Discord',
      'hero.join': 'Join Us',

      'convoy.inviteTitle': 'Invite Us to Your Convoy',
      'convoy.inviteSub': 'Fill out the form and we will send your invite to our Discord channel.'
    },
    bg: {
      'nav.home': 'Начало',
      'nav.about': 'За нас',
      'nav.convoy': 'Конвои',
      'nav.media': 'Медия',
      'nav.join': 'Кандидатствайте',
      'nav.invite': 'Покани',

      'hero.subtitle': 'Виртуална транспортна логистика',
      'hero.text': 'TEXIM ONE е виртуална транспортна компания, която участва в конвои в общността TruckersMP. Поканете ни без натиск.',
      'hero.btn1': 'Нашите конвои',
      'hero.btn2': 'Медия',
      'hero.invite': 'Покани ни на конвой',
      'hero.discord': 'Discord',
      'hero.join': 'Кандидатствайте',

      'convoy.inviteTitle': 'Покани ни на конвой',
      'convoy.inviteSub': 'Попълнете формата и ще изпратим поканата до нашия Discord.'
    }
  };

  function safeGetStoredLang() {
    try {
      const v = localStorage.getItem(I18N_KEY);
      if (v === 'bg') return 'bg';
      return 'en';
    } catch (err) {
      // localStorage may be disabled
      console.warn('i18n: localStorage not available', err);
      return 'en';
    }
  }

  function setStoredLang(lang) {
    try {
      localStorage.setItem(I18N_KEY, lang === 'bg' ? 'bg' : 'en');
    } catch (err) {
      // ignore
    }
  }

  function getCurrentLang() {
    return safeGetStoredLang();
  }

  // Public setter used by UI
  function setLang(lang) {
    const normalized = (lang === 'bg') ? 'bg' : 'en';
    setStoredLang(normalized);
    applyLang(normalized);
  }

  // Apply translations to the DOM. Defensive: do not throw.
  function applyLang(lang) {
    try {
      const dict = SITE_STRINGS[lang] || SITE_STRINGS.en;

      // data-i18n text nodes
      const nodes = document.querySelectorAll('[data-i18n]');
      nodes.forEach((el) => {
        try {
          const key = el.getAttribute('data-i18n');
          if (!key) return;
          const val = dict[key];
          if (val != null) {
            // preserve inner HTML for links/buttons that intentionally contain markup?
            // Use textContent to keep things simple and safe.
            el.textContent = val;
          }
        } catch (er) {
          // ignore element-level failures
          console.debug('i18n: element update failed', el, er);
        }
      });

      // data-i18n-placeholder attributes
      const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
      placeholders.forEach((el) => {
        try {
          const key = el.getAttribute('data-i18n-placeholder');
          if (!key) return;
          const val = dict[key];
          if (val != null) el.setAttribute('placeholder', val);
        } catch (er) {
          console.debug('i18n: placeholder update failed', el, er);
        }
      });

      // Update html lang attribute
      try {
        document.documentElement.setAttribute('lang', lang);
      } catch (er) {
        // ignore
      }

      // Notify listeners
      try {
        document.dispatchEvent(new CustomEvent('texim:langchange', { detail: { lang } }));
      } catch (er) {
        // ignore
      }

      return true;
    } catch (err) {
      console.error('i18n: applyLang failed', err);
      return false;
    }
  }

  // Bind UI controls (langSwitcher select and any .lang-option buttons)
  function bindControls() {
    try {
      const switcher = document.getElementById('langSwitcher');
      if (switcher) {
        // set current value defensively
        try { switcher.value = getCurrentLang(); } catch (e) { /* ignore */ }
        switcher.addEventListener('change', function (e) {
          setLang(e.target.value);
        });
      }

      document.querySelectorAll('.lang-option[data-lang]').forEach((btn) => {
        try {
          btn.addEventListener('click', function () {
            const lang = btn.getAttribute('data-lang');
            setLang(lang);
            const modal = document.getElementById('langModal');
            if (modal) modal.classList.remove('open');
            if (switcher) try { switcher.value = getCurrentLang(); } catch (e) {}
          });
        } catch (er) { /* ignore per-button errors */ }
      });
    } catch (err) {
      console.debug('i18n: bindControls failed', err);
    }
  }

  // Public accessor for other scripts
  function t(key) {
    try {
      const lang = getCurrentLang();
      const dict = SITE_STRINGS[lang] || SITE_STRINGS.en;
      if (dict[key] != null) return dict[key];
      // fallback to english if missing
      if (SITE_STRINGS.en[key] != null) return SITE_STRINGS.en[key];
      return key;
    } catch (err) {
      return key;
    }
  }

  // Expose to window in a safe way
  try {
    window.t = t;
    window.setLang = setLang;
    window.getCurrentLang = getCurrentLang;
  } catch (err) {
    // ignore
  }

  // Initialize when DOM ready
  function initOnce() {
    bindControls();
    applyLang(getCurrentLang());

    // show modal on first visit if desired
    try {
      const stored = localStorage.getItem(I18N_KEY);
      if (!stored) {
        const modal = document.getElementById('langModal');
        if (modal) setTimeout(() => modal.classList.add('open'), 600);
      }
    } catch (err) {
      // ignore
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOnce);
  } else {
    // already ready
    setTimeout(initOnce, 0);
  }

})();
