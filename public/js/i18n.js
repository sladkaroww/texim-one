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

    'hero.subtitle': 'Professional Virtual Trucking Logistics',
    'hero.text': 'TEXIM ONE is a virtual trucking company that shows up for convoys across the TruckersMP community. Planning an event? Invite us along; no pressure, no obligations.',
    'hero.btn1': 'Our Convoys',
    'hero.btn2': 'Media',
    'hero.invite': 'Invite us to your convoy',
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
    'features.f4.text': 'Our Reputation System ranks every driver by contribution.',

    'join.title': 'Join',
    'join.text': 'Join our Discord community and start your journey with TEXIM ONE.',
    'join.btn': 'Join Our Discord',
    'apply.btn': 'Apply to Join',

    'footer.about': 'Virtual trucking logistics since 2019.',
    'footer.company': 'Company',
    'footer.support': 'Support',
    'footer.language': 'Language',

    // Convoy / contact
    'convoy.title': 'Convoy',
    'convoy.sub': 'All upcoming convoys imported from TruckersMP.',
    'convoy.inviteTitle': 'Invite Us to Your Convoy',
    'convoy.inviteSub': 'Fill out the form and we will send your invite to our Discord channel.',

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

    'hero.subtitle': 'Професионална виртуална транспортна логистика',
    'hero.text': 'TEXIM ONE е виртуална транспортна компания, която участва в конвои в общността TruckersMP. Поканете ни без напрежение и задължения.',
    'hero.btn1': 'Нашите конвои',
    'hero.btn2': 'Медия',
    'hero.invite': 'Покани ни на твой конвой',
    'hero.discord': 'Discord',
    'hero.join': 'Присъедини се',

    'stat.drivers': 'Активни членове',
    'stat.founded': 'Години активност',
    'stat.km': 'Млн км',
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
    'features.f4.text': 'Нашата система за репутация ранжира всеки шофьор по принос.',

    'join.title': 'Присъедини се',
    'join.text': 'Присъедини се към нашата Discord общност и започни своето пътешествие с TEXIM ONE.',
    'join.btn': 'Присъедини се към Discord',
    'apply.btn': 'Кандидатствай',

    'footer.about': 'Виртуална транспортна логистика от 2019 г.',
    'footer.company': 'Компания',
    'footer.support': 'Поддръжка',
    'footer.language': 'Език',

    'convoy.title': 'Конвои',
    'convoy.sub': 'Всички предстоящи конвои от TruckersMP.',
    'convoy.inviteTitle': 'Покани ни на твой конвой',
    'convoy.inviteSub': 'Попълнете формата и ще изпратим поканата до нашия Discord.',

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
