// TEXIM ONE - bilingual i18n (English / Bulgarian)
// Content is swapped via data-i18n attributes. Language is stored in
// localStorage. On first visit a modal prompts the user to choose a language.

const SITE_STRINGS = {
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.convoy': 'Convoy',
    'nav.join': 'Join Us',
    'nav.invite': 'Invite',

    'hero.subtitle': 'Professional Virtual Trucking Logistics',
    'hero.text': 'TEXIM ONE is a virtual trucking company that shows up for convoys across the TruckersMP community. Planning an event? Invite us along, no pressure, no obligations, just great company on the open road.',
    'hero.btn1': 'Our Convoys',
    'hero.btn2': 'Media',

    'stat.drivers': 'Active Employees',
    'stat.founded': 'Years of Experience',
    'stat.games': 'Supported Games',
    'stat.dlcs': 'Required DLCs',
    'stat.members': 'Members',
    'stat.recruitment': 'Recruitment',
    'stat.km': 'Million WoTr km',

    'features.title': 'Why?',
    'features.sub': 'A virtual trucking experience built around accessibility and community.',
    'features.f1.title': 'No Limits, No Pressure',
    'features.f1.text': 'No monthly km limits, no required convoy attendance, no age or hours requirements, no test period. Drive on your own terms.',
    'features.f2.title': 'Distinct Corporate Identity',
    'features.f2.text': 'Recognizable through our TMP tag, exclusive avatar, and signature truck + trailer composition that sets us apart on the road.',
    'features.f3.title': 'Selective Recruitment',
    'features.f3.text': 'Applications are reviewed individually via our application form. We value quality and commitment over numbers.',
    'features.f4.title': 'Ranks',
    'features.f4.text': 'Our Reputation System (RS) ranks every driver by contribution: Newbie, Enthusiast, Worker, Professional, Master, Instructor, Elite, King, Legend and Champion.',

    'gallery.title': 'Gallery',
    'gallery.sub': 'Convoys and events TEXIM ONE is part of, photos straight from the road.',

    'join.title': 'Join',
    'join.text': 'Join our Discord community and start your journey with TEXIM ONE.',
    'join.btn': 'Join Our Discord',
    'apply.btn': 'Apply to Join',

    'footer.about': 'Professional virtual trucking logistics since 2019.',
    'footer.company': 'Company',
    'footer.support': 'Support',
    'footer.language': 'Language',

    // About page
    'about.title': 'About',
    'about.sub': 'Always number one in mind, behind TEXIM!',
    'about.who': 'Who We Are',
    'about.who.p1': 'Our concept of accessibility sets us apart, which is why we don\'t require a monthly kilometre limit, convoy attendance, a set age, in-game hours, DLCs, or a trial period.',
    'about.diff': 'What Makes Us Different',
    'about.diff.p1': 'You can recognize us by our corporate identity, which sets us apart through our TruckersMP TAG, Avatar, and truck + trailer composition.',
    'about.diff.p2': 'Without forcing our drivers, most of them mainly complete World of Trucks deliveries, which sets us apart with a speed limiter and no road assistance.',
    'about.recruit': 'Recruitment & Community',
    'about.recruit.p1': 'Our application process stands apart from the rest, who almost beg you to join. Applications are submitted through a Google Form, and every application is reviewed individually.',
    'about.recruit.p2': 'We at TEXIM ONE VTC have a Twitch Team, and thanks to TEXIM ONE Ltd we now also have official Merch, which sets us apart as a well-developed community.',
    'about.facts': 'Facts',
    'about.facts.sub': 'Key details about TEXIM ONE from our official TruckersMP profile.',
    'about.view': 'View on TruckersMP',
    'about.view.sub': 'View our full company profile and members on TruckersMP.',
    'about.team': 'Our Leadership',
    'about.team.sub': 'Meet the people steering TEXIM ONE.',
    'about.members': 'View All Members',

    // Convoy page
    'convoy.title': 'Convoy',
    'convoy.sub': 'All upcoming convoys automatically imported from TruckersMP.',
    'convoy.subscribe': 'Subscribe to Our Calendar',
    'convoy.subscribe.sub': 'Import all upcoming TEXIM ONE convoys straight into your calendar. The feed updates automatically as new events are added.',
    'convoy.download': 'Download .ics File',
    'convoy.google': 'Add to Google Calendar',
    'convoy.webcal': 'Subscribe (webcal)',
    'convoy.calendar': 'TEXIM ONE Calendar',
    'convoy.calendar.sub': 'Our full event calendar, powered by Sesh. Live and always up to date.',
    'convoy.calendar.title': 'Convoy Calendar',
    'convoy.calendar.add': 'Add Your Convoy',
    'convoy.calendar.loading': 'Loading convoys...',
    'convoy.open': 'Open Calendar in New Tab',
    'convoy.upcoming': 'Upcoming Convoys',
    'convoy.upcoming.sub': 'Live events synced from our TruckersMP profile. Auto-refreshes.',
    'convoy.loading': 'Loading upcoming convoys...',
    'convoy.none': 'No upcoming convoys right now. Check back soon!',
    'convoy.error': 'Unable to load convoys right now. Please try again later.',
    'convoy.view': 'View Event',
    'convoy.meet': 'Meet',

    // Contact page
    'contact.title': 'Invite',
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
    'contact.declinedTitle': 'Auto-Declined: Date Conflict',
    'contact.declinedText': 'We already have a TEXIM ONE convoy on that date, so this invite was automatically declined. We will DM you on Discord to confirm.',
    'contact.again': 'Send Another',

    // Add-to-calendar page
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

    // Language modal
    'nav.media': 'Media',
    'stat.discord': 'Discord Members',
    'hero.btn1': 'Our Convoys',
    'hero.btn2': 'Media',
    'media.title': 'Media',
    'about.achievements': 'Our Achievements',
    'about.achievements.text': 'We are proud of the achievements that set us apart as innovators in the Bulgarian community, thanks to our unconventional and out-of-the-box thinking. As a result, we can proudly say we were the first and only validated Bulgarian company in TruckersMP at the time, the first and only Bulgarian company with a Twitch Team, and the first and only Bulgarian company with official Merch.',
    'media.twitch': 'Twitch Team',
    'media.twitch.text': 'We run an official TruckersMP Twitch Team where we stream our convoys and community moments live.',
    'media.news': 'TruckersMP News',
    'media.news.text': 'Publications and updates we share on our official TruckersMP profile.',
    'media.news.69793.title': 'TEXIM ONE THE ORIGINAL™ MONTHLY CONVOY #6',
    'media.news.69793.text': 'On 8 August 2026 we took part in THE ORIGINAL Monthly Convoy #6 — around 600 km from Szeged (Hungary) to Banska Bystrica (Slovakia) on the Event Server.',
    'media.news.69383.title': 'TEXIM ONE Nova Group | Public Convoy #3',
    'media.news.69383.text': 'On 25 July 2026 we joined Nova Group | Public Convoy #3 — roughly 900 km from Oslo to Kristiansand in Norway on Simulation 2.',
    'media.news.68663.title': 'TEXIM ONE Vtc x TEXIM ONE Ltd MERCH!',
    'media.news.68663.text': 'Our official merch collaboration with TEXIM ONE Ltd — heavyweight 100% combed cotton (230 g/m²), oversize fits in White, Black, Bone and Midnight Navy, with an embroidered T1 logo. Orders open via Discord ticket.',
    'media.news.68060.title': 'TEXIM ONE 57. Monthly RSL-Event | May',
    'media.news.68060.text': 'On 27 May 2026 we took part in the 57th Monthly RSL-Event with United Convoys — around 1000 km from Calarasi to Cluj-Napoca in Romania on the Event Server.',
    'media.news.67722.title': 'Weekly Activity - Friday Community Convoy',
    'media.news.67722.text': 'Every Friday we gather for a relaxed public convoy on Simulation 1 — no fixed route, no minimum participants, and every gathering awards 10 000 RP through our Reputation System.',
    'media.news.67670.title': 'Reputation System (RS) Update',
    'media.news.67670.text': 'The Reputation System gets a democratic upgrade: every company decision is now settled by weighted voting, where 1 Level = 1 vote. Your influence depends purely on your activity.',
    'media.news.67599.title': 'Eurovision 2026 - Bangaranga 🇧🇬',
    'media.news.67599.text': 'A tribute to Dara and her historic Eurovision 2026 victory for Bulgaria — turning doubt into fuel and bringing the trophy home for the first time.',
    'media.news.67582.title': 'TEXIM ONE Pink Ribbon VTC – 4th Anniversary',
    'media.news.67582.text': 'On 15 May 2026 we joined the Pink Ribbon VTC 4th Anniversary convoy with United Convoys — about 1200 km from the TruckersMP HQ in Poland to Hamburg in Germany.',
    'media.news.67539.title': 'Corporate Identity Update',
    'media.news.67539.text': 'A fresh look for version 1.59: the new VNL 2025 in ATS, updated FH6 Aero with Kässbohrer K.SCX X+ in ETS2, a T1-focused logo, white TMP tag, and no more mandatory [BG] in nicknames.',
    'media.news.67529.title': 'TrucksBook Bulgaria - Certificates',
    'media.news.67529.text': 'TrucksBook Bulgaria recognized our community with thirteen certificates — five company awards for 2019-2025 and eight personal ones — and Marvinito was promoted to Manager.',
    'media.news.67416.title': 'Happy May 9th!',
    'media.news.67416.text': 'Marking Europe Day and the triumph over Nazi Germany — a reflection on history, sovereignty and the place of Bulgaria in the European family.',
    'media.news.65805.title': 'Reputation System (RS)',
    'media.news.65805.text': 'Our official recognition and authority system that ranks every driver, rewarding activity with titles from Newbie to Champion.',
    'media.news.65704.title': 'TEXIM ONE Pink Ribbon VTC – March Convoy',
    'media.news.65704.text': 'On 13 March 2026 we took part in the Pink Ribbon VTC March Convoy with United Convoys — around 800 km from Naples to Florence in Italy on the Event Server.',
    'media.news.58783.title': 'Corporate Identity',
    'media.news.58783.text': 'The complete guide to our corporate identity — the signature Volvo + Kässbohrer composition, TruckersMP tag, avatar and naming rules that make TEXIM ONE recognizable on the road.',
    'media.news.read': 'Read on TruckersMP',
    'media.sub': 'Our story, our moments, our community.',
    'media.twitch.btn': 'Watch on Twitch',
    'gallery.title': 'Gallery',
    'convoy.inviteTitle': 'Invite Us to Your Convoy',
    'convoy.inviteSub': 'Fill out the form below and we will send your invite to our Discord channel.',
    'lang.title': 'Choose your language',
    'lang.sub': 'Изберете вашия език',
    'lang.close': 'Close'
  },
  bg: {
    'nav.home': 'Начало',
    'nav.about': 'За нас',
    'nav.convoy': 'Конвои',
    'nav.join': 'Присъедини се',
    'nav.invite': 'Покани',

    'hero.subtitle': 'Професионална виртуална транспортна логистика',
    'hero.text': 'Винаги 1 на ум, зад TEXIM! Постигни мечтите си за шофьор и се наслади на най-гъвкавото шофиране, без лимити, без задължения, само открит път и страхотна общност.',
    'hero.btn1': 'Нашите конвои',
    'hero.btn2': 'Медия',

    'stat.drivers': 'Активни служители',
    'stat.founded': 'години опит',
    'stat.games': 'Поддържани игри',
    'stat.dlcs': 'Изисквани DLC',
    'stat.members': 'Членове',
    'stat.recruitment': 'Набиране',
    'stat.km': 'млн WoTr км',

    'features.title': 'Защо?',
    'features.sub': 'Виртуално шофиране, изградено около достъпността и общността.',
    'features.f1.title': 'Без лимити, без натиск',
    'features.f1.text': 'Без месечни километри, задължително участие в конвои, възраст или работни часове, без тестов период. Карай по свои правила.',
    'features.f2.title': 'Отличителна фирмена идентичност',
    'features.f2.text': 'Разпознаваеми по нашия TMP таг, ексклузивен аватар и характерна композиция влекач + ремарке.',
    'features.f3.title': 'Селективно набиране',
    'features.f3.text': 'Кандидатурите се разглеждат индивидуално чрез нашата форма. Ценим качеството и ангажираността пред количеството.',
    'features.f4.title': 'Рангове',
    'features.f4.text': 'Нашата Reputation System (RS) ранжира всеки шофьор по принос: Newbie, Enthusiast, Worker, Professional, Master, Instructor, Elite, King, Legend и Champion.',

    'gallery.title': 'Галерия',
    'gallery.sub': 'Конвои и събития, в които TEXIM ONE участва, снимки направо от пътя.',

    'join.title': 'Присъедини се',
    'join.text': 'Присъедини се към нашата Discord общност и започни своето пътешествие с TEXIM ONE.',
    'join.btn': 'Присъедини се към Discord',
    'apply.btn': 'Кандидатствай',

    'footer.about': 'Професионална виртуална транспортна логистика от 2019 г.',
    'footer.company': 'Компания',
    'footer.support': 'Поддръжка',
    'footer.language': 'Език',

    // About page
    'about.title': 'За нас',
    'about.sub': 'Винаги 1 на ум, зад TEXIM!',
    'about.who': 'Кои сме ние',
    'about.who.p1': 'Концепцията за достъпност ни отличава, затова не изискваме месечен лимит километри, участие в конвои, определена възраст, часове в игра, DLC-та или тестов период.',
    'about.diff': 'Какво ни отличава',
    'about.diff.p1': 'Може да ни разпознаете по нашата фирмена идентичност, която ни отличава чрез TruckersMP TAG, Аватар и Композиция от влекач и ремарке.',
    'about.diff.p2': 'Без да задължаваме нашите шофьори, повечето от тях изпълняват основно World of Trucks доставки, което ни отличава с ограничител на скоростта и без пътна помощ.',
    'about.recruit': 'Набиране и общност',
    'about.recruit.p1': 'Процесът по кандидатстване се отличава от останалите, които почти ви се молят да се присъедините. Кандидатстването се извършва чрез Google Form, като всяка кандидатура се разглежда индивидуално.',
    'about.recruit.p2': 'Ние от TEXIM ONE Vtc разполагаме с Twitch Team, а благодарение на TEXIM ONE Ltd вече и с официален Merch, което ни отличава като добре развита общност.',
    'about.facts': 'Факти',
    'about.facts.sub': 'Основни данни за TEXIM ONE от официалния ни профил в TruckersMP.',
    'about.view': 'Виж в TruckersMP',
    'about.view.sub': 'Вижте пълния ни профил и членовете в TruckersMP.',
    'about.team': 'Нашите служители',
    'about.team.sub': 'Запознайте се с екипа на TEXIM ONE.',
    'about.members': 'Виж всички членове',

    // Convoy page
    'convoy.title': 'Конвои',
    'convoy.sub': 'Всички предстоящи конвои автоматично импортирани от TruckersMP.',
    'convoy.subscribe': 'Абонирай се за нашия календар',
    'convoy.subscribe.sub': 'Импортирай всички предстоящи конвои на TEXIM ONE директно в календара си. Емисията се обновява автоматично при добавяне на нови събития.',
    'convoy.download': 'Изтегли .ics файл',
    'convoy.google': 'Добави в Google Календар',
    'convoy.webcal': 'Абонирай се (webcal)',
    'convoy.calendar': 'Календар на TEXIM ONE',
    'convoy.calendar.sub': 'Нашият пълен календар за събития, задвижван от Sesh. Винаги актуален.',
    'convoy.calendar.title': 'Календар на конвоите',
    'convoy.calendar.add': 'Добави твой конвой',
    'convoy.calendar.loading': 'Зареждане на конвои...',
    'convoy.open': 'Отвори календара в нов раздел',
    'convoy.upcoming': 'Предстоящи конвои',
    'convoy.upcoming.sub': 'Актуални събития от нашия TruckersMP профил. Обновяват се автоматично.',
    'convoy.loading': 'Зареждане на предстоящите конвои...',
    'convoy.none': 'В момента няма предстоящи конвои. Провери отново скоро!',
    'convoy.error': 'В момента не могат да се заредят конвоите. Моля, опитай отново по-късно.',
    'convoy.view': 'Виж събитието',
    'convoy.meet': 'Сборен пункт',

    // Contact page
    'contact.title': 'Покани',
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
    'contact.declinedTitle': 'Автоматично отказана: конфликт в датата',
    'contact.declinedText': 'Вече имаме конвой на TEXIM ONE на тази дата, затова поканата е автоматично отказана. Ще ти пишем в Discord за потвърждение.',
    'contact.again': 'Изпрати друга',

    // Add-to-calendar page
    'addconvoy.title': 'Добави конвой в календара',
    'addconvoy.sub': 'Прегледай поканата и потвърди, за да я добавиш в календара на TEXIM ONE.',
    'addconvoy.name': 'Име на конвоя',
    'addconvoy.date': 'Дата',
    'addconvoy.time': 'Начален час (UTC)',
    'addconvoy.discord': 'Поканен от (Discord)',
    'addconvoy.link': 'Линк',
    'addconvoy.details': 'Подробности',
    'addconvoy.confirm': 'Добави в календара',
    'addconvoy.cancel': 'Отказ',
    'addconvoy.successTitle': 'Добавено в календара!',
    'addconvoy.successText': 'Този конвой вече е в календара на TEXIM ONE.',
    'addconvoy.viewCalendar': 'Виж календара',

    // Language modal
    'nav.media': 'Медия',
    'stat.discord': 'Членове в Discord',
    'media.title': 'Медия',
    'about.achievements': 'Нашите постижения',
    'about.achievements.text': 'Се гордеем с постиженията, които ни отличават като иноватори в българската общност, благодарение на нашето нестандартно и разчупено мислене. В резултат на това можем да се похвалим като първата и единствена валидирана българска фирма в TruckersMP за онова време, първата и единствена българска фирма с Twitch Team, както и първата и единствена българска фирма с официален Merch.',
    'media.twitch': 'Twitch отбор',
    'media.twitch.text': 'Разполагаме с официален TruckersMP Twitch отбор, където излъчваме нашите конвои и моменти от общността на живо.',
    'media.news': 'Новини от TruckersMP',
    'media.news.text': 'Публикации и новини, които споделяме в нашия официален профил в TruckersMP.',
    'media.news.69793.title': 'TEXIM ONE THE ORIGINAL™ MONTHLY CONVOY #6',
    'media.news.69793.text': 'На 8 август 2026 г. участвахме в THE ORIGINAL Monthly Convoy #6 — около 600 км от Сегед (Унгария) до Банска Бистрица (Словакия) в Event Server.',
    'media.news.69383.title': 'TEXIM ONE Nova Group | Public Convoy #3',
    'media.news.69383.text': 'На 25 юли 2026 г. се включихме в Nova Group | Public Convoy #3 — около 900 км от Осло до Кристиансанд (Норвегия) в Simulation 2.',
    'media.news.68663.title': 'MERCH от TEXIM ONE Vtc x TEXIM ONE Ltd!',
    'media.news.68663.text': 'Официалната ни merch колаборация с TEXIM ONE Ltd — плътен 100% пениран памук (230 g/m²), Oversize кройки в бяло, черно, Bone и Midnight Navy, с бродирано T1 лого. Поръчките стават чрез тикет в Discord.',
    'media.news.68060.title': 'TEXIM ONE 57. Monthly RSL-Event | May',
    'media.news.68060.text': 'На 27 май 2026 г. участвахме в 57-ото Monthly RSL-Event с United Convoys — около 1000 км от Кълъраш до Клуж-Напока (Румъния) в Event Server.',
    'media.news.67722.title': 'Седмична активност - петъчен обществен конвой',
    'media.news.67722.text': 'Всеки петък се събираме за свободен обществен конвой в Simulation 1 — без фиксиран маршрут и минимален брой участници, а всяко събиране носи 10 000 RP чрез Reputation System.',
    'media.news.67670.title': 'Обновление на Reputation System (RS)',
    'media.news.67670.text': 'Reputation System получава демократично обновление: всяко фирмено решение вече се решава чрез претеглен вот, където 1 ниво = 1 глас. Влиянието зависи изцяло от активността ти.',
    'media.news.67599.title': 'Евровизия 2026 - Bangaranga 🇧🇬',
    'media.news.67599.text': 'Обръщение към историческата победа на Дара на Евровизия 2026 — съмнението, превърнато в гориво, и първият трофей за България.',
    'media.news.67582.title': 'TEXIM ONE Pink Ribbon VTC – 4-та годишнина',
    'media.news.67582.text': 'На 15 май 2026 г. участвахме в конвоя за 4-тата годишнина на Pink Ribbon VTC с United Convoys — около 1200 км от TruckersMP HQ (Полша) до Хамбург (Германия).',
    'media.news.67539.title': 'Обновление на фирмената идентичност',
    'media.news.67539.text': 'Нов облик за версия 1.59: VNL 2025 в ATS, обновеният FH6 Aero с Kässbohrer K.SCX X+ в ETS2, лого с фокус върху T1, бял TMP таг и без задължително [BG] в псевдонимите.',
    'media.news.67529.title': 'TrucksBook Bulgaria - сертификати',
    'media.news.67529.text': 'TrucksBook Bulgaria отличи общността ни с тринадесет сертификата — пет фирмени за 2019–2025 г. и осем лични, а Marvinito беше повишен в Мениджър.',
    'media.news.67416.title': 'Честит 9 май!',
    'media.news.67416.text': 'Отбелязваме Деня на Европа и триумфа над нацистка Германия — размисъл за историята, суверенитета и мястото на България в европейското семейство.',
    'media.news.65805.title': 'Система за репутация (RS)',
    'media.news.65805.text': 'Нашата официална система за признание и авторитет, която ранжира всеки шофьор и награждава активността с рангове от Newbie до Champion.',
    'media.news.65704.title': 'TEXIM ONE Pink Ribbon VTC – мартенски конвой',
    'media.news.65704.text': 'На 13 март 2026 г. участвахме в мартенския конвой на Pink Ribbon VTC с United Convoys — около 800 км от Неапол до Флоренция (Италия) в Event Server.',
    'media.news.58783.title': 'Фирмена идентичност',
    'media.news.58783.text': 'Пълното ръководство за фирмената ни идентичност — характерната композиция Volvo + Kässbohrer, TruckersMP тагът, аватарът и правилата за имена, които ни правят разпознаваеми на пътя.',
    'media.news.read': 'Прочети в TruckersMP',
    'media.sub': 'Нашата история, нашите моменти, нашата общност.',
    'media.twitch.btn': 'Гледай в Twitch',
    'gallery.title': 'Галерия',
    'convoy.inviteTitle': 'Покани ни на твой конвой',
    'convoy.inviteSub': 'Попълни формуляра по-долу и ще изпратим поканата ти до нашия Discord канал.',
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
