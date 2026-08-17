// TEXIM ONE - bilingual i18n (English / Bulgarian)
// Robust implementation: applies translations on DOMContentLoaded, re-applies when DOM changes,
// stores language in localStorage, shows first-visit modal if no preference, exposes API.

(function () {
  'use strict';

  const I18N_KEY = 'texim_lang';
  const DEFAULT_LANG = 'en';

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

      'media.title': 'Media',
      'media.sub': 'Our story, our moments, our community.',
      'media.twitch': 'Twitch Team',
      'media.twitch.text': 'We run an official TruckersMP Twitch Team where we stream our convoys and community moments live.',
      'media.twitch.btn': 'Watch on Twitch',
      'gallery.title': 'Gallery',
      'media.news': 'News',
      'media.news.text': 'Latest publications and updates from TEXIM ONE.',
      'media.news.read': 'Read more',

      'media.news.69793.title': 'TEXIM ONE THE ORIGINAL™ MONTHLY CONVOY #6',
      'media.news.69793.text': 'On 8 August 2026 we took part in THE ORIGINAL Monthly Convoy #6.',

      'convoy.title': 'Convoy',
      'convoy.sub': 'All upcoming convoys imported from TruckersMP.',
      'convoy.inviteTitle': 'Invite Us to a convoy',
      'convoy.inviteSub': 'Fill out the form and we will send your invite to our Discord channel.',
      'convoy.view': 'View',

      'addconvoy.title': 'Add Convoy to Calendar',
      'addconvoy.confirm': 'Add to Calendar',
      'addconvoy.cancel': 'Cancel',

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
      'join.btn': 'Присъедини се към Discord',
      'apply.btn': 'Кандидатствай',

      'footer.about': 'Виртуална транспортна логистика от 2019 г.',
      'footer.company': 'Компания',
      'footer.support': 'Поддръжка',
      'footer.language': 'Език',

      'media.title': 'Медия',
      'media.sub': 'Нашата история, нашите моменти, нашата общност.',
      'media.twitch': 'Twitch отбор',
      'media.twitch.text': 'Разполагаме с официален TruckersMP Twitch отбор, където излъчваме нашите конвои и моменти от общността.',
      'media.twitch.btn': 'Гледай в Twitch',
      'gallery.title': 'Галерия',
      'media.news': 'Новини',
      'media.news.text': 'Последни публикации и актуализации от TEXIM ONE.',
      'media.news.read': 'Прочети',

      'media.news.69793.title': 'TEXIM ONE THE ORIGINAL™ MONTHLY CONVOY #6',
      'media.news.69793.text': 'На 8 август 2026 г. участвахме в THE ORIGINAL Monthly Convoy #6.',

      'convoy.title': 'Конвои',
      'convoy.sub': 'Всички предстоящи конвои от TruckersMP.',
      'convoy.inviteTitle': 'Покани ни на конвой',
      'convoy.inviteSub': 'Попълнете формата и ще изпратим поканата до нашия Discord.',
      'convoy.view': 'Виж',

      'addconvoy.title': 'Добави конвой в календара',
      'addconvoy.confirm': 'Добави в календара',
      'addconvoy.cancel': 'Отказ',

      'lang.title': 'Изберете вашия език',
      'lang.sub': 'Изберете език',
      'lang.close': 'Затвори'
    }
  };

  // Safe localStorage access
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
      return nav.toLowerCase().startsWith('bg') ? 'bg' : 'en';
    } catch (e) { return DEFAULT_LANG; }
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
    updateSwitcher(normalized);
  }

  function applyLang(lang) {
    const dict = SITE_STRINGS[lang] || SITE_STRINGS[DEFAULT_LANG];

    // text nodes
    try {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (!key) return;
        if (dict[key] != null) el.textContent = dict[key];
      });
    } catch (e) { console.debug('i18n: data-i18n update failed', e); }

    // placeholders
    try {
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (!key) return;
        if (dict[key] != null) el.setAttribute('placeholder', dict[key]);
      });
    } catch (e) { console.debug('i18n: placeholder update failed', e); }

    try { document.documentElement.setAttribute('lang', lang); } catch (e) {}
    try { document.dispatchEvent(new CustomEvent('texim:langchange', { detail: { lang } })); } catch (e) {}
  }

  function ensureLangModal() {
    if (document.getElementById('langModal')) return;
    // Minimal modal markup app-injected
    const modal = document.createElement('div');
    modal.id = 'langModal';
    modal.className = 'lang-modal';
    modal.innerHTML = `
      <div class="lang-modal-inner" role="dialog" aria-modal="true" aria-labelledby="langModalTitle">
        <h3 id="langModalTitle">${SITE_STRINGS.en['lang.title']}</h3>
        <p>${SITE_STRINGS.en['lang.sub']}</p>
        <div class="lang-modal-actions">
          <button class="lang-option" data-lang="en">English</button>
          <button class="lang-option" data-lang="bg">Български</button>
        </div>
        <button class="lang-close">${SITE_STRINGS.en['lang.close']}</button>
      </div>`;

    // Basic styles to ensure visibility if CSS missing
    modal.style.position = 'fixed';
    modal.style.inset = '0';
    modal.style.background = 'rgba(0,0,0,0.6)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '9999';
    modal.style.visibility = 'hidden';
    modal.style.opacity = '0';
    modal.style.transition = 'opacity .18s ease';

    document.body.appendChild(modal);

    modal.querySelectorAll('.lang-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        setLang(lang);
        hideModal(modal);
      });
    });

    const closeBtn = modal.querySelector('.lang-close');
    if (closeBtn) closeBtn.addEventListener('click', () => hideModal(modal));
    modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(modal); });
  }

  function showModal() {
    const modal = document.getElementById('langModal');
    if (!modal) return;
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
  }
  function hideModal(modalEl) {
    const modal = modalEl || document.getElementById('langModal');
    if (!modal) return;
    modal.style.opacity = '0';
    setTimeout(() => { try { modal.style.visibility = 'hidden'; } catch (e) {} }, 220);
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
      switcher.addEventListener('change', (e) => setLang(e.target.value));
    } catch (e) {}
  }

  function bindModalButtons() {
    const modal = document.getElementById('langModal');
    if (!modal) return;
    modal.querySelectorAll('.lang-option[data-lang]').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        setLang(lang);
        hideModal(modal);
      });
    });
  }

  function initI18n() {
    ensureLangModal();
    bindSwitcher();

    const stored = safeGetItem(I18N_KEY);
    if (stored) {
      applyLang(stored);
      updateSwitcher(stored);
    } else {
      // try detect browser language and pre-set switcher
      const detected = detectBrowserLang();
      updateSwitcher(detected);
      // show modal to let user choose
      setTimeout(() => showModal(), 600);
    }

    // Reapply if DOM changes (short-lived observer)
    try {
      const observer = new MutationObserver(mutations => {
        applyLang(getCurrentLang());
      });
      observer.observe(document.documentElement || document, { childList: true, subtree: true });
      // stop after 3s
      setTimeout(() => { try { observer.disconnect(); } catch (e) {} }, 3000);
    } catch (e) {}

    // Expose API
    try { window.t = function (key) { const lang = getCurrentLang(); const dict = SITE_STRINGS[lang] || SITE_STRINGS[DEFAULT_LANG]; return dict[key] != null ? dict[key] : key; }; window.getCurrentLang = getCurrentLang; window.setLang = setLang; } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
  } else {
    setTimeout(initI18n, 0);
  }
})();
