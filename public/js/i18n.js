// TEXIM ONE - bilingual i18n (English / Bulgarian)
// Content is swapped via data-i18n attributes. Language is stored in
// localStorage. On first visit a modal prompts the user to choose a language.

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
    'stat.km': 'Million km',
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

    // Some recent news titles (shortened)
    'media.news.69793.title': 'TEXIM ONE THE ORIGINAL™ MONTHLY CONVOY #6',
    'media.news.69793.text': 'On 8 August 2026 we took part in THE ORIGINAL Monthly Convoy #6.',
    'media.news.69383.title': 'TEXIM ONE Nova Group | Public Convoy #3',
    'media.news.69383.text': 'On 25 July 2026 we joined Nova Group | Public Convoy #3.',
    'media.news.68663.title': 'TEXIM ONE MERCH Collaboration',
    'media.news.68663.text': 'Our official merch collaboration with TEXIM ONE Ltd.',
    'media.news.68060.title': 'TEXIM ONE 57. Monthly RSL-Event | May',
    'media.news.68060.text': 'On 27 May 2026 we took part in the 57th Monthly RSL-Event.',
    'media.news.67722.title': 'Weekly Activity - Friday Community Convoy',
    'media.news.67722.text': 'Every Friday we gather for a relaxed public convoy.',
    'media.news.67670.title': 'Reputation System (RS) Update',
    'media.news.67670.text': 'The Reputation System gets a democratic upgrade.',
    'media.news.67599.title': 'Eurovision 2026 - Bangaranga 🇧🇬',
    'media.news.67599.text': 'A tribute to Dara and her historic Eurovision 2026 victory for Bulgaria.',
    'media.news.67582.title': 'TEXIM ONE Pink Ribbon VTC – 4th Anniversary',
    'media.news.67582.text': 'We joined the Pink Ribbon VTC 4th Anniversary convoy with United Convoys.',
    'media.news.67539.title': 'Corporate Identity Update',
    'media.news.67539.text': 'A fresh look for version 1.59: corporate identity updates.',
    'media.news.67529.title': 'TrucksBook Bulgaria - Certificates',
    'media.news.67529.text': 'TrucksBook Bulgaria recognized our community with certificates.',
    'media.news.67416.title': 'Happy May 9th!',
    'media.news.67416.text': 'Marking Europe Day and related reflections.',
    'media.news.65805.title': 'Reputation System (RS)',
    'media.news.65805.text': 'Our official recognition and authority system that ranks every driver.',
    'media.news.65704.title': 'TEXIM ONE Pink Ribbon VTC – March Convoy',
    'media.news.65704.text': 'We took part in the March convoy with United Convoys.',
    'media.news.58783.title': 'Corporate Identity',
    'media.news.58783.text': 'The complete guide to our corporate identity.',

    // Convoy / contact
    'convoy.title': 'Convoy',
    'convoy.sub': 'All upcoming convoys imported from TruckersMP.',
    'convoy.inviteTitle': 'Invite Us to a convoy',
    'convoy.inviteSub': 'Fill out the form and we will send your invite to our Discord channel.',
    'convoy.view': 'View',

    // Add-to-calendar page
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
    'nav.join': 'Присъедини се',
    'nav.invite': 'Покани',

    'hero.subtitle': 'Виртуална транспортна логистика',
    'hero.text': 'TEXIM ONE е виртуална транспортна компания, която участва в конвои в общността TruckersMP. Поканете ни без[...]',
    'hero.btn1': 'Нашите конвои',
    'hero.btn2': 'Медия',
    'hero.invite': 'Покани ни на конвой',
    'hero.discord': 'Discord',
    'hero.join': 'Кандидатствайте',

    'stat.drivers': 'Активни членове',
    'stat.founded': 'Години активност',
    'stat.km': 'Млн км',
    'stat.discord': 'Членове в Discord',

    'features.title': 'Защо?',
    'features.sub': 'Виртуално шофиране, изградено около достъпността и общността.',
    'features.f1.title': 'Без лимити, без натиск',
    'features.f1.text': 'Без месечни километри, без задължително участие в конвои, без изисквания за възраст или часо[[...]
    'features.f2.title': 'Отличителна фирмена идентичност',
    'features.f2.text': 'Разпознаваеми по нашия TMP таг, аватар и характерна композиция влекач + ремарке.',
    'features.f3.title': 'Селективно набиране',
    'features.f3.text': 'Кандидатурите се разглеждат индивидуално чрез нашата форма.',
    'features.f4.title': 'Рангове',
    'features.f4.text': 'Нашата система за репутация ранжира всеки шофьор по принос: Новак, Ентусиаст, Работник, Масте[...]',

    'join.title': 'Присъедини се',
    'join.text': 'Присъедини се към нашата Discord общност и започни своето пътешествие с TEXIM ONE.',
    'join.btn': 'Присъедини се към Discord',
    'apply.btn': 'Кандидатствай',

    'footer.about': 'Виртуална транспортна логистика от 2019 г.',
    'footer.company': 'Компания',
    'footer.support': 'Поддръжка',
    'footer.language': 'Език',

    // Media
    'media.title': 'Медия',
    'media.sub': 'Нашата история, нашите моменти, нашата общност.',
    'media.twitch': 'Twitch отбор',
    'media.twitch.text': 'Разполагаме с официален TruckersMP Twitch отбор, където излъчваме нашите конвои и моменти от общнос[[...]
    'media.twitch.btn': 'Гледай в Twitch',
    'gallery.title': 'Галерия',
    'media.news': 'Новини',
    'media.news.text': 'Последни публикации и актуализации от TEXIM ONE.',
    'media.news.read': 'Прочети',

    'media.news.69793.title': 'TEXIM ONE THE ORIGINAL™ MONTHLY CONVOY #6',
    'media.news.69793.text': 'На 8 август 2026 г. участвахме в THE ORIGINAL Monthly Convoy #6.',
    'media.news.69383.title': 'TEXIM ONE Nova Group | Public Convoy #3',
    'media.news.69383.text': 'На 25 юли 2026 г. се включихме в Nova Group | Public Convoy #3.',
    'media.news.68663.title': 'MERCH от TEXIM ONE Vtc x TEXIM ONE Ltd!',
    'media.news.68663.text': 'Официалната ни merch колаборация с TEXIM ONE Ltd.',
    'media.news.68060.title': 'TEXIM ONE 57. Monthly RSL-Event | May',
    'media.news.68060.text': 'На 27 май 2026 г. участвахме в 57-ото Monthly RSL-Event.',
    'media.news.67722.title': 'Седмична активност - петъчен обществен конвой',
    'media.news.67722.text': 'Всеки петък се събираме за свободен обществен конвой.',
    'media.news.67670.title': 'Обновление на Reputation System (RS)',
    'media.news.67670.text': 'Reputation System получ��ва демократично обновление.',
    'media.news.67599.title': 'Евровизия 2026 - Bangaranga 🇧🇬',
    'media.news.67599.text': 'Обръщение към историческата победа на Дара на Евровизия 2026.',
    'media.news.67582.title': 'TEXIM ONE Pink Ribbon VTC – 4-та годишнина',
    'media.news.67582.text': 'Участвахме в конвоя за 4-тата годишнина на Pink Ribbon VTC.',
    'media.news.67539.title': 'Обновление на фирмената идентичност',
    'media.news.67539.text': 'Нов облик за версия 1.59: обновление на фирмената идентичност.',
    'media.news.67529.title': 'TrucksBook Bulgaria - сертификати',
    'media.news.67529.text': 'TrucksBook Bulgaria отличи общността ни с сертификати.',
    'media.news.67416.title': 'Честит 9 май!',
    'media.news.67416.text': 'Отбелязваме Деня на Европа и свързани събития.',
    'media.news.65805.title': 'Reputation System (RS)',
    'media.news.65805.text': 'Нашата система за признание и авторитет, която ранжира всеки шофьор.',
    'media.news.65704.title': 'TEXIM ONE Pink Ribbon VTC – мартенски конвой',
    'media.news.65704.text': 'Участвахме в мартенския конвой с United Convoys.',
    'media.news.58783.title': 'Фирмена идентичност',
    'media.news.58783.text': 'Пълно ръководство за нашата фирмена идентичност.',

    // Convoy / contact
    'convoy.title': 'Конвои',
    'convoy.sub': 'Всички предстоящи конвои от TruckersMP.',
    'convoy.inviteTitle': 'Покани ни на конвой',
    'convoy.inviteSub': 'Попълнете формата и ще изпратим поканата до нашия Discord.',
    'convoy.view': 'Виж',

    // Add-to-calendar page
    'addconvoy.title': 'Добави конвой в календара',
    'addconvoy.confirm': 'Добави в календара',
    'addconvoy.cancel': 'Отказ',

    'lang.title': 'Изберете вашия език',
    'lang.sub': 'Изберете език',
    'lang.close': 'Затвори'
  }
};

const I18N_KEY = 'texim_lang';

function getCurrentLang() {
  return localStorage.getItem(I18N_KEY) || 'en';
}

function setLang(lang) {
  localStorage.setItem(I18N_KEY, lang === 'bg' ? 'bg' : 'en');
  applyLang(lang === 'bg' ? 'bg' : 'en');
}

function applyLang(lang) {
  const dict = SITE_STRINGS[lang] || SITE_STRINGS.en;

  // Swap all elements with a data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] != null) {
      el.textContent = dict[key];
    }
  });

  // Swap placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key] != null) {
      el.setAttribute('placeholder', dict[key]);
    }
  });

  // Update <html lang>
  document.documentElement.setAttribute('lang', lang);

  document.dispatchEvent(new CustomEvent('texim:langchange', { detail: { lang } }));
}

function showLangModal() {
  const modal = document.getElementById('langModal');
  if (!modal) return;
  modal.classList.add('open');
}

function initI18n() {
  const stored = localStorage.getItem(I18N_KEY);

  // Update the language switcher to reflect current choice
  const switcher = document.getElementById('langSwitcher');
  if (switcher) {
    switcher.value = getCurrentLang();
  }

  applyLang(getCurrentLang());

  // Show the modal on first visit (no stored choice yet)
  if (!stored) {
    setTimeout(showLangModal, 600);
  }
}

function bindLangModal() {
  // Always bind the switcher so language can change on every page,
  // even on pages that don't include the first-visit language modal.
  const switcher = document.getElementById('langSwitcher');
  if (switcher) {
    switcher.addEventListener('change', (e) => setLang(e.target.value));
  }

  const modal = document.getElementById('langModal');
  if (!modal) return;

  document.querySelectorAll('.lang-option[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      setLang(lang);
      modal.classList.remove('open');
      if (switcher) switcher.value = lang;
    });
  });

  const closeBtn = modal.querySelector('.lang-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
  }
  // Click outside to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
}

document.addEventListener('DOMContentLoaded', () => {
    bindLangModal();
    initI18n();
});

// Public helper for other scripts to fetch localized strings by key.
window.t = function t(key) {
    const lang = getCurrentLang();
    const dict = SITE_STRINGS[lang] || SITE_STRINGS.en;
    return dict[key] != null ? dict[key] : key;
};
