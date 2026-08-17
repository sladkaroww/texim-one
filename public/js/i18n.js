// TEXIM ONE - complete i18n rewrite
// Features:
// - Full English/Bulgarian dictionary
// - Defensive (won't throw if localStorage or DOM unavailable)
// - Exposes window.t, window.setLang, window.getCurrentLang
// - Applies data-i18n and data-i18n-placeholder
// - Shows a first-visit language modal if no choice stored
// - Allows manual modal injection if index.html doesn't include it

(function () {
  'use strict';

  const I18N_KEY = 'texim_lang';
  const DEFAULT_LANG = 'en';

  // Full dictionary (kept in sync with site). Shortened entries preserved from repo.
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

      'stat.drivers': 'Active Members',
      'stat.founded': 'Years Active',
      'stat.km': 'Million WoTr km',
      'stat.discord': 'Discord Members',

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

      'join.title': 'Join',
      'join.text': 'Join our Discord community and start your journey with TEXIM ONE.',
      'join.btn': 'Join Our Discord',
      'apply.btn': 'Apply to Join',

      'footer.about': 'Virtual trucking logistics since 2019.',
      'footer.company': 'Company',
      'footer.support': 'Support',
      'footer.language': 'Language',

      // Media
      'media.title': 'Media',
      'media.sub': 'Our story, our moments, our community.',
      'media.twitch': 'Twitch Team',
      'media.twitch.text': 'We run an official TruckersMP Twitch Team where we stream our convoys and community moments live.',
      'media.twitch.btn': 'Watch on Twitch',
      'gallery.title': 'Gallery',
      'media.news': 'News',
      'media.news.text': 'Latest publications and updates from TEXIM ONE.',
      'media.news.read': 'Read more',

      // Recent news (short)
      'media.news.69793.title': 'TEXIM ONE THE ORIGINAL™ MONTHLY CONVOY #6',
      'media.news.69793.text': 'On 8 August 2026 we took part in THE ORIGINAL Monthly Convoy #6.',
      'media.news.69383.title': 'TEXIM ONE Nova Group | Public Convoy #3',
      'media.news.69383.text': 'On 25 July 2026 we joined Nova Group | Public Convoy #3.',
      'media.news.68663.title': 'TEXIM ONE MERCH Collaboration',
      'media.news.68663.text': 'Our official merch collaboration with TEXIM ONE Ltd.',

      // Convoy / contact
      'convoy.title': 'Convoy',
      'convoy.sub': 'All upcoming convoys imported from TruckersMP.',
      'convoy.inviteTitle': 'Invite Us to a convoy',
      'convoy.inviteSub': 'Fill out the form and we will send your invite to our Discord channel.',
      'convoy.view': 'View',

      // Add-to-calendar
      'addconvoy.title': 'Add Convoy to Calendar',
      'addconvoy.confirm': 'Add to Calendar',
      'addconvoy.cancel': 'Cancel',

      // Language modal
      'lang.title': 'Choose your language',
      'lang.sub': 'Select your language',
      'lang.close': 'Close'
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

      'stat.drivers': 'Активни членове',
      'stat.founded': 'Години активност',
      'stat.km': 'Млн WoTr км',
      'stat.discord': 'Членове в Discord',

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

      'join.title': 'Присъедини се',
      'join.text': 'Присъедини се към нашата Discord общност и започни своето пътешествие с TEXIM ONE.',
      'join.btn': 'Кандидатствайте',
      'apply.btn': 'Кандидатствай',

      'footer.about': 'Виртуална транспортна логистика от 2019 г.',
      'footer.company': 'Компания',
      'footer.support': 'Поддръжка',
      'footer.language': 'Език',

      // Media
      'media.title': 'Медия',
      'media.sub': 'Нашата история, нашите моменти, нашата общност.',
      'media.twitch': 'Twitch отбор',
      'media.twitch.text': 'Разполагаме с официален TruckersMP Twitch отбор, където излъчваме нашите конвои и моменти от общността.',
      'media.twitch.btn': 'Гледай в Twitch',
      'gallery.title': 'Галерия',
      'media.news': 'Новини',
      'media.news.text': 'Последни публикации и актуализации от TEXIM ONE.',
      'media.news.read': 'Прочети',

      // Convoy / contact
      'convoy.title': 'Конвои',
      'convoy.sub': 'Всички предстоящи конвои от TruckersMP.',
      'convoy.inviteTitle': 'Покани ни на конвой',
      'convoy.inviteSub': 'Попълнете формата и ще изпратим поканата до нашия Discord.',
      'convoy.view': 'Виж',

      // Add-to-calendar
      'addconvoy.title': 'Добави конвой в календара',
      'addconvoy.confirm': 'Добави в календара',
      'addconvoy.cancel': 'Отказ',

      'lang.title': 'Изберете вашия език',
      'lang.sub': 'Изберете език',
      'lang.close': 'Затвори'
    }
  };

  // Utility: safe localStorage access
  function safeGetItem(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSetItem(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }

  function detectBrowserLang() {
    try {
      const nav = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage || '';
      if (!nav) return DEFAULT_LANG;
      if (nav.toLowerCase().startsWith('bg')) return 'bg';
      return 'en';
    } catch (e) {
      return DEFAULT_LANG;
    }
  }

  function getCurrentLang() {
    const stored = safeGetItem(I18N_KEY);
    if (stored === 'bg' || stored === 'en') return stored;
    return DEFAULT_LANG;
  }

  function setLang(lang) {
    const normalized = lang === 'bg' ? 'bg' : 'en';
    safeSetItem(I18N_KEY, normalized);
    applyLang(normalized);
  }

  // Core: apply translations
  function applyLang(lang) {
    const dict = SITE_STRINGS[lang] || SITE_STRINGS[DEFAULT_LANG];

    // Text content replacements
    try {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        try {
          const key = el.getAttribute('data-i18n');
          if (!key) return;
          if (dict[key] != null) {
            el.textContent = dict[key];
          }
        } catch (err) {
          // per-element error should not break everything
          console.debug('i18n: element update failed', err);
        }
      });
    } catch (err) {
      console.debug('i18n: data-i18n iteration failed', err);
    }

    // Placeholder replacements
    try {
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        try {
          const key = el.getAttribute('data-i18n-placeholder');
          if (!key) return;
          if (dict[key] != null) el.setAttribute('placeholder', dict[key]);
        } catch (err) {
          console.debug('i18n: placeholder update failed', err);
        }
      });
    } catch (err) {
      console.debug('i18n: placeholder iteration failed', err);
    }

    // Update lang attribute on html
    try { document.documentElement.setAttribute('lang', lang); } catch (e) {}

    // Notify
    try { document.dispatchEvent(new CustomEvent('texim:langchange', { detail: { lang } })); } catch (e) {}
  }

  // Build and inject a simple language modal if one does not exist
  function ensureLangModal() {
    if (document.getElementById('langModal')) return; // already present

    const modal = document.createElement('div');
    modal.id = 'langModal';
    modal.setAttribute('aria-hidden', 'true');
    modal.style.position = 'fixed';
    modal.style.inset = '0';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.background = 'rgba(0,0,0,0.6)';
    modal.style.zIndex = '9999';
    modal.style.visibility = 'hidden';
    modal.style.opacity = '0';
    modal.style.transition = 'opacity .18s ease';

    const inner = document.createElement('div');
    inner.className = 'lang-modal-content';
    inner.style.background = '#fff';
    inner.style.padding = '20px';
    inner.style.borderRadius = '8px';
    inner.style.maxWidth = '380px';
    inner.style.width = '92%';
    inner.style.textAlign = 'center';
    inner.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';

    const title = document.createElement('h3');
    title.id = 'langModalTitle';
    title.textContent = SITE_STRINGS.en['lang.title'];

    const subtitle = document.createElement('p');
    subtitle.textContent = SITE_STRINGS.en['lang.sub'];

    const actions = document.createElement('div');
    actions.className = 'lang-actions';
    actions.style.display = 'flex';
    actions.style.gap = '8px';
    actions.style.justifyContent = 'center';
    actions.style.marginBottom = '8px';

    const enBtn = document.createElement('button');
    enBtn.className = 'lang-option';
    enBtn.setAttribute('data-lang', 'en');
    enBtn.textContent = 'English';
    enBtn.style.padding = '8px 12px';
    enBtn.style.borderRadius = '6px';

    const bgBtn = document.createElement('button');
    bgBtn.className = 'lang-option';
    bgBtn.setAttribute('data-lang', 'bg');
    bgBtn.textContent = 'Български';
    bgBtn.style.padding = '8px 12px';
    bgBtn.style.borderRadius = '6px';
    bgBtn.style.background = '#0b5cff';
    bgBtn.style.color = '#fff';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'lang-close';
    closeBtn.textContent = SITE_STRINGS.en['lang.close'];
    closeBtn.style.marginTop = '8px';
    closeBtn.style.background = 'transparent';
    closeBtn.style.border = '0';
    closeBtn.style.color = '#666';

    actions.appendChild(enBtn);
    actions.appendChild(bgBtn);

    inner.appendChild(title);
    inner.appendChild(subtitle);
    inner.appendChild(actions);
    inner.appendChild(closeBtn);
    modal.appendChild(inner);
    document.body.appendChild(modal);

    // Event binding
    enBtn.addEventListener('click', () => { setLang('en'); hideModal(modal); updateSwitcher('en'); });
    bgBtn.addEventListener('click', () => { setLang('bg'); hideModal(modal); updateSwitcher('bg'); });
    closeBtn.addEventListener('click', () => hideModal(modal));
    modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(modal); });
  }

  function showModal() {
    try {
      const modal = document.getElementById('langModal');
      if (!modal) return;
      modal.style.visibility = 'visible';
      modal.style.opacity = '1';
      modal.setAttribute('aria-hidden', 'false');
    } catch (e) {}
  }

  function hideModal(modal) {
    try {
      if (!modal) modal = document.getElementById('langModal');
      if (!modal) return;
      modal.style.opacity = '0';
      modal.setAttribute('aria-hidden', 'true');
      setTimeout(() => { try { modal.style.visibility = 'hidden'; } catch (e) {} }, 220);
    } catch (e) {}
  }

  function updateSwitcher(lang) {
    try {
      const switcher = document.getElementById('langSwitcher');
      if (switcher) switcher.value = lang;
    } catch (e) {}
  }

  function bindSwitcher() {
    try {
      const switcher = document.getElementById('langSwitcher');
      if (!switcher) return;
      try { switcher.value = getCurrentLang(); } catch (e) {}
      switcher.addEventListener('change', (e) => setLang(e.target.value));
    } catch (e) {}
  }

  // Public API: t(key)
  function t(key) {
    try {
      const lang = getCurrentLang();
      const dict = SITE_STRINGS[lang] || SITE_STRINGS[DEFAULT_LANG];
      if (dict[key] != null) return dict[key];
      if (SITE_STRINGS[DEFAULT_LANG][key] != null) return SITE_STRINGS[DEFAULT_LANG][key];
      return key;
    } catch (e) { return key; }
  }

  // Initialization
  function init() {
    // Ensure modal exists for first-visit
    try { ensureLangModal(); } catch (e) { console.debug('i18n: ensureLangModal failed', e); }

    // Bind UI
    bindSwitcher();

    // If no stored preference, try to detect browser language then show modal
    const stored = safeGetItem(I18N_KEY);
    if (!stored) {
      // pre-select based on browser, but still show modal so user confirms
      const detected = detectBrowserLang();
      // Set the modal's labels to the detected language if desired
      try {
        const title = document.getElementById('langModalTitle');
        if (title) title.textContent = SITE_STRINGS[detected]['lang.title'] || SITE_STRINGS.en['lang.title'];
      } catch (e) {}

      setTimeout(() => showModal(), 600);
      // do not set lang yet; wait for user action. Pre-fill switcher.
      updateSwitcher(detected);
    } else {
      // Apply stored language immediately
      applyLang(getCurrentLang());
      updateSwitcher(getCurrentLang());
    }

    // Expose API
    try { window.t = t; window.setLang = setLang; window.getCurrentLang = getCurrentLang; } catch (e) {}
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 0);
  }

})();
