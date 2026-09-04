/* Robust i18n for TEXIM ONE
   - Non-blocking, defensive, small footprint
   - Reads/writes localStorage texim_lang
   - Applies data-i18n and data-i18n-placeholder
   - Preserves nested child elements (e.g. inline "Read more" links)
   - Exposes window.t(key) and window.setLang(lang)
   - Safe to run multiple times
*/
(function () {
  'use strict';

  var I18N_KEY = 'texim_lang';

  var SITE_STRINGS = {
    en: {
      // Navigation
      'nav.home': 'Home',
      'nav.convoy': 'Convoy',
      'nav.media': 'Media',

      // Home - Hero
      'hero.subtitle': 'Professional Virtual Trucking Logistics',
      'hero.text': 'TEXIM ONE is a virtual trucking company that shows up for convoys across the TruckersMP community. Planning an event? Invite us along\u2026',
      'hero.discord': 'Discord Server',

      // Home - Stats
      'stat.drivers': 'Members',
      'stat.founded': 'Years experience',
      'stat.km': 'Mln WoTr Km',
      'stat.discord': 'Discord Members',

      // Home - Features
      'features.title': 'Why?',
      'features.sub': 'A virtual trucking experience built around accessibility and community.',
      'features.f1.title': 'No Pressure',
      'features.f1.text': 'No monthly km limits, no required convoy attendance, no age or hours requirements, no test period. Drive on your own terms.',
      'features.f2.title': 'Corporate Identity',
      'features.f2.text': 'Recognizable through our TMP tag, exclusive avatar, and signature truck + trailer composition that sets us apart on the road\u2026',
      'features.f3.title': 'Selective Recruitment',
      'features.f3.text': 'Applications are reviewed individually via our application form. We value quality and commitment over numbers.',
      'features.f4.title': 'Ranks',
      'features.f4.text': 'Our Reputation System (RS) ranks every driver by contribution: Newbie, Enthusiast, Worker, Professional, Master, Instructor\u2026',

      // Media page
      'media.title': 'Media',
      'media.sub': 'Our story, our moments, our community.',
      'media.twitch': 'Twitch Team',
      'media.twitch.text': 'We run an official TruckersMP Twitch Team where we stream our convoys and community moments live.',
      'media.twitch.btn': 'Watch on Twitch',
      'gallery.title': 'Gallery',
      'media.news': 'News',
      'media.news.text': 'Latest publications and updates from TEXIM ONE.',
      'media.news.read': 'Read more',
      'media.news.68663.title': 'TEXIM ONE Vtc x TEXIM ONE Ltd MERCH!',
      'media.news.68663.text': 'Our official merch collaboration with TEXIM ONE Ltd \u2014 heavyweight 100% combed cotton (230 g/m\u00b2), oversize fits in\u2026',
      'media.news.69383.title': 'TEXIM ONE Nova Group | Public Convoy #3',
      'media.news.69383.text': 'On 25 July 2026 we joined Nova Group | Public Convoy #3 \u2014 roughly 900 km from Oslo to Kristiansand in Norway on Sim\u2026',
      'media.news.69793.title': 'TEXIM ONE THE ORIGINAL\u2122 MONTHLY CONVOY #6',
      'media.news.69793.text': 'On 8 August 2026 we took part in THE ORIGINAL Monthly Convoy #6 \u2014 around 600 km from Szeged (Hungary) to Banska Bystrica (Slovakia) on Sim\u2026',

      // Convoy page
      'convoy.sub': 'Here are all convoys we are invited to.',
      'convoy.inviteTitle': 'Invite Us to a convoy',
      'convoy.inviteSub': 'Fill out the form below and we will send your invite to our Discord channel.',
      'convoy.calendar.title': 'Convoy Calendar',
      'convoy.calendar.loading': 'Loading convoys...',
      'convoy.none': 'No upcoming events',
      'convoy.error': 'Failed to load events',
      'convoy.meet': 'Meeting point',
      'convoy.view': 'View event',

      // Contact form
      'contact.eventName': 'Event Name *',
      'contact.eventDate': 'Event Date *',
      'contact.eventTime': 'Event Time',
      'contact.discord': 'Your Discord *',
      'contact.eventLink': 'Event Link',
      'contact.email': 'Email',
      'contact.details': 'Additional Details',
      'contact.submit': 'Send Invite',

      // Add convoy page
      'addconvoy.title': 'Add Convoy to Calendar',
      'addconvoy.sub': 'Review the invite and confirm to add it to the TEXIM ONE calendar.',
      'addconvoy.name': 'Convoy Name',
      'addconvoy.date': 'Date',
      'addconvoy.time': 'Start Time (UTC)',
      'addconvoy.discord': 'Invited by (Discord)',
      'addconvoy.link': 'Link',
      'addconvoy.details': 'Details',
      'addconvoy.confirm': 'Add to Calendar',
      'addconvoy.cancel': 'Cancel',
      'addconvoy.successTitle': 'Added to Calendar!',
      'addconvoy.successText': 'This convoy is now on the TEXIM ONE calendar.',
      'addconvoy.viewCalendar': 'View Calendar',

      // Form
      'form.success': 'Invite sent successfully!',

      // Language modal
      'modal.title': 'Choose Language',
      'modal.sub': 'Select your preferred language'
    },

    bg: {
      // Navigation
      'nav.home': '\u041d\u0430\u0447\u0430\u043b\u043e',
      'nav.convoy': '\u041a\u043e\u043d\u0432\u043e\u0439',
      'nav.media': '\u041c\u0435\u0434\u0438\u044f',

      // Home - Hero
      'hero.subtitle': '\u041f\u0440\u043e\u0444\u0435\u0441\u0438\u043e\u043d\u0430\u043b\u043d\u0430 \u0432\u0438\u0440\u0442\u0443\u0430\u043b\u043d\u0430 \u0442\u0440\u0430\u043d\u0441\u043f\u043e\u0440\u0442\u043d\u0430 \u043b\u043e\u0433\u0438\u0441\u0442\u0438\u043a\u0430',
      'hero.text': 'TEXIM ONE \u0435 \u0432\u0438\u0440\u0442\u0443\u0430\u043b\u043d\u0430 \u0442\u0440\u0430\u043d\u0441\u043f\u043e\u0440\u0442\u043d\u0430 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u044f, \u043a\u043e\u044f\u0442\u043e \u0441\u0435 \u0432\u043a\u043b\u044e\u0447\u0432\u0430 \u0432 \u043a\u043e\u043d\u0432\u043e\u0438 \u0438\u0437 \u0446\u044f\u043b\u0430\u0442\u0430 \u043e\u0431\u0449\u043d\u043e\u0441\u0442 \u043d\u0430 TruckersMP. \u041f\u043b\u0430\u043d\u0438\u0440\u0430\u0442\u0435 \u0441\u044a\u0431\u0438\u0442\u0438\u0435? \u041f\u043e\u043a\u0430\u043d\u0435\u0442\u0435 \u043d\u0438 \u0434\u0430 \u0443\u0447\u0430\u0441\u0442\u0432\u0430\u043c\u0435\u2026',
      'hero.discord': 'Discord \u0441\u044a\u0440\u0432\u044a\u0440',

      // Home - Stats
      'stat.drivers': '\u0427\u043b\u0435\u043d\u043e\u0432\u0435',
      'stat.founded': '\u0413\u043e\u0434\u0438\u043d\u0438 \u043e\u043f\u0438\u0442',
      'stat.km': '\u041c\u043b\u043d. WoTr \u043a\u043c',
      'stat.discord': 'Discord \u0447\u043b\u0435\u043d\u043e\u0432\u0435',

      // Home - Features
      'features.title': '\u0417\u0430\u0449\u043e?',
      'features.sub': '\u0412\u0438\u0440\u0442\u0443\u0430\u043b\u043d\u043e \u0442\u0440\u0430\u043d\u0441\u043f\u043e\u0440\u0442\u043d\u043e \u0438\u0437\u0436\u0438\u0432\u044f\u0432\u0430\u043d\u0435, \u0438\u0437\u0433\u0440\u0430\u0434\u0435\u043d\u043e \u043e\u043a\u043e\u043b\u043e \u0434\u043e\u0441\u0442\u044a\u043f\u043d\u043e\u0441\u0442\u0442\u0430 \u0438 \u043e\u0431\u0449\u043d\u043e\u0441\u0442\u0442\u0430.',
      'features.f1.title': '\u0411\u0435\u0437 \u043d\u0430\u043f\u0440\u0435\u0436\u0435\u043d\u0438\u0435',
      'features.f1.text': '\u0411\u0435\u0437 \u043c\u0435\u0441\u0435\u0447\u043d\u0438 \u043a\u0438\u043b\u043e\u043c\u0435\u0442\u0440\u0438\u0447\u043d\u0438 \u043b\u0438\u043c\u0438\u0442\u0438, \u0431\u0435\u0437 \u0437\u0430\u0434\u044a\u043b\u0436\u0438\u0442\u0435\u043b\u043d\u043e \u0443\u0447\u0430\u0441\u0442\u0438\u0435 \u0432 \u043a\u043e\u043d\u0432\u043e\u0438, \u0431\u0435\u0437 \u0438\u0437\u0438\u0441\u043a\u0432\u0430\u043d\u0438\u044f \u0437\u0430 \u0432\u044a\u0437\u0440\u0430\u0441\u0442 \u0438\u043b\u0438 \u0438\u0437\u0438\u0433\u0440\u0430\u043d\u0438 \u0447\u0430\u0441\u043e\u0432\u0435, \u0431\u0435\u0437 \u0438\u0437\u043f\u0438\u0442\u0430\u0442\u0435\u043b\u0435\u043d \u043f\u0435\u0440\u0438\u043e\u0434. \u0428\u043e\u0444\u0438\u0440\u0430\u0439\u0442\u0435 \u043d\u0430 \u0441\u0432\u043e\u0438 \u0443\u0441\u043b\u043e\u0432\u0438\u044f.',
      'features.f2.title': '\u041a\u043e\u0440\u043f\u043e\u0440\u0430\u0442\u0438\u0432\u043d\u0430 \u0438\u0434\u0435\u043d\u0442\u0438\u0447\u043d\u043e\u0441\u0442',
      'features.f2.text': '\u0420\u0430\u0437\u043f\u043e\u0437\u043d\u0430\u0432\u0430\u0435\u043c\u0438 \u0447\u0440\u0435\u0437 \u043d\u0430\u0448\u0438\u044f TMP \u0442\u0430\u0433, \u0435\u043a\u0441\u043a\u043b\u044e\u0437\u0438\u0432\u0435\u043d \u0430\u0432\u0430\u0442\u0430\u0440 \u0438 \u0444\u0438\u0440\u043c\u0435\u043d\u0430\u0442\u0430 \u043a\u043e\u043c\u0431\u0438\u043d\u0430\u0446\u0438\u044f \u043e\u0442 \u043a\u0430\u043c\u0438\u043e\u043d + \u0440\u0435\u043c\u0430\u0440\u043a\u0435, \u043a\u043e\u044f\u0442\u043e \u043d\u0438 \u043e\u0442\u043b\u0438\u0447\u0430\u0432\u0430 \u043d\u0430 \u043f\u044a\u0442\u044f\u2026',
      'features.f3.title': '\u0421\u0435\u043b\u0435\u043a\u0442\u0438\u0432\u043d\u043e \u043d\u0430\u0431\u0438\u0440\u0430\u043d\u0435',
      'features.f3.text': '\u041a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u0443\u0440\u0438\u0442\u0435 \u0441\u0435 \u0440\u0430\u0437\u0433\u043b\u0435\u0436\u0434\u0430\u0442 \u0438\u043d\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043b\u043d\u043e \u0447\u0440\u0435\u0437 \u043d\u0430\u0448\u0430\u0442\u0430 \u0444\u043e\u0440\u043c\u0430 \u0437\u0430 \u043a\u0430\u043d\u0434\u0438\u0434\u0430\u0442\u0441\u0442\u0432\u0430\u043d\u0435. \u0426\u0435\u043d\u0438\u043c \u043a\u0430\u0447\u0435\u0441\u0442\u0432\u043e\u0442\u043e \u0438 \u0430\u043d\u0433\u0430\u0436\u0438\u0440\u0430\u043d\u043e\u0441\u0442\u0442\u0430 \u043f\u043e\u0432\u0435\u0447\u0435 \u043e\u0442 \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u0430\u0442\u0430.',
      'features.f4.title': '\u0420\u0430\u043d\u0433\u043e\u0432\u0435',
      'features.f4.text': '\u041d\u0430\u0448\u0430\u0442\u0430 \u0441\u0438\u0441\u0442\u0435\u043c\u0430 \u0437\u0430 \u0440\u0435\u043f\u0443\u0442\u0430\u0446\u0438\u044f (RS) \u043a\u043b\u0430\u0441\u0438\u0440\u0430 \u0432\u0441\u0435\u043a\u0438 \u0448\u043e\u0444\u044c\u043e\u0440 \u0441\u043f\u043e\u0440\u0435\u0434 \u043f\u0440\u0438\u043d\u043e\u0441\u0430: \u041d\u043e\u0432\u0430\u043a, \u0415\u043d\u0442\u0443\u0437\u0438\u0430\u0441\u0442, \u0420\u0430\u0431\u043e\u0442\u043d\u0438\u043a, \u041f\u0440\u043e\u0444\u0435\u0441\u0438\u043e\u043d\u0430\u043b\u0438\u0441\u0442, \u041c\u0430\u0439\u0441\u0442\u043e\u0440, \u0418\u043d\u0441\u0442\u0440\u0443\u043a\u0442\u043e\u0440\u2026',

      // Media page
      'media.title': '\u041c\u0435\u0434\u0438\u044f',
      'media.sub': '\u041d\u0430\u0448\u0430\u0442\u0430 \u0438\u0441\u0442\u043e\u0440\u0438\u044f, \u043d\u0430\u0448\u0438\u0442\u0435 \u043c\u043e\u043c\u0435\u043d\u0442\u0438, \u043d\u0430\u0448\u0430\u0442\u0430 \u043e\u0431\u0449\u043d\u043e\u0441\u0442.',
      'media.twitch': 'Twitch \u043e\u0442\u0431\u043e\u0440',
      'media.twitch.text': '\u041f\u043e\u0434\u0434\u044a\u0440\u0436\u0430\u043c\u0435 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u0435\u043d Twitch \u043e\u0442\u0431\u043e\u0440 \u0432 TruckersMP, \u043a\u044a\u0434\u0435\u0442\u043e \u0441\u0442\u0440\u0438\u0439\u043c\u0432\u0430\u043c\u0435 \u043d\u0430\u0448\u0438\u0442\u0435 \u043a\u043e\u043d\u0432\u043e\u0438 \u0438 \u043e\u0431\u0449\u043d\u043e\u0441\u0442\u043d\u0438 \u043c\u043e\u043c\u0435\u043d\u0442\u0438 \u043d\u0430 \u0436\u0438\u0432\u043e.',
      'media.twitch.btn': '\u0413\u043b\u0435\u0434\u0430\u0439 \u0432 Twitch',
      'gallery.title': '\u0413\u0430\u043b\u0435\u0440\u0438\u044f',
      'media.news': '\u041d\u043e\u0432\u0438\u043d\u0438',
      'media.news.text': '\u041d\u0430\u0439-\u043d\u043e\u0432\u0438\u0442\u0435 \u043f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u0438 \u0438 \u0430\u043a\u0442\u0443\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u0438 \u043e\u0442 TEXIM ONE.',
      'media.news.read': '\u0412\u0438\u0436 \u043f\u043e\u0432\u0435\u0447\u0435',
      'media.news.68663.title': 'TEXIM ONE Vtc x TEXIM ONE Ltd \u041c\u0415\u0420\u0427!',
      'media.news.68663.text': '\u041d\u0430\u0448\u0430\u0442\u0430 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0430 \u043a\u043e\u043b\u0430\u0431\u043e\u0440\u0430\u0446\u0438\u044f \u0437\u0430 \u043c\u0435\u0440\u0447 \u0441 TEXIM ONE Ltd \u2014 \u0442\u0435\u0436\u044a\u043a 100% \u0440\u0430\u0437\u0440\u0435\u0441\u0435\u043d \u043f\u0430\u043c\u0443\u043a (230 g/m\u00b2), oversize \u043a\u0440\u043e\u0439\u043a\u0438 \u0432\u2026',
      'media.news.69383.title': 'TEXIM ONE Nova Group | \u041f\u0443\u0431\u043b\u0438\u0447\u0435\u043d \u043a\u043e\u043d\u0432\u043e\u0439 #3',
      'media.news.69383.text': '\u041d\u0430 25 \u044e\u043b\u0438 2026 \u0433. \u0441\u0435 \u043f\u0440\u0438\u0441\u044a\u0435\u0434\u0438\u043d\u0438\u0445\u043c\u0435 \u043a\u044a\u043c Nova Group | \u041f\u0443\u0431\u043b\u0438\u0447\u0435\u043d \u043a\u043e\u043d\u0432\u043e\u0439 #3 \u2014 \u043e\u043a\u043e\u043b\u043e 900 \u043a\u043c \u043e\u0442 \u041e\u0441\u043b\u043e \u0434\u043e \u041a\u0440\u0438\u0441\u0442\u0438\u0430\u043d\u0441\u0430\u043d\u0434 \u0432 \u041d\u043e\u0440\u0432\u0435\u0433\u0438\u044f \u043d\u0430 \u0441\u0438\u043c\u0443\u043b\u0430\u0442\u043e\u0440\u0430\u2026',
      'media.news.69793.title': 'TEXIM ONE THE ORIGINAL\u2122 \u041c\u0415\u0421\u0415\u0427\u0415\u041d \u041a\u041e\u041d\u0412\u041e\u0419 #6',
      'media.news.69793.text': '\u041d\u0430 8 \u0430\u0432\u0433\u0443\u0441\u0442 2026 \u0433. \u0443\u0447\u0430\u0441\u0442\u0432\u0430\u0445\u043c\u0435 \u0432 THE ORIGINAL Monthly Convoy #6 \u2014 \u043e\u043a\u043e\u043b\u043e 600 \u043a\u043c \u043e\u0442 \u0421\u0435\u0433\u0435\u0434 (\u0423\u043d\u0433\u0430\u0440\u0438\u044f) \u0434\u043e \u0411\u0430\u043d\u0441\u043a\u0430 \u0411\u0438\u0441\u0442\u0440\u0438\u0446\u0430 (\u0421\u043b\u043e\u0432\u0430\u043a\u0438\u044f) \u043d\u0430 \u0441\u0438\u043c\u0443\u043b\u0430\u0442\u043e\u0440\u0430\u2026',

      // Convoy page
      'convoy.sub': '\u0415\u0442\u043e \u0432\u0441\u0438\u0447\u043a\u0438 \u043a\u043e\u043d\u0432\u043e\u0438, \u043a\u044a\u043c \u043a\u043e\u0438\u0442\u043e \u0441\u043c\u0435 \u043f\u043e\u043a\u0430\u043d\u0435\u043d\u0438.',
      'convoy.inviteTitle': '\u041f\u043e\u043a\u0430\u043d\u0435\u0442\u0435 \u043d\u0438 \u043d\u0430 \u043a\u043e\u043d\u0432\u043e\u0439',
      'convoy.inviteSub': '\u041f\u043e\u043f\u044a\u043b\u043d\u0435\u0442\u0435 \u0444\u043e\u0440\u043c\u0443\u043b\u044f\u0440\u0430 \u043f\u043e-\u0434\u043e\u043b\u0443 \u0438 \u0449\u0435 \u0438\u0437\u043f\u0440\u0430\u0442\u0438\u043c\u0435 \u0432\u0430\u0448\u0430\u0442\u0430 \u043f\u043e\u043a\u0430\u043d\u0430 \u0432 \u043d\u0430\u0448\u0438\u044f Discord \u043a\u0430\u043d\u0430\u043b.',
      'convoy.calendar.title': '\u041a\u0430\u043b\u0435\u043d\u0434\u0430\u0440 \u043d\u0430 \u043a\u043e\u043d\u0432\u043e\u0438\u0442\u0435',
      'convoy.calendar.loading': '\u0417\u0430\u0440\u0435\u0436\u0434\u0430\u043d\u0435 \u043d\u0430 \u043a\u043e\u043d\u0432\u043e\u0438\u0442\u0435...',
      'convoy.none': '\u041d\u044f\u043c\u0430 \u043f\u0440\u0435\u0434\u0441\u0442\u043e\u044f\u0449\u0438 \u0441\u044a\u0431\u0438\u0442\u0438\u044f',
      'convoy.error': '\u0413\u0440\u0435\u0448\u043a\u0430 \u043f\u0440\u0438 \u0437\u0430\u0440\u0435\u0436\u0434\u0430\u043d\u0435 \u043d\u0430 \u0441\u044a\u0431\u0438\u0442\u0438\u044f\u0442\u0430',
      'convoy.meet': '\u041c\u044f\u0441\u0442\u043e \u043d\u0430 \u0441\u0440\u0435\u0449\u0430',
      'convoy.view': '\u0412\u0438\u0436 \u0441\u044a\u0431\u0438\u0442\u0438\u0435\u0442\u043e',

      // Contact form
      'contact.eventName': '\u0418\u043c\u0435 \u043d\u0430 \u0441\u044a\u0431\u0438\u0442\u0438\u0435\u0442\u043e *',
      'contact.eventDate': '\u0414\u0430\u0442\u0430 \u043d\u0430 \u0441\u044a\u0431\u0438\u0442\u0438\u0435\u0442\u043e *',
      'contact.eventTime': '\u0427\u0430\u0441 \u043d\u0430 \u0441\u044a\u0431\u0438\u0442\u0438\u0435\u0442\u043e',
      'contact.discord': '\u0412\u0430\u0448\u0438\u044f\u0442 Discord *',
      'contact.eventLink': '\u041b\u0438\u043d\u043a \u043d\u0430 \u0441\u044a\u0431\u0438\u0442\u0438\u0435\u0442\u043e',
      'contact.email': '\u0418\u043c\u0435\u0439\u043b',
      'contact.details': '\u0414\u043e\u043f\u044a\u043b\u043d\u0438\u0442\u0435\u043b\u043d\u0438 \u0434\u0435\u0442\u0430\u0439\u043b\u0438',
      'contact.submit': '\u0418\u0437\u043f\u0440\u0430\u0442\u0438 \u043f\u043e\u043a\u0430\u043d\u0430',

      // Add convoy page
      'addconvoy.title': '\u0414\u043e\u0431\u0430\u0432\u0438 \u043a\u043e\u043d\u0432\u043e\u0439 \u043a\u044a\u043c \u043a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u0430',
      'addconvoy.sub': '\u041f\u0440\u0435\u0433\u043b\u0435\u0434\u0430\u0439\u0442\u0435 \u043f\u043e\u043a\u0430\u043d\u0430\u0442\u0430 \u0438 \u043f\u043e\u0442\u0432\u044a\u0440\u0434\u0435\u0442\u0435, \u0437\u0430 \u0434\u0430 \u044f \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u0435 \u043a\u044a\u043c \u043a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u0430 \u043d\u0430 TEXIM ONE.',
      'addconvoy.name': '\u0418\u043c\u0435 \u043d\u0430 \u043a\u043e\u043d\u0432\u043e\u044f',
      'addconvoy.date': '\u0414\u0430\u0442\u0430',
      'addconvoy.time': '\u041d\u0430\u0447\u0430\u043b\u0435\u043d \u0447\u0430\u0441 (UTC)',
      'addconvoy.discord': '\u041f\u043e\u043a\u0430\u043d\u0435\u043d \u043e\u0442 (Discord)',
      'addconvoy.link': '\u041b\u0438\u043d\u043a',
      'addconvoy.details': '\u0414\u0435\u0442\u0430\u0439\u043b\u0438',
      'addconvoy.confirm': '\u0414\u043e\u0431\u0430\u0432\u0438 \u043a\u044a\u043c \u043a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u0430',
      'addconvoy.cancel': '\u041e\u0442\u043a\u0430\u0437',
      'addconvoy.successTitle': '\u0414\u043e\u0431\u0430\u0432\u0435\u043d\u043e \u043a\u044a\u043c \u043a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u0430!',
      'addconvoy.successText': '\u0422\u043e\u0437\u0438 \u043a\u043e\u043d\u0432\u043e\u0439 \u0432\u0435\u0447\u0435 \u0435 \u0432 \u043a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u0430 \u043d\u0430 TEXIM ONE.',
      'addconvoy.viewCalendar': '\u0412\u0438\u0436 \u043a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u0430',

      // Form
      'form.success': '\u041f\u043e\u043a\u0430\u043d\u0430\u0442\u0430 \u0435 \u0438\u0437\u043f\u0440\u0430\u0442\u0435\u043d\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e!',

      // Language modal
      'modal.title': '\u0418\u0437\u0431\u0435\u0440\u0435\u0442\u0435 \u0435\u0437\u0438\u043a',
      'modal.sub': '\u0418\u0437\u0431\u0435\u0440\u0435\u0442\u0435 \u043f\u0440\u0435\u0434\u043f\u043e\u0447\u0438\u0442\u0430\u043d\u0438\u044f \u043e\u0442 \u0432\u0430\u0441 \u0435\u0437\u0438\u043a'
    }
  };

  function safeGetStoredLang() {
    try {
      var v = localStorage.getItem(I18N_KEY);
      if (v === 'bg') return 'bg';
      return 'en';
    } catch (err) {
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
    var normalized = (lang === 'bg') ? 'bg' : 'en';
    setStoredLang(normalized);
    applyLang(normalized);
  }

  // Apply translations to the DOM. Defensive: do not throw.
  // Preserves nested child elements (e.g. an inline "Read more" link inside a <p>).
  function applyLang(lang) {
    try {
      var dict = SITE_STRINGS[lang] || SITE_STRINGS.en;

      var nodes = document.querySelectorAll('[data-i18n]');
      Array.prototype.forEach.call(nodes, function (el) {
        try {
          var key = el.getAttribute('data-i18n');
          if (!key) return;
          var val = dict[key];
          if (val == null) return;

          if (el.childNodes.length > 1) {
            // Has child nodes besides a single text node -> update only the leading text node
            var first = el.firstChild;
            if (first && first.nodeType === 3) {
              first.nodeValue = val;
            } else {
              el.insertBefore(document.createTextNode(val), first || null);
            }
          } else {
            el.textContent = val;
          }
        } catch (er) {
          console.debug('i18n: element update failed', el, er);
        }
      });

      var placeholders = document.querySelectorAll('[data-i18n-placeholder]');
      Array.prototype.forEach.call(placeholders, function (el) {
        try {
          var key = el.getAttribute('data-i18n-placeholder');
          if (!key) return;
          var val = dict[key];
          if (val != null) el.setAttribute('placeholder', val);
        } catch (er) {
          console.debug('i18n: placeholder update failed', el, er);
        }
      });

      try {
        document.documentElement.setAttribute('lang', lang);
      } catch (er) {
        // ignore
      }

      try {
        document.dispatchEvent(new CustomEvent('texim:langchange', { detail: { lang: lang } }));
      } catch (er) {
        // ignore
      }

      return true;
    } catch (err) {
      console.error('i18n: applyLang failed', err);
      return false;
    }
  }

  // Bind UI controls (langSwitcher select, .lang-option buttons, modal close)
  function bindControls() {
    try {
      var switcher = document.getElementById('langSwitcher');
      if (switcher) {
        try { switcher.value = getCurrentLang(); } catch (e) { /* ignore */ }
        switcher.addEventListener('change', function (e) {
          setLang(e.target.value);
        });
      }

      var optionButtons = document.querySelectorAll('.lang-option[data-lang]');
      Array.prototype.forEach.call(optionButtons, function (btn) {
        try {
          btn.addEventListener('click', function () {
            var lang = btn.getAttribute('data-lang');
            setLang(lang);
            var modal = document.getElementById('langModal');
            if (modal) modal.classList.remove('open');
            if (switcher) try { switcher.value = getCurrentLang(); } catch (e) {}
          });
        } catch (er) { /* ignore per-button errors */ }
      });

      // Close button + click-outside for the language modal
      var modal = document.getElementById('langModal');
      if (modal) {
        var closeBtn = modal.querySelector('.lang-close');
        if (closeBtn) {
          closeBtn.addEventListener('click', function () {
            modal.classList.remove('open');
          });
        }
        modal.addEventListener('click', function (e) {
          if (e.target === modal) modal.classList.remove('open');
        });
      }
    } catch (err) {
      console.debug('i18n: bindControls failed', err);
    }
  }

  // Public accessor for other scripts
  function t(key) {
    try {
      var lang = getCurrentLang();
      var dict = SITE_STRINGS[lang] || SITE_STRINGS.en;
      if (dict[key] != null) return dict[key];
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

    // show modal on first visit
    try {
      var stored = localStorage.getItem(I18N_KEY);
      if (!stored) {
        var modal = document.getElementById('langModal');
        if (modal) setTimeout(function () { modal.classList.add('open'); }, 600);
      }
    } catch (err) {
      // ignore
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOnce);
  } else {
    setTimeout(initOnce, 0);
  }

})();
