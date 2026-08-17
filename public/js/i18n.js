// TEXIM ONE - Bulgarian-only i18n
// Simplified: always apply Bulgarian translations, no language choice or modal.
// Exposes window.t(key) to fetch Bulgarian strings.

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
  };

  function applyBulgarian() {
    try {
      const dict = BG;
      document.querySelectorAll('[data-i18n]').forEach(el => {
        try {
          const key = el.getAttribute('data-i18n');
          if (!key) return;
          if (dict[key] != null) el.textContent = dict[key];
        } catch (e) {
          // ignore per-element errors
        }
      });

      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        try {
          const key = el.getAttribute('data-i18n-placeholder');
          if (!key) return;
          if (BG[key] != null) el.setAttribute('placeholder', BG[key]);
        } catch (e) {}
      });

      try { document.documentElement.setAttribute('lang', 'bg'); } catch (e) {}
    } catch (e) {
      console.error('i18n(bg): apply failed', e);
    }
  }

  // Expose simple helper
  try { window.t = function t(key) { return BG[key] != null ? BG[key] : key; }; } catch (e) {}

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyBulgarian);
  } else {
    setTimeout(applyBulgarian, 0);
  }
})();
