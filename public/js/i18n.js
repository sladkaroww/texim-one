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

      // Language Modal
      "modal.title": "Choose Language",
      "modal.sub": "Select your preferred language",
      // Footer
      'footer.about': 'Virtual trucking logistics since 2019.',
      'footer.company': 'Company',
      'footer.credit': 'Made with â¤ï¸ by sladkaroww'
    },
    bg: {
      // Navigation
      "nav.home": "Начало",
      "nav.convoy": "Събития",
      "nav.media": "Медиа",
      "nav.join": "Заяви се",
      "nav.partnerships": "Партньорства",

      // Home - Hero section
      "hero.tagline": "Винаги 1 на ум, зад TEXIM!",
      "hero.subtitle": "Виртуална транспортна компания",
      "hero.text": "TEXIM ONE е основана на 1 януари 2026 г. като естествено продължение на TEXIM, основан на 10 март 2019 г.",
      "hero.discord": "Discord",

      // Home - Stats
      "stat.drivers": "10+ служители",
      "stat.founded": "7+ години опит",
      "stat.km": "9+ млн WoTr км",
      "stat.discord": "80+ Discord членове",

      // Home - Section titles
      "home.staff": "Хората зад волана",
      "home.staffDesc": "Интеграция с членове от TruckersMP",
      "home.panels": "Нашите стойности",

      // Home - Panel titles
      "panel.accessibility": "Достъпност",
      "panel.accessibilityDesc": "Нямаме месечни километражни лимити, задължително участие в конвои, изисквания за възраст, часове в играта, DLC-и или опитителен период.",
      "panel.identity": "Корпоративна идентичност",
      "panel.identityDesc": "Разпознаваем брандинг: типичен камион, связан, аватар и етикет.",
      "panel.hierarchy": "Иерархия",
      "panel.hierarchyDesc": "Нашата репутационна система récompense активните членове с по-голямо влияние в процеса на приемане на решения.",
      "panel.prestige": "Престиж",
      "panel.prestigeDesc": "Собствен Twitch екип и марч - excluзивни за най-големите общности.",

      // Events page
      "events.title": "Събития",
      "events.allEvents": "Всички събития, на които сме поканени",
      "events.invite": "Покани нас",
      "events.inviteText": "Попълнете формуляра и ще споделим поканата с нашите Discord членове.",
      "events.calendar": "Календар",
      "events.calendarText": "Всички предстоящи събития",

      // Convoy page specific translations
      "convoy.none": "Няма предстоящи събития",
      "convoy.error": "Грешка при зареждане на събития",
      "convoy.meet": "Срещане",
      "convoy.view": "Преглед на събитие",

      // Media page
      "media.title": "Медиа",
      "media.sub": "Нашата история, нашите моменти, нашата общност",
      "media.twitch": "Twitch екип",
      "media.twitchText": "Следете нашия Twitch екип, който стриймира жив за общността!",
      "media.watch": "Гледни",
      "media.gallery": "Галерия",
      "media.galleryText": "Топ 9 кадри с колегите (снимки с поне 4 от екипа)",
      "media.news": "Новини",
      "media.newsText": "TEXIM ONE в TruckersMP",

      // Apply page
      "apply.title": "Заявка за присъединяване към TEXIM ONE",
      "apply.form": "Формулара за candidatura",

      // Partnerships page
      "partnerships.title": "Партньорства",
      "partnerships.texim": "TEXIM ONE Vtc & TEXIM ONE Ltd",
      "partnerships.merchDesc": "Иконичното лого T1 е представено като белка с размер 5-6 см, поставена на класическото положение наляво на гърдите.",
      "partnerships.colorDesc": "За персонализиране предлагаме 420 нитки за идеална комбинация с дрехите, вариращи от 5 до 11 цветове в зависимост от моделa.",
      "partnerships.materialDesc": "Избрали сме американски бренд с тежка tkanina и oversized кројка. Колекцията включва тисии, диваки и худи в размери XS до 2XL.",
      "partnerships.button": "Марч магазин",
      "partnerships.contact": "Ако желаете да стане партньор ни за创作 на custom merch, присъединяване към нашия Twitch екип или другие съвместни инициативи, можете да се свържете с нас чрез нашия Discord сървър.",

      // Footer
      "footer.about": "Виртуална транспортна логистика от 2019 г.",
      "footer.company": "Компания",
      "footer.credit": "Направено със ❤️ от sladkaroww",

      // Language Modal
      "modal.title": "Избери език",
      "modal.sub": "Избери предпочитания си език"
    },* Robust i18n for TEXIM ONE
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
      'footer.credit': 'Made with â¤ï¸ by sladkaroww'
    },
    bg: {
      // Navigation
      'nav.home': 'ÐÐ°Ñ‡Ð°Ð»Ð¾',
      'nav.convoy': 'Ð¡Ð¾Ð±Ñ‹Ñ‚Ð¸Ñ',
      'nav.media': 'ÐœÐµÐ´Ð¸Ñ',
      'nav.join': 'ÐšÐ°Ð½Ð´Ð¸Ð´Ð°Ñ‚ÑÑ‚Ð²Ð°Ð¹',
      'nav.partnerships': 'ÐŸÐ°Ñ€Ñ‚Ð½ÑŒÐ¾Ñ€ÑÑ‚Ð²Ð°',

      // Home - Hero section
      'hero.tagline': 'Ð’Ð¸Ð½Ð°Ð³Ð¸ 1 Ð½Ð° ÑƒÐ¼, Ð·Ð°Ð´ TEXIM!',
      'hero.subtitle': 'Ð’Ð¸Ñ€Ñ‚ÑƒÐ°Ð»Ð½Ð° Ñ‚Ñ€Ð°Ð½ÑÐ¿Ð¾Ñ€Ñ‚Ð½Ð° ÐºÐ¾Ð¼Ð¿Ð°Ð½Ð¸Ñ',
      'hero.text': 'TEXIM ONE ÑÑ‚Ð°Ñ€Ñ‚Ð¸Ñ€Ð° Ð½Ð° 1 ÑÐ½ÑƒÐ°Ñ€Ð¸ 2026 Ð³. ÐºÐ°Ñ‚Ð¾ ÐµÑÑ‚ÐµÑÑ‚Ð²ÐµÐ½Ð¾ Ð¿Ñ€Ð¾Ð´ÑŠÐ»Ð¶ÐµÐ½Ð¸Ðµ Ð½Ð° TEXIM, Ð¾ÑÐ½Ð¾Ð²Ð°Ð½Ð° Ð½Ð° 10 Ð¼Ð°Ñ€Ñ‚ 2019 Ð³.',
      'hero.discord': 'Discord',

      // Home - Stats
      'stat.drivers': '10+ Ð¡Ð»ÑƒÐ¶Ð¸Ñ‚ÐµÐ»Ð¸',
      'stat.founded': '7+ Ð“Ð¾Ð´Ð¸Ð½Ð¸ Ð¾Ð¿Ð¸Ñ‚',
      'stat.km': '9+ ÐœÐ»Ð½ WoTr ÐºÐ¼',
      'stat.discord': '80+ Discord Ñ‡Ð»ÐµÐ½Ð¾Ð²Ðµ',

      // Home - Section titles
      'home.staff': 'Ð¥Ð¾Ñ€Ð°Ñ‚Ð° Ð·Ð°Ð´ Ð²Ð¾Ð»Ð°Ð½Ð°',
      'home.staffDesc': 'Ð˜Ð½Ñ‚ÐµÐ³Ñ€Ð°Ñ†Ð¸Ñ ÑÑŠÑ ÑÐ»ÑƒÐ¶Ð¸Ñ‚ÐµÐ»Ð¸Ñ‚Ðµ Ð¾Ñ‚ TruckersMP',
      'home.panels': 'ÐÐ°ÑˆÐ¸Ñ‚Ðµ Ñ†ÐµÐ½Ð½Ð¾ÑÑ‚Ð¸',

      // Home - Panel titles
      'panel.accessibility': 'Ð”Ð¾ÑÑ‚ÑŠÐ¿Ð½Ð¾ÑÑ‚',
      'panel.accessibilityDesc': 'ÐÐµ Ð¸Ð·Ð¸ÑÐºÐ²Ð°Ð¼Ðµ Ð¼ÐµÑÐµÑ‡ÐµÐ½ Ð»Ð¸Ð¼Ð¸Ñ‚ Ð¾Ñ‚ ÐºÐ¸Ð»Ð¾Ð¼ÐµÑ‚Ñ€Ð¸, Ð·Ð°Ð´ÑŠÐ»Ð¶Ð¸Ñ‚ÐµÐ»Ð½Ð¾ ÑƒÑ‡Ð°ÑÑ‚Ð¸Ðµ Ð² ÐºÐ¾Ð½Ð²Ð¾Ð¸, Ð¾Ð¿Ñ€ÐµÐ´ÐµÐ»ÐµÐ½Ð° Ð²ÑŠÐ·Ñ€Ð°ÑÑ‚, Ñ‡Ð°ÑÐ¾Ð²Ðµ Ð² Ð¸Ð³Ñ€Ð°Ñ‚Ð°, DLC-Ñ‚Ð° Ð¸Ð»Ð¸ Ñ‚ÐµÑÑ‚Ð¾Ð² Ð¿ÐµÑ€Ð¸Ð¾Ð´.',
      'panel.identity': 'Ð˜Ð´ÐµÐ½Ñ‚Ð¸Ñ‡Ð½Ð¾ÑÑ‚',
      'panel.identityDesc': 'Ð Ð°Ð·Ð¿Ð¾Ð·Ð½Ð°Ð²Ð°ÐµÐ¼ Ñ„Ð¸Ñ€Ð¼ÐµÐ½ Ð±Ñ€Ð°Ð½Ð´Ð¸Ð½Ð³: Ð²Ð»ÐµÐºÐ°Ñ‡, Ñ€ÐµÐ¼Ð°Ñ€ÐºÐµ, Ð°Ð²Ñ‚Ð¾Ð±ÑƒÑ, Ð°Ð²Ð°Ñ‚Ð°Ñ€ Ð¸ Ñ‚Ð°Ð³.',
      'panel.hierarchy': 'Ð™ÐµÑ€Ð°Ñ€Ñ…Ð¸Ñ',
      'panel.hierarchyDesc': 'ÐÐ°ÑˆÐ°Ñ‚Ð° ÑÐ¸ÑÑ‚ÐµÐ¼Ð° Ð·Ð° Ñ€ÐµÐ¿ÑƒÑ‚Ð°Ñ†Ð¸Ñ Ð²ÑŠÐ·Ð½Ð°Ð³Ñ€Ð°Ð¶Ð´Ð°Ð²Ð° Ð¿Ð¾-Ð°ÐºÑ‚Ð¸Ð²Ð½Ð¸Ñ‚Ðµ Ð²ÑŠÐ² Ñ„Ð¸Ñ€Ð¼Ð°Ñ‚Ð° Ñ Ð¿Ð¾Ð²ÐµÑ‡Ðµ Ñ‚ÐµÐ¶ÐµÑÑ‚ Ð¿Ñ€Ð¸ Ð²Ð·ÐµÐ¼Ð°Ð½ÐµÑ‚Ð¾ Ð½Ð° Ñ€ÐµÑˆÐµÐ½Ð¸Ñ.',
      'panel.prestige': 'ÐŸÑ€ÐµÑÑ‚Ð¸Ð¶',
      'panel.prestigeDesc': 'Ð¡Ð¾Ð±ÑÑ‚Ð²ÐµÐ½ Twitch Team Ð¸ Merch - ÑÐ°Ð¼Ð¾ Ð·Ð° Ð¼Ð°Ð»ÐºÐ° Ñ‡Ð°ÑÑ‚ Ð¾Ñ‚ Ð½Ð°Ð¹-Ð³Ð¾Ð»ÐµÐ¼Ð¸Ñ‚Ðµ Ð¾Ð±Ñ‰Ð½Ð¾ÑÑ‚Ð¸.',

      // Events page
      'events.title': 'Ð¡Ð¾Ð±Ñ‹Ñ‚Ð¸Ñ',
      'events.allEvents': 'Ð’ÑÐ¸Ñ‡ÐºÐ¸ ÑÑŠÐ±Ð¸Ñ‚Ð¸Ñ, Ð½Ð° ÐºÐ¾Ð¸Ñ‚Ð¾ ÑÐ¼Ðµ Ð¿Ð¾ÐºÐ°Ð½ÐµÐ½Ð¸.',
      'events.invite': 'ÐŸÐ¾ÐºÐ°Ð½Ð¸ Ð½Ð¸',
      'events.inviteText': 'ÐŸÐ¾Ð¿ÑŠÐ»Ð½ÐµÑ‚Ðµ Ñ„Ð¾Ñ€Ð¼ÑƒÐ»ÑÑ€Ð° Ð¸ Ñ‰Ðµ ÑÐ¿Ð¾Ð´ÐµÐ»Ð¸Ð¼ Ð¿Ð¾ÐºÐ°Ð½Ð°Ñ‚Ð° Ñ Ñ‡Ð»ÐµÐ½Ð¾Ð²ÐµÑ‚Ðµ Ð² Ð½Ð°ÑˆÐ¸Ñ Discord ÑÑŠÑ€Ð²ÑŠÑ€.',
      'events.calendar': 'ÐšÐ°Ð»ÐµÐ½Ð´Ð°Ñ€',
      'events.calendarText': 'Ð’ÑÐ¸Ñ‡ÐºÐ¸ Ð¿Ñ€ÐµÐ´ÑÑ‚Ð¾ÑÑ‰Ð¸ ÑÑŠÐ±Ð¸Ñ‚Ð¸Ñ.',
      // Convoy page specific translations
      'convoy.none': 'ÐÑÐ¼Ð° Ð¿Ñ€ÐµÐ´ÑÑ‚Ð¾ÑÑ‰Ð¸ ÑÑŠÐ±Ð¸Ñ‚Ð¸Ñ',
      'convoy.error': 'ÐÐµÑƒÑÐ¿ÐµÑˆÐ½Ð¾ Ð·Ð°Ñ€ÐµÐ¶Ð´Ð°Ð½Ðµ Ð½Ð° ÑÑŠÐ±Ð¸Ñ‚Ð¸Ñ',
      'convoy.meet': 'Ð¡Ñ€ÐµÑ‰Ð°',
      'convoy.view': 'ÐŸÑ€ÐµÐ³Ð»ÐµÐ´ Ð½Ð° ÑÑŠÐ±Ð¸Ñ‚Ð¸Ðµ'

      // Media page
      'media.title': 'ÐœÐµÐ´Ð¸Ñ',
      'media.sub': 'ÐÐ°ÑˆÐ°Ñ‚Ð° Ð¸ÑÑ‚Ð¾Ñ€Ð¸Ñ, Ð½Ð°ÑˆÐ¸Ñ‚Ðµ Ð¼Ð¾Ð¼ÐµÐ½Ñ‚Ð¸, Ð½Ð°ÑˆÐ°Ñ‚Ð° Ð¾Ð±Ñ‰Ð½Ð¾ÑÑ‚.',
      'media.twitch': 'Twitch Ð¾Ñ‚Ð±Ð¾Ñ€',
      'media.twitchText': 'Ð¡Ð»ÐµÐ´ÐµÑ‚Ðµ Ð½Ð°ÑˆÐ¸Ñ Twitch Ð¾Ñ‚Ð±Ð¾Ñ€, Ñ ÐºÐ¾Ð¹Ñ‚Ð¾ ÑÑ‚Ñ€Ð¸Ð¹Ð¼Ð²Ð°Ð¼Ðµ Ð½Ð° Ð¶Ð¸Ð²Ð¾ Ð·Ð° Ð¾Ð±Ñ‰Ð½Ð¾ÑÑ‚Ñ‚Ð°!',
      'media.watch': 'Ð“Ð»ÐµÐ´Ð°Ð¹',
      'media.gallery': 'Ð“Ð°Ð»ÐµÑ€Ð¸Ñ',
      'media.galleryText': 'Ð¢Ð¾Ð¿ 9 ÐºÐ°Ð´Ñ€Ð¸ Ñ ÐºÐ¾Ð»ÐµÐ³Ð¸Ñ‚Ðµ. (ÑÐ½Ð¸Ð¼ÐºÐ¸ Ñ Ð¿Ð¾Ð½Ðµ 4-Ð¼Ð° Ð¾Ñ‚ Ñ„Ð¸Ñ€Ð¼Ð°Ñ‚Ð°)',
      'media.news': 'ÐÐ¾Ð²Ð¸Ð½Ð¸',
      'media.newsText': 'TEXIM ONE Ð² TruckersMP.',

      // Apply page
      'apply.title': 'ÐšÐ°Ð½Ð´Ð¸Ð´Ð°Ñ‚ÑÑ‚Ð²Ð°Ð¹ Ð·Ð° TEXIM ONE',
      'apply.form': 'Ð¤Ð¾Ñ€Ð¼ÑƒÐ»ÑÑ€ Ð·Ð° ÐºÐ°Ð½Ð´Ð¸Ð´Ð°Ñ‚ÑÑ‚Ð²Ð°Ð½Ðµ',

      // Partnerships page
      'partnerships.title': 'ÐŸÐ°Ñ€Ñ‚Ð½ÑŒÐ¾Ñ€ÑÑ‚Ð²Ð°',
      'partnerships.texim': 'TEXIM ONE Vtc & TEXIM ONE Ltd',
      'partnerships.merchDesc': 'ÐŸÐ¾Ð·Ð½Ð°Ñ‚Ð¾Ñ‚Ð¾ Ð»Ð¾Ð³Ð¾ T1 Ðµ Ð¿Ñ€ÐµÐ´ÑÑ‚Ð°Ð²ÐµÐ½Ð¾ Ð¿Ð¾Ð´ Ñ„Ð¾Ñ€Ð¼Ð°Ñ‚Ð° Ð½Ð° Ð±Ñ€Ð¾Ð´ÐµÑ€Ð¸Ñ Ñ Ñ€Ð°Ð·Ð¼ÐµÑ€ 5â€“6 ÑÐ¼, Ñ€Ð°Ð·Ð¿Ð¾Ð»Ð¾Ð¶ÐµÐ½Ð¾ Ð½Ð° ÐºÐ»Ð°ÑÐ¸Ñ‡ÐµÑÐºÐ¾Ñ‚Ð¾ Ð¼ÑÑÑ‚Ð¾ Ð¾Ñ‚Ð¿Ñ€ÐµÐ´ Ð¾Ñ‚Ð»ÑÐ²Ð¾ Ð½Ð° Ð³ÑŠÑ€Ð´Ð¸Ñ‚Ðµ.',
      'partnerships.colorDesc': 'Ð—Ð° Ð¸Ð½Ð´Ð¸Ð²Ð¸Ð´ÑƒÐ°Ð»Ð½Ð° Ð¿ÐµÑ€ÑÐ¾Ð½Ð°Ð»Ð¸Ð·Ð°Ñ†Ð¸Ñ Ð¿Ñ€ÐµÐ´Ð»Ð°Ð³Ð°Ð¼Ðµ 420 Ñ†Ð²ÑÑ‚Ð° ÐºÐ¾Ð½Ñ†Ð¸ Ñ Ñ†ÐµÐ» Ð¿ÐµÑ€Ñ„ÐµÐºÑ‚Ð½Ð° ÐºÐ¾Ð¼Ð±Ð¸Ð½Ð°Ñ†Ð¸Ñ Ñ Ð´Ñ€ÐµÑ…Ð¸Ñ‚Ðµ, ÐºÐ¾Ð¸Ñ‚Ð¾ Ð²Ð°Ñ€Ð¸Ñ€Ð°Ñ‚ Ð¾Ñ‚ 5 Ð´Ð¾ 11 Ñ†Ð²ÑÑ‚Ð° Ð² Ð·Ð°Ð²Ð¸ÑÐ¸Ð¼Ð¾ÑÑ‚ Ð¾Ñ‚ Ð¼Ð¾Ð´ÐµÐ»Ð°.',
      'partnerships.materialDesc': 'Ð—Ð°Ð»Ð¾Ð¶Ð¸Ñ…Ð¼Ðµ Ð½Ð° Ð°Ð¼ÐµÑ€Ð¸ÐºÐ°Ð½ÑÐºÐ¸ Ð±Ñ€Ð°Ð½Ð´ Ñ Heavyweight Ð¼Ð°Ñ‚ÐµÑ€Ð¸Ñ Ð¸ Oversized ÐºÑ€Ð¾Ð¹ÐºÐ°. ÐšÐ¾Ð»ÐµÐºÑ†Ð¸ÑÑ‚Ð° Ð²ÐºÐ»ÑŽÑ‡Ð²Ð° Ñ‚ÐµÐ½Ð¸ÑÐºÐ¸, ÑÑƒÐ¸Ñ‚ÑˆÑŠÑ€Ñ‚Ð¸ Ð¸ Ñ…ÑƒÐ´Ð¸Ñ‚Ð°, Ð² Ñ€Ð°Ð·Ð¼ÐµÑ€Ð¸ Ð¾Ñ‚ XS Ð´Ð¾ 2XL.',
      'partnerships.button': 'ÐœÐ°Ð³Ð°Ð·Ð¸Ð½ Merch',
      'partnerships.contact': 'ÐÐºÐ¾ Ð¸ÑÐºÐ°Ñ‚Ðµ Ð´Ð° ÑÐ¸ Ð¿Ð°Ñ€Ñ‚Ð½Ð¸Ñ€Ð°Ð¼Ðµ Ð·Ð° ÑÑŠÐ·Ð´Ð°Ð²Ð°Ð½Ðµ Ð½Ð° ÑÐ¾Ð±ÑÑ‚Ð²ÐµÐ½ Merch, Ð¿Ñ€Ð¸ÑÑŠÐµÐ´Ð¸Ð½ÑÐ²Ð°Ð½Ðµ ÐºÑŠÐ¼ Ð½Ð°ÑˆÐ¸Ñ Twitch Team Ð¸Ð»Ð¸ Ð´Ñ€ÑƒÐ³Ð¸ ÑÑŠÐ²Ð¼ÐµÑÑ‚Ð½Ð¸ Ð¸Ð½Ð¸Ñ†Ð¸Ð°Ñ‚Ð¸Ð²Ð¸, Ð¼Ð¾Ð¶ÐµÑ‚Ðµ Ð´Ð° ÑÐµ ÑÐ²ÑŠÑ€Ð¶ÐµÑ‚Ðµ Ñ Ð½Ð°Ñ Ð² Ð½Ð°ÑˆÐ¸Ñ Discord ÑÑŠÑ€Ð²ÑŠÑ€.',

      // Footer
      'footer.about': 'Ð’Ð¸Ñ€Ñ‚ÑƒÐ°Ð»Ð½Ð° Ñ‚Ñ€Ð°Ð½ÑÐ¿Ð¾Ñ€Ñ‚Ð½Ð° Ð»Ð¾Ð³Ð¸ÑÑ‚Ð¸ÐºÐ° Ð¾Ñ‚ 2019 Ð³.',
      'footer.company': 'ÐšÐ¾Ð¼Ð¿Ð°Ð½Ð¸Ñ',
      'footer.credit': 'ÐÐ°Ð¿Ñ€Ð°Ð²ÐµÐ½Ð¾ Ñ â¤ï¸ Ð¾Ñ‚ sladkaroww'
    }
  
     
    bg: {
      // Navigation
      "nav.home": "Начало",
      "nav.convoy": "Събития",
      "nav.media": "Медиа",
      "nav.join": "Заяви се",
      "nav.partnerships": "Партньорства",

      // Home - Hero section
      "hero.tagline": "Винаги 1 на ум, зад TEXIM!",
      "hero.subtitle": "Виртуална транспортна компания",
      "hero.text": "TEXIM ONE е основана на 1 януари 2026 г. като естествено продължение на TEXIM, основан на 10 март 2019 г.",
      "hero.discord": "Discord",

      // Home - Stats
      "stat.drivers": "10+ служители",
      "stat.founded": "7+ години опит",
      "stat.km": "9+ млн WoTr км",
      "stat.discord": "80+ Discord членове",

      // Home - Section titles
      "home.staff": "Хората зад волана",
      "home.staffDesc": "Интеграция с членове от TruckersMP",
      "home.panels": "Нашите стойности",

      // Home - Panel titles
      "panel.accessibility": "Достъпност",
      "panel.accessibilityDesc": "Нямаме месечни километражни лимити, задължително участие в конвои, изисквания за възраст, часове в играта, DLC-и или опитителен период.",
      "panel.identity": "Корпоративна идентичност",
      "panel.identityDesc": "Разпознаваем брандинг: типичен камион, связан, аватар и етикет.",
      "panel.hierarchy": "Иерархия",
      "panel.hierarchyDesc": "Нашата репутационна система récompense активните членове с по-голямо влияние в процеса на приемане на решения.",
      "panel.prestige": "Престиж",
      "panel.prestigeDesc": "Собствен Twitch екип и марч - excluзивни за най-големите общности.",

      // Events page
      "events.title": "Събития",
      "events.allEvents": "Всички събития, на които сме поканени",
      "events.invite": "Покани нас",
      "events.inviteText": "Попълнете формуляра и ще споделим поканата с нашите Discord членове.",
      "events.calendar": "Календар",
      "events.calendarText": "Всички предстоящи събития",

      // Convoy page specific translations
      "convoy.none": "Няма предстоящи събития",
      "convoy.error": "Грешка при зареждане на събития",
      "convoy.meet": "Срещане",
      "convoy.view": "Преглед на събитие",

      // Media page
      "media.title": "Медиа",
      "media.sub": "Нашата история, нашите моменти, нашата общност",
      "media.twitch": "Twitch екип",
      "media.twitchText": "Следете нашия Twitch екип, който стриймира жив за общността!",
      "media.watch": "Гледни",
      "media.gallery": "Галерия",
      "media.galleryText": "Топ 9 кадри с колегите (снимки с поне 4 от екипа)",
      "media.news": "Новини",
      "media.newsText": "TEXIM ONE в TruckersMP",

      // Apply page
      "apply.title": "Заявка за присъединяване към TEXIM ONE",
      "apply.form": "Формулара за candidatura",

      // Partnerships page
      "partnerships.title": "Партньорства",
      "partnerships.texim": "TEXIM ONE Vtc & TEXIM ONE Ltd",
      "partnerships.merchDesc": "Иконичното лого T1 е представено като белка с размер 5-6 см, поставена на класическото положение наляво на гърдите.",
      "partnerships.colorDesc": "За персонализиране предлагаме 420 нитки за идеална комбинация с дрехите, вариращи от 5 до 11 цветове в зависимост от моделa.",
      "partnerships.materialDesc": "Избрали сме американски бренд с тежка tkanina и oversized кројка. Колекцията включва тисии, диваки и худи в размери XS до 2XL.",
      "partnerships.button": "Марч магазин",
      "partnerships.contact": "Ако желаете да стане партньор ни за创作 на custom merch, присъединяване към нашия Twitch екип или други съвместни инициативи, можете да се свържете с нас чрез нашия Discord сървър.",

      // Footer
      "footer.about": "Виртуална транспортна логистика от 2019 г.",
      "footer.company": "Компания",
      "footer.credit": "Направено със ❤️ от sladkaroww",

      // Language Modal
      "modal.title": "Избери език",
      "modal.sub": "Избери предпочитания си език"
    }};

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





