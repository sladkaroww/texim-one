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
      'nav.about': 'About',
      'nav.convoy': 'Convoy',
      'nav.media': 'Media',
      'nav.join': 'Join Us',
      'nav.invite': 'Invite',

      // Hero section
      'hero.subtitle': 'Virtual Trucking Logistics',
      'hero.text': 'TEXIM ONE is a virtual trucking company that shows up for convoys across the TruckersMP community. Planning an event? Invite us along; no pressure, no obligations.',
      'hero.btn1': 'Our Convoys',
      'hero.btn2': 'Media',
      'hero.invite': 'Invite us to a convoy',
      'hero.discord': 'Discord',
      'hero.join': 'Join Us',

      // Stats section
      'stat.drivers': 'Active Members',
      'stat.founded': 'Years Active',
      'stat.km': 'Million km',
      'stat.discord': 'Discord Members',

      // Features section
      'features.title': 'Why?',
      'features.sub': 'A virtual trucking experience built around accessibility and community.',
      'features.f1.title': 'No Limits, No Pressure',
      'features.f1.text': 'No monthly km limits, no required convoy attendance, no age or hours requirements.',
      'features.f2.title': 'Distinct Corporate Identity',
      'features.f2.text': 'Recognizable through our TMP tag, avatar, and signature truck + trailer composition.',
      'features.f3.title': 'Selective Recruitment',
      'features.f3.text': 'Applications are reviewed individually via our application form.',
      'features.f4.title': 'Ranks',
      'features.f4.text': 'Our Reputation System ranks every driver by contribution: Newbie, Enthusiast, Worker, Master, Instructor.',

      // Footer
      'footer.about': 'Virtual trucking logistics since 2019.',
      'footer.company': 'Company',

      // Convoy page
      'convoy.inviteTitle': 'Invite Us to a Convoy',
      'convoy.inviteSub': 'Fill out the form and we will send your invite to our Discord channel.',
      'convoy.formTitle': 'Convoy Invitation Form',
      'convoy.calendar': 'Calendar',

      // Media page
      'media.title': 'Media',
      'media.sub': 'Our story, our moments, our community.',
      'media.twitch': 'Twitch Team',
      'media.twitch.text': 'Watch our official TruckersMP Twitch Team streaming convoys and community moments live.',
      'media.gallery': 'Gallery',
      'media.gallery.sub': 'Best moments from our convoys - 9 latest photos',
      'media.news': 'News',
      'media.news.text': 'Latest publications and updates from TEXIM ONE.',

      // Join/Apply page
      'join.title': 'Join TEXIM ONE',
      'join.subtitle': 'Start Your Journey With Us',
      'join.form': 'Application Form',
      'join.formText': 'Fill out our application form to join the team.',
      'join.discord': 'Join Our Discord',
      'join.discordText': 'Connect with our community on Discord.',

      // Partnerships page
      'partnerships.title': 'Partnerships',
      'partnerships.sub': 'Our collaborations and integrations.',
      'partnerships.screenshots': 'Screenshots & Collection',
      'partnerships.designs': 'Designs & Concepts',
      'partnerships.social': 'Social Links',

      // Footer sections
      'footer.hotspots': 'Hot Spots on the Site',
      'footer.logo': 'Logo',
      'footer.pages': 'Pages',
      'footer.language': 'Language',
      'footer.links': 'Links',
      'footer.credit': 'Made with ❤️ by sladkaroww'
    },
    bg: {
      // Navigation
      'nav.home': 'Начало',
      'nav.about': 'За нас',
      'nav.convoy': 'Конвои',
      'nav.media': 'Медия',
      'nav.join': 'Присъедини се',
      'nav.invite': 'Покани',

      // Hero section
      'hero.subtitle': 'Виртуална транспортна логистика',
      'hero.text': 'TEXIM ONE е виртуална транспортна компания, която участва в конвои в общността TruckersMP. Поканете ни без натиск и задължения.',
      'hero.btn1': 'Нашите конвои',
      'hero.btn2': 'Медия',
      'hero.invite': 'Покани ни на конвой',
      'hero.discord': 'Discord',
      'hero.join': 'Присъедини се',

      // Stats section
      'stat.drivers': 'Активни членове',
      'stat.founded': 'Години активност',
      'stat.km': 'Млн км',
      'stat.discord': 'Членове в Discord',

      // Features section
      'features.title': 'Защо?',
      'features.sub': 'Виртуално шофиране, изградено около достъпността и общността.',
      'features.f1.title': 'Без лимити, без натиск',
      'features.f1.text': 'Без месечни километри, без задължително участие в конвои, без изисквания за възраст или часове.',
      'features.f2.title': 'Отличителна фирмена идентичност',
      'features.f2.text': 'Разпознаваеми по нашия TMP таг, аватар и характерна композиция влекач + ремарке.',
      'features.f3.title': 'Селективно набиране',
      'features.f3.text': 'Кандидатурите се разглеждат индивидуално чрез нашата форма.',
      'features.f4.title': 'Рангове',
      'features.f4.text': 'Нашата система за репутация ранжира всеки шофьор по принос: Новак, Ентусиаст, Работник, Майстор, Инструктор.',

      // Footer
      'footer.about': 'Виртуална транспортна логистика от 2019 г.',
      'footer.company': 'Компания',

      // Convoy page
      'convoy.inviteTitle': 'Покани ни на конвой',
      'convoy.inviteSub': 'Попълнете формата и ще изпратим поканата до нашия Discord канал.',
      'convoy.formTitle': 'Формуляр за поканване на конвой',
      'convoy.calendar': 'Календар',

      // Media page
      'media.title': 'Медия',
      'media.sub': 'Нашата история, нашите моменти, нашата общност.',
      'media.twitch': 'Twitch отбор',
      'media.twitch.text': 'Гледайте нашия официален TMP Twitch отбор, където излъчваме конвои и моменти от общността.',
      'media.gallery': 'Галерия',
      'media.gallery.sub': 'Най-добрите моменти от нашите конвои - 9 последни снимки',
      'media.news': 'Новини',
      'media.news.text': 'Последни публикации и актуализации от TEXIM ONE.',

      // Join/Apply page
      'join.title': 'Присъедини се към TEXIM ONE',
      'join.subtitle': 'Започни своето пътешествие с нас',
      'join.form': 'Формуляр за кандидатстване',
      'join.formText': 'Попълнете нашия формуляр за кандидатстване, за да се присъедините към екипа.',
      'join.discord': 'Присъедини се към Discord',
      'join.discordText': 'Свържете се с нашата общност в Discord.',

      // Partnerships page
      'partnerships.title': 'Партньорства',
      'partnerships.sub': 'Нашите сътрудничества и интеграции.',
      'partnerships.screenshots': 'Снимки и колекция',
      'partnerships.designs': 'Дизайни и концепции',
      'partnerships.social': 'Социални връзки',

      // Footer sections
      'footer.hotspots': 'Горещи точки на сайта',
      'footer.logo': 'Лого',
      'footer.pages': 'Страници',
      'footer.language': 'Език',
      'footer.links': 'Връзки',
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
