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
      // Navigation
      'nav.home': 'Home',
      'nav.convoy': 'Events',
      'nav.media': 'Media',
      'nav.join': 'Apply',
      'nav.partnerships': 'Partnerships',

      // Home - Hero section
      'hero.tagline': 'Always 1 in mind, behind TEXIM!',
      'hero.subtitle': 'Virtual Trucking Company',
      'hero.text': 'TEXIM ONE started on January 1, 2026 as a natural continuation of TEXIM, founded on March 10, 2019.',
      'hero.discord': 'Discord',

      // Home - Stats
      'stat.drivers': '10+ Employees',
      'stat.founded': '7+ Years Experience',
      'stat.km': '9+ Million WoTr km',
      'stat.discord': '80+ Discord Members',

      // Home - Section titles
      'home.staff': 'The People Behind the Wheel',
      'home.staffDesc': 'Integration with members from TruckersMP',
      'home.panels': 'Our Values',

      // Home - Panel titles
      'panel.accessibility': 'Accessibility',
      'panel.accessibilityDesc': 'No monthly km limits, mandatory convoy attendance, age requirements, game hours, DLCs, or trial period.',
      'panel.identity': 'Corporate Identity',
      'panel.identityDesc': 'Recognizable branding: truck, trailer, bus, avatar, and tag.',
      'panel.hierarchy': 'Hierarchy',
      'panel.hierarchyDesc': 'Our reputation system rewards active members with more weight in decision-making.',
      'panel.prestige': 'Prestige',
      'panel.prestigeDesc': 'Own Twitch Team and Merch - exclusive to only the largest communities.',

      // Events page
      'events.title': 'Events',
      'events.allEvents': 'All events we are invited to.',
      'events.invite': 'Invite Us',
      'events.inviteText': 'Fill out the form and we will share the invitation with our Discord members.',
      'events.calendar': 'Calendar',
      'events.calendarText': 'All upcoming events.',
      // Convoy page specific translations
      'convoy.none': 'No upcoming events',
      'convoy.error': 'Failed to load events',
      'convoy.meet': 'Meeting point',
      'convoy.view': 'View event'

      // Media page
      'media.title': 'Media',
      'media.sub': 'Our story, our moments, our community.',
      'media.twitch': 'Twitch Team',
      'media.twitchText': 'Follow our Twitch Team where we stream live for the community!',
      'media.watch': 'Watch',
      'media.gallery': 'Gallery',
      'media.galleryText': 'Top 9 frames with colleagues. (photos with at least 4 team members)',
      'media.news': 'News',
      'media.newsText': 'TEXIM ONE on TruckersMP.',

      // Apply page
      'apply.title': 'Apply to TEXIM ONE',
      'apply.form': 'Application Form',

      // Partnerships page
      'partnerships.title': 'Partnerships',
      'partnerships.texim': 'TEXIM ONE Vtc & TEXIM ONE Ltd',
      'partnerships.merchDesc': 'The iconic T1 logo is presented as an embroidered patch measuring 5-6 cm, placed on the classic position on the left chest.',
      'partnerships.colorDesc': 'For individual personalization, we offer 420 thread colors for perfect combination with your clothes, ranging from 5 to 11 colors depending on the model.',
      'partnerships.materialDesc': 'We chose an American brand with heavyweight material and oversized fit. The collection includes t-shirts, hoodies, and sweatshirts in sizes XS to 2XL.',
      'partnerships.button': 'Shop Merch',
      'partnerships.contact': 'If you want to partner with us for creating custom merch, joining our Twitch Team, or other collaborative initiatives, you can contact us on our Discord server.',

      // Footer
      'footer.about': 'Virtual trucking logistics since 2019.',
      'footer.company': 'Company',
      'footer.credit': 'Made with ❤️ by sladkaroww'
    },
    bg: {
      // Navigation
      'nav.home': 'Начало',
      'nav.convoy': 'События',
      'nav.media': 'Медия',
      'nav.join': 'Кандидатствай',
      'nav.partnerships': 'Партньорства',

      // Home - Hero section
      'hero.tagline': 'Винаги 1 на ум, зад TEXIM!',
      'hero.subtitle': 'Виртуална транспортна компания',
      'hero.text': 'TEXIM ONE стартира на 1 януари 2026 г. като естествено продължение на TEXIM, основана на 10 март 2019 г.',
      'hero.discord': 'Discord',

      // Home - Stats
      'stat.drivers': '10+ Служители',
      'stat.founded': '7+ Години опит',
      'stat.km': '9+ Млн WoTr км',
      'stat.discord': '80+ Discord членове',

      // Home - Section titles
      'home.staff': 'Хората зад волана',
      'home.staffDesc': 'Интеграция със служителите от TruckersMP',
      'home.panels': 'Нашите ценности',

      // Home - Panel titles
      'panel.accessibility': 'Достъпност',
      'panel.accessibilityDesc': 'Не изискваме месечен лимит от километри, задължително участие в конвои, определена възраст, часове в играта, DLC-та или тестов период.',
      'panel.identity': 'Идентичност',
      'panel.identityDesc': 'Разпознаваем фирмен брандинг: влекач, ремарке, автобус, аватар и таг.',
      'panel.hierarchy': 'Йерархия',
      'panel.hierarchyDesc': 'Нашата система за репутация възнаграждава по-активните във фирмата с повече тежест при вземането на решения.',
      'panel.prestige': 'Престиж',
      'panel.prestigeDesc': 'Собствен Twitch Team и Merch - само за малка част от най-големите общности.',

      // Events page
      'events.title': 'События',
      'events.allEvents': 'Всички събития, на които сме поканени.',
      'events.invite': 'Покани ни',
      'events.inviteText': 'Попълнете формуляра и ще споделим поканата с членовете в нашия Discord сървър.',
      'events.calendar': 'Календар',
      'events.calendarText': 'Всички предстоящи събития.',
      // Convoy page specific translations
      'convoy.none': 'Няма предстоящи събития',
      'convoy.error': 'Неуспешно зареждане на събития',
      'convoy.meet': 'Среща',
      'convoy.view': 'Преглед на събитие'

      // Media page
      'media.title': 'Медия',
      'media.sub': 'Нашата история, нашите моменти, нашата общност.',
      'media.twitch': 'Twitch отбор',
      'media.twitchText': 'Следете нашия Twitch отбор, с който стриймваме на живо за общността!',
      'media.watch': 'Гледай',
      'media.gallery': 'Галерия',
      'media.galleryText': 'Топ 9 кадри с колегите. (снимки с поне 4-ма от фирмата)',
      'media.news': 'Новини',
      'media.newsText': 'TEXIM ONE в TruckersMP.',

      // Apply page
      'apply.title': 'Кандидатствай за TEXIM ONE',
      'apply.form': 'Формуляр за кандидатстване',

      // Partnerships page
      'partnerships.title': 'Партньорства',
      'partnerships.texim': 'TEXIM ONE Vtc & TEXIM ONE Ltd',
      'partnerships.merchDesc': 'Познатото лого T1 е представено под формата на бродерия с размер 5–6 см, разположено на класическото място отпред отляво на гърдите.',
      'partnerships.colorDesc': 'За индивидуална персонализация предлагаме 420 цвята конци с цел перфектна комбинация с дрехите, които варират от 5 до 11 цвята в зависимост от модела.',
      'partnerships.materialDesc': 'Заложихме на американски бранд с Heavyweight материя и Oversized кройка. Колекцията включва тениски, суитшърти и худита, в размери от XS до 2XL.',
      'partnerships.button': 'Магазин Merch',
      'partnerships.contact': 'Ако искате да си партнираме за създаване на собствен Merch, присъединяване към нашия Twitch Team или други съвместни инициативи, можете да се свържете с нас в нашия Discord сървър.',

      // Footer
      'footer.about': 'Виртуална транспортна логистика от 2019 г.',
      'footer.company': 'Компания',
      'footer.credit': 'Направено с ❤️ от sladkaroww'
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
