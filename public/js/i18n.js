// TEXIM ONE - bilingual i18n (English / Bulgarian)
// Content is swapped via data-i18n attributes. Language is stored in
// localStorage. On first visit a modal prompts the user to choose a language.

const SITE_STRINGS = {
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.convoy': 'Convoy',
    'nav.join': 'Join Us',
    'nav.invite': 'Invite Us to Your Convoy',

    'hero.subtitle': 'Professional Virtual Trucking Logistics',
    'hero.text': 'Винаги 1 на ум, зад TEXIM! Achieve your Roadhog dreams and enjoy the most flexible driving experience — no limits, no obligations, just the open road and a great community.',
    'hero.btn1': 'Invite Us to Your Convoy',
    'hero.btn2': 'Learn More',

    'stat.drivers': 'Active Members',
    'stat.founded': 'Founded',
    'stat.games': 'Supported Games',
    'stat.dlcs': 'Required DLCs',
    'stat.members': 'Members',
    'stat.recruitment': 'Recruitment',

    'features.title': 'Why TEXIM ONE?',
    'features.sub': 'A premium virtual trucking experience built around accessibility and community.',
    'features.f1.title': 'No Limits, No Pressure',
    'features.f1.text': 'No monthly km limits, no required convoy attendance, no age or hours requirements, no test period. Drive on your own terms.',
    'features.f2.title': 'Distinct Corporate Identity',
    'features.f2.text': 'Recognizable through our TMP tag, exclusive avatar, and signature truck + trailer composition that sets us apart on the road.',
    'features.f3.title': 'Selective Recruitment',
    'features.f3.text': 'Applications are reviewed individually via our application form. We value quality and commitment over numbers.',
    'features.f4.title': 'ETS2 & ATS Support',
    'features.f4.text': 'Play Euro Truck Simulator 2 and American Truck Simulator with no required DLCs, no minimum account age, and full speed limiter.',

    'gallery.title': 'On The Road',
    'gallery.sub': 'Convoys and events TEXIM ONE is part of — photos straight from the road.',

    'join.title': 'Join Our Community',
    'join.text': 'Ready to hit the road? Join our Discord community today and start your journey with TEXIM ONE.',
    'join.btn': 'Join Our Discord',
    'apply.btn': 'Apply to Join',

    'footer.about': 'Professional virtual trucking logistics since 2019.',
    'footer.company': 'Company',
    'footer.support': 'Support',
    'footer.rights': 'All rights reserved.',
    'footer.language': 'Language',

    // About page
    'about.title': 'About TEXIM ONE',
    'about.sub': 'Винаги 1 на ум, зад TEXIM! — Always number one in mind, behind TEXIM!',
    'about.who': 'Who We Are',
    'about.who.p1': 'TEXIM ONE (TMP VTC #74050) is a Bulgarian-based virtual trucking company founded in 2019. We are an official TruckersMP-recognized VTC supporting both Euro Truck Simulator 2 and American Truck Simulator with zero required DLCs.',
    'about.who.p2': 'Our philosophy is simple: accessibility. We don\'t require monthly km limits, convoy attendance, a minimum age, hours in-game, or a test period. Whether you\'re a beginner or a veteran, you\'re welcome to drive on your own terms.',
    'about.diff': 'What Makes Us Different',
    'about.diff.p1': 'You\'ll recognize us on the road by our distinct corporate identity — our TEXIM ONE tag, exclusive avatar, and signature truck + trailer composition.',
    'about.diff.p2': 'Our recruitment is selective. Every application is reviewed individually, and we value quality and commitment over sheer numbers. Most of our drivers complete World of Trucks deliveries under the speed limiter and without road assistance, keeping the experience realistic and fair.',
    'about.recruit': 'Recruitment & Community',
    'about.recruit.p1': 'Applications are handled through our official Google Form — each one reviewed personally. Beyond the road, we run a Twitch team and an official merch line through TEXIM ONE Ltd, making us a well-developed and growing community.',
    'about.recruit.p2': 'Find us on TruckersMP, join our Discord, and follow our Linktree for everything TEXIM ONE.',
    'about.facts': 'Company Facts',
    'about.facts.sub': 'Key details about TEXIM ONE from our official TruckersMP profile.',
    'about.view': 'View on TruckersMP',
    'about.team': 'Our Leadership',
    'about.team.sub': 'Meet the people steering TEXIM ONE.',
    'about.members': 'View All Members',

    // Convoy page
    'convoy.title': 'Convoy Schedule',
    'convoy.sub': 'All upcoming convoys automatically imported from TruckersMP.',
    'convoy.subscribe': 'Subscribe to Our Calendar',
    'convoy.subscribe.sub': 'Import all upcoming TEXIM ONE convoys straight into your calendar. The feed updates automatically as new events are added.',
    'convoy.download': 'Download .ics File',
    'convoy.google': 'Add to Google Calendar',
    'convoy.webcal': 'Subscribe (webcal)',
    'convoy.calendar': 'TEXIM ONE Calendar',
    'convoy.calendar.sub': 'Our full event calendar, powered by Sesh. Live and always up to date.',
    'convoy.open': 'Open Calendar in New Tab',
    'convoy.upcoming': 'Upcoming Convoys',
    'convoy.upcoming.sub': 'Live events synced from our TruckersMP profile. Auto-refreshes.',
    'convoy.loading': 'Loading upcoming convoys...',
    'convoy.none': 'No upcoming convoys right now. Check back soon!',
    'convoy.error': 'Unable to load convoys right now. Please try again later.',
    'convoy.view': 'View Event',
    'convoy.meet': 'Meet',

    // Contact page
    'contact.title': 'Invite Us to Your Convoy',
    'contact.sub': 'Fill out the form below and we\'ll send your invite to our Discord channel.',
    'contact.eventLink': 'Convoy Link (TruckersMP)',
    'contact.placeholder.eventLink': 'https://truckersmp.com/events/34097-...',
    'contact.eventName': 'Convoy Name *',
    'contact.placeholder.eventName': 'e.g. NorthStar Group Opening Convoy',
    'contact.eventDate': 'Convoy Date *',
    'contact.eventTime': 'Convoy Start Time (UTC)',
    'contact.placeholder.eventTime': 'e.g. 17:30',
    'contact.discord': 'Discord User *',
    'contact.placeholder.discord': 'username',
    'contact.discordNote': 'Crucial: join our Discord so we can DM you when we accept or decline (email is optional).',
    'contact.email': 'Email Address (optional)',
    'contact.details': 'Additional Details',
    'contact.placeholder.details': 'Any special instructions, cargo preferences, or other notes...',
    'contact.submit': 'Send Invite',
    'contact.note': '* Required fields. We check our calendar and automatically decline if we already have a convoy on that date.',
    'contact.required': 'Please fill in all required fields (Convoy Name, Date, Discord User).',
    'contact.sent': 'Invite Sent!',
    'contact.sentText': 'Your convoy invite has been sent. We will DM you on Discord with our decision.',
    'contact.declinedTitle': 'Auto-Declined — Date Conflict',
    'contact.declinedText': 'We already have a TEXIM ONE convoy on that date, so this invite was automatically declined. We will DM you on Discord to confirm.',
    'contact.again': 'Send Another',

    // Language modal
    'lang.title': 'Choose your language',
    'lang.sub': 'Изберете вашия език',
    'lang.close': 'Close'
  },
  bg: {
    'nav.home': 'Начало',
    'nav.about': 'За нас',
    'nav.convoy': 'Конвой',
    'nav.join': 'Присъедини се',
    'nav.invite': 'Покани ни на твоя конвой',

    'hero.subtitle': 'Професионална виртуална транспортна логистика',
    'hero.text': 'Винаги 1 на ум, зад TEXIM! Постигни мечтите си за шофьор и се наслади на най-гъвкавото шофиране — без лимити, без задължения, само открит път и страхотна общност.',
    'hero.btn1': 'Покани ни на твоя Конвой',
    'hero.btn2': 'Научи повече',

    'stat.drivers': 'Активни членове',
    'stat.founded': 'Основана',
    'stat.games': 'Поддържани игри',
    'stat.dlcs': 'Изисквани DLC',
    'stat.members': 'Членове',
    'stat.recruitment': 'Набиране',

    'features.title': 'Защо TEXIM ONE?',
    'features.sub': 'Премиум виртуално шофиране, изградено около достъпността и общността.',
    'features.f1.title': 'Без лимити, без натиск',
    'features.f1.text': 'Без месечни километри, задължително участие в конвои, възраст или работни часове, без тестов период. Карай по свои правила.',
    'features.f2.title': 'Отличителна фирмена идентичност',
    'features.f2.text': 'Разпознаваеми по нашия TMP таг, ексклузивен аватар и характерна композиция влекач + ремарке.',
    'features.f3.title': 'Селективно набиране',
    'features.f3.text': 'Кандидатурите се разглеждат индивидуално чрез нашата форма. Ценим качеството и ангажираността пред количеството.',
    'features.f4.title': 'ETS2 и ATS поддръжка',
    'features.f4.text': 'Играй Euro Truck Simulator 2 и American Truck Simulator без изисквани DLC, без минимална възраст и с ограничител на скоростта.',

    'gallery.title': 'На пътя',
    'gallery.sub': 'Конвои и събития, в които TEXIM ONE участва — снимки направо от пътя.',

    'join.title': 'Присъедини се към нашата общност',
    'join.text': 'Готов ли си да тръгнеш? Присъедини се към нашата Discord общност и започни своето пътешествие с TEXIM ONE.',
    'join.btn': 'Присъедини се към Discord',
    'apply.btn': 'Кандидатствай',

    'footer.about': 'Професионална виртуална транспортна логистика от 2019 г.',
    'footer.company': 'Компания',
    'footer.support': 'Поддръжка',
    'footer.rights': 'Всички права запазени.',
    'footer.language': 'Език',

    // About page
    'about.title': 'За TEXIM ONE',
    'about.sub': 'Винаги 1 на ум, зад TEXIM!',
    'about.who': 'Кои сме ние',
    'about.who.p1': 'TEXIM ONE (TMP VTC #74050) е българска виртуална транспортна компания, основана през 2019 г. Официален TruckersMP VTC, поддържащ Euro Truck Simulator 2 и American Truck Simulator без изисквани DLC.',
    'about.who.p2': 'Нашата философия е проста: достъпност. Не изискваме месечни километри, участие в конвои, минимална възраст, часове в игра или тестов период. Независимо дали си начинаещ или ветеран, си добре дошъл да караш по свои правила.',
    'about.diff': 'Какво ни отличава',
    'about.diff.p1': 'Ще ни разпознаеш на пътя по нашата отличителна фирмена идентичност — TEXIM ONE таг, ексклузивен аватар и характерна композиция влекач + ремарке.',
    'about.diff.p2': 'Набирането ни е селективно. Всяка кандидатура се разглежда индивидуално, като ценим качеството и ангажираността пред количеството. Повечето ни шофьори изпълняват World of Trucks доставки с ограничител на скоростта и без пътна помощ.',
    'about.recruit': 'Набиране и общност',
    'about.recruit.p1': 'Кандидатстването се извършва чрез официалната ни Google форма — всяка заявка се разглежда лично. Освен на пътя, имаме Twitch екип и официална линия продукти чрез TEXIM ONE Ltd, което ни прави добре развита и растяща общност.',
    'about.recruit.p2': 'Намери ни в TruckersMP, присъедини се към наш Discord и следвай Linktree за всичко за TEXIM ONE.',
    'about.facts': 'Факти за компанията',
    'about.facts.sub': 'Основни данни за TEXIM ONE от официалния ни профил в TruckersMP.',
    'about.view': 'Виж в TruckersMP',
    'about.team': 'Нашето ръководство',
    'about.team.sub': 'Запознай се с хората, които водят TEXIM ONE.',
    'about.members': 'Виж всички членове',

    // Convoy page
    'convoy.title': 'График на конвоите',
    'convoy.sub': 'Всички предстоящи конвои автоматично импортирани от TruckersMP.',
    'convoy.subscribe': 'Абонирай се за нашия календар',
    'convoy.subscribe.sub': 'Импортирай всички предстоящи конвои на TEXIM ONE директно в календара си. Емисията се обновява автоматично при добавяне на нови събития.',
    'convoy.download': 'Изтегли .ics файл',
    'convoy.google': 'Добави в Google Календар',
    'convoy.webcal': 'Абонирай се (webcal)',
    'convoy.calendar': 'Календар на TEXIM ONE',
    'convoy.calendar.sub': 'Нашият пълен календар за събития, задвижван от Sesh. Винаги актуален.',
    'convoy.open': 'Отвори календара в нов раздел',
    'convoy.upcoming': 'Предстоящи конвои',
    'convoy.upcoming.sub': 'Актуални събития от нашия TruckersMP профил. Обновяват се автоматично.',
    'convoy.loading': 'Зареждане на предстоящите конвои...',
    'convoy.none': 'В момента няма предстоящи конвои. Провери отново скоро!',
    'convoy.error': 'В момента не могат да се заредят конвоите. Моля, опитай отново по-късно.',
    'convoy.view': 'Виж събитието',
    'convoy.meet': 'Сборен пункт',

    // Contact page
    'contact.title': 'Покани ни на твоя конвой',
    'contact.sub': 'Попълни формата по-долу и ще изпратим поканата ти до нашия Discord канал.',
    'contact.eventLink': 'Линк към конвой (TruckersMP)',
    'contact.placeholder.eventLink': 'https://truckersmp.com/events/34097-...',
    'contact.eventName': 'Име на конвоя *',
    'contact.placeholder.eventName': 'напр. NorthStar Group Opening Convoy',
    'contact.eventDate': 'Дата на конвоя *',
    'contact.eventTime': 'Начален час на конвоя (UTC)',
    'contact.placeholder.eventTime': 'напр. 17:30',
    'contact.discord': 'Discord потребител *',
    'contact.placeholder.discord': 'потребител',
    'contact.discordNote': 'Важно: присъедини се към нашия Discord, за да ти пишем лично съобщение при приемане или отказ (имейлът е по избор).',
    'contact.email': 'Имейл адрес (по избор)',
    'contact.details': 'Допълнителни подробности',
    'contact.placeholder.details': 'Специални инструкции, предпочитания за товар или други бележки...',
    'contact.submit': 'Изпрати покана',
    'contact.note': '* Задължителни полета. Проверяваме календара си и автоматично отказваме, ако вече имаме конвой на тази дата.',
    'contact.required': 'Моля, попълни всички задължителни полета (Име на конвоя, Дата, Discord потребител).',
    'contact.sent': 'Поканата е изпратена!',
    'contact.sentText': 'Поканата ти за конвой е изпратена. Ще ти пишем в Discord с нашето решение.',
    'contact.declinedTitle': 'Автоматично отказана — конфликт в датата',
    'contact.declinedText': 'Вече имаме конвой на TEXIM ONE на тази дата, затова поканата е автоматично отказана. Ще ти пишем в Discord за потвърждение.',
    'contact.again': 'Изпрати друга',

    // Language modal
    'lang.title': 'Изберете вашия език',
    'lang.sub': 'Choose your language',
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
  const modal = document.getElementById('langModal');
  if (!modal) return;

  document.querySelectorAll('.lang-option[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      setLang(lang);
      modal.classList.remove('open');
      const switcher = document.getElementById('langSwitcher');
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

  const switcher = document.getElementById('langSwitcher');
  if (switcher) {
    switcher.addEventListener('change', (e) => setLang(e.target.value));
  }
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
