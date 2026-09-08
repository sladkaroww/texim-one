/* Extra Bulgarian translations for text that is not covered by data-i18n. */
(function () {
  'use strict';

  const translations = {
    'Vehicles': 'Превозни средства',
    'Previous': 'Предишно',
    'Next': 'Следващо',
    'Our Team': 'Нашият екип',
    'The TEXIM ONE team on TruckersMP.': 'Екипът на TEXIM ONE в TruckersMP.',
    'View TruckersMP profile': 'Виж TruckersMP профила',
    'TEXIM ONE Events': 'Събития на TEXIM ONE',
    'Join our upcoming events and see who is participating.': 'Присъедини се към предстоящите ни събития и виж кой участва.',
    'Loading events…': 'Зареждане на събития…',
    'Loading events...': 'Зареждане на събития...',
    'Paste the TruckersMP event link. We’ll read the event automatically and fill in the details below.': 'Постави линка към TruckersMP събитието. Ще прочетем информацията автоматично и ще попълним данните по-долу.',
    'Requirements': 'Изисквания',
    'Corporate Identity.': 'Корпоративна идентичност.',
    'Platforms': 'Платформи',
    'To join us, you need to register, download, and install': 'За да се присъединиш към нас, трябва да се регистрираш, изтеглиш и инсталираш',
    'Follow the rules of these platforms and drive with the TrucksBook client running at speeds up to 100 km/h.': 'Спазвай правилата на тези платформи и шофирай с работещ TrucksBook клиент при скорост до 100 км/ч.',
    'Avatar & Tag': 'Аватар и таг',
    'The': 'Аватарът',
    'is used in TruckersMP and TrucksBook, while the': 'се използва в TruckersMP и TrucksBook, докато',
    'is used only in TruckersMP.': 'се използва само в TruckersMP.',
    'Vehicle Fleet': 'Автопарк',
    'Required for formal events.': 'Изисква се за официални събития.',
    'Truck': 'Камион',
    'Trailer': 'Ремарке',
    'Series:': 'Серия:',
    'Engine:': 'Двигател:',
    'Paint Job:': 'Боя:',
    'HEX Colors: FFFFFF; 000000; E1E1E1; FF0000. Don’t change anything else about the exterior. The Transmission, Interior, and Interior Accessories are optional.': 'HEX цветове: FFFFFF; 000000; E1E1E1; FF0000. Не променяйте нищо друго по външния вид. Скоростната кутия, интериорът и интериорните аксесоари са по желание.',
    "Don't change anything else about the exterior. The Transmission, Interior, and Interior Accessories are optional.": 'Не променяйте нищо друго по външния вид. Скоростната кутия, интериорът и интериорните аксесоари са по желание.',
    'Reputation System': 'Система за репутация',
    'Google Sheet': 'Google таблица',
    'Reputation Points': 'Точки за репутация',
    'Invite Us': 'Покани ни',
    'Invite Us to a convoy': 'Покани ни на конвой',
    'Fill out the form below and we will send your invite to our Discord channel.': 'Попълни формуляра по-долу и ще изпратим поканата ти в нашия Discord канал.',
    'My Profile': 'Моят профил',
    'Manage your TEXIM ONE member profile.': 'Управлявай своя профил на член на TEXIM ONE.',
    'Username': 'Потребителско име',
    'Display name': 'Показвано име',
    'Save profile': 'Запази профила',
    'Log out': 'Изход',
    'Permanently delete your TEXIM ONE account and profile.': 'Изтрий завинаги своя TEXIM ONE акаунт и профил.',
    'Delete profile': 'Изтрий профила',
    'Delete your profile?': 'Да изтрия ли профила ти?',
    'This action is': 'Това действие е',
    'irreversible': 'необратимо',
    'Your TEXIM ONE account and profile will be permanently deleted.': 'Твоят TEXIM ONE акаунт и профил ще бъдат изтрити завинаги.',
    'To confirm, press and hold the button for 3 seconds.': 'За потвърждение натисни и задръж бутона за 3 секунди.',
    'Press and hold to delete': 'Натисни и задръж за изтриване',
    'Cancel': 'Отказ',
    'Close': 'Затвори',
    'Create Account': 'Създай акаунт',
    'Become part of the TEXIM ONE member system.': 'Стани част от системата за членове на TEXIM ONE.',
    'Email': 'Имейл',
    'Password': 'Парола',
    'Register': 'Регистрация',
    'Already a member?': 'Вече си член?',
    'Log in': 'Вход',
    'Login': 'Вход',
    'Sign in with your username or email address.': 'Влез с потребителското си име или имейл адрес.',
    'Username or email': 'Потребителско име или имейл',
    'Forgot password?': 'Забравена парола?',
    'Reset Password': 'Нулиране на парола',
    'Send reset link': 'Изпрати линк за нулиране',
    'New password': 'Нова парола',
    'Update password': 'Обнови паролата',
    'Back to login': 'Назад към входа',
    'Privacy Policy': 'Политика за поверителност',
    'Terms of Use': 'Условия за ползване',
    'Made with ❤️ by sladkaroww & chea7er044': 'Направено с ❤️ от sladkaroww & chea7er044',
    'Policies': 'Политики',
    'Choose Language': 'Избери език',
    'Select your preferred language': 'Избери предпочитания от теб език'
  };

  const textNodes = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);
    return nodes;
  };

  function applyExtra() {
    const lang = localStorage.getItem('texim_lang') || 'en';
    if (lang !== 'bg') return;

    textNodes().forEach((node) => {
      const value = node.nodeValue.trim();
      if (!value || !translations[value]) return;
      node.nodeValue = node.nodeValue.replace(value, translations[value]);
    });

    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach((el) => {
      const value = el.getAttribute('placeholder');
      if (value === 'name#0000 or @user') el.setAttribute('placeholder', 'име#0000 или @потребител');
    });

    document.querySelectorAll('[aria-label]').forEach((el) => {
      const value = el.getAttribute('aria-label');
      if (value === 'Open menu') el.setAttribute('aria-label', 'Отвори менюто');
      if (value === 'Language') el.setAttribute('aria-label', 'Език');
      if (value === 'Previous') el.setAttribute('aria-label', 'Предишно');
      if (value === 'Next') el.setAttribute('aria-label', 'Следващо');
      if (value === 'Close') el.setAttribute('aria-label', 'Затвори');
    });

    const path = location.pathname;
    const titles = {
      '/profile.html': 'Моят профил | TEXIM ONE',
      '/register.html': 'Регистрация | TEXIM ONE',
      '/login.html': 'Вход | TEXIM ONE',
      '/forgot-password.html': 'Забравена парола | TEXIM ONE',
      '/reset-password.html': 'Нулиране на парола | TEXIM ONE',
      '/requirements.html': 'Изисквания и автопарк | TEXIM ONE',
      '/ranks.html': 'Система за репутация | TEXIM ONE',
      '/events.html': 'Събития и календар на конвоите | TEXIM ONE',
      '/media.html': 'Медия | TEXIM ONE',
      '/partners.html': 'Партньори | TEXIM ONE',
      '/apply.html': 'Кандидатстване | TEXIM ONE'
    };
    if (titles[path]) document.title = titles[path];
  }

  const observer = new MutationObserver(() => applyExtra());
  const start = () => {
    applyExtra();
    observer.observe(document.body, { childList: true, subtree: true });
    const switcher = document.getElementById('langSwitcher');
    switcher?.addEventListener('change', () => setTimeout(applyExtra, 50));
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
