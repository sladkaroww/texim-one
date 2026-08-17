// TEXIM ONE - Bulgarian-only i18n (improved)
// Applies Bulgarian translations and ensures they persist if other scripts modify the DOM.
// No language choice. Exposes window.t(key) for lookup.

(function () {
  'use strict';

  const BG = {
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
  };

  // Apply translations to the given root (defaults to document)
  function applyToRoot(root = document) {
    try {
      const dict = BG;
      // data-i18n
      root.querySelectorAll && root.querySelectorAll('[data-i18n]').forEach(el => {
        try {
          const key = el.getAttribute('data-i18n');
          if (!key) return;
          if (dict[key] != null) el.textContent = dict[key];
        } catch (e) { /* ignore element errors */ }
      });

      // data-i18n-placeholder
      root.querySelectorAll && root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        try {
          const key = el.getAttribute('data-i18n-placeholder');
          if (!key) return;
          if (dict[key] != null) el.setAttribute('placeholder', dict[key]);
        } catch (e) { /* ignore */ }
      });

      // Update lang attribute
      try { document.documentElement.setAttribute('lang', 'bg'); } catch (e) {}
    } catch (err) {
      console.error('i18n(bg): apply failed', err);
    }
  }

  // Reapply strategy to survive other scripts that modify the DOM:
  // - apply on DOMContentLoaded
  // - apply on load
  // - schedule 2 delayed reapplications
  // - observe mutations for a short period and apply to added nodes
  function ensurePersistentApply() {
    applyToRoot();

    // reapply after likely JS updates
    setTimeout(() => applyToRoot(), 300);
    setTimeout(() => applyToRoot(), 1200);

    // final safety after window load
    if (document.readyState === 'complete') {
      applyToRoot();
    } else {
      window.addEventListener('load', () => applyToRoot());
    }

    // MutationObserver for 2 seconds to catch async DOM changes
    try {
      const observer = new MutationObserver(mutations => {
        mutations.forEach(m => {
          if (m.addedNodes && m.addedNodes.length) {
            m.addedNodes.forEach(node => {
              if (node.nodeType === 1) applyToRoot(node);
            });
          }
        });
      });
      observer.observe(document.documentElement || document, { childList: true, subtree: true });
      // stop observing after 2.5s
      setTimeout(() => { try { observer.disconnect(); } catch (e) {} }, 2500);
    } catch (e) {
      // ignore
    }
  }

  // Public helper
  try { window.t = function t(key) { return BG[key] != null ? BG[key] : key; }; } catch (e) {}

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensurePersistentApply);
  } else {
    setTimeout(ensurePersistentApply, 0);
  }
})();
