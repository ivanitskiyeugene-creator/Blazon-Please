export interface ChangeEntry {
  version: string;
  date: { ru: string; en: string };
  tag: { ru: string; en: string };
  tone: string;
  items: { ru: string[]; en: string[] };
}

export const APP_VERSION = "1.3.0";

export const CHANGELOG: ChangeEntry[] = [
  {
    version: "1.3.0", date: { ru: "слово и печать", en: "word and seal" }, tag: { ru: "ОСОБЫЙ ПОРЯДОК", en: "SPECIAL PROCEDURE" }, tone: "#c33a2b",
    items: { ru: ["Устные цель и срок визита печатаются на физической ленте допроса.", "Дипломатические разрешения, вакцинация, убежище и личные посетители.", "Конфискация паспортов через отдельный металлический ящик.", "Вооружённое нападение переводит игру в вид сверху: возьми табельное оружие и останови нападающего."], en: ["Stated purpose and duration print on a physical interview strip.", "Diplomatic authorizations, vaccination, asylum and personal visitors.", "Passport confiscation through a dedicated metal box.", "An armed attack switches to top view: take the service weapon and stop the attacker."] },
  },
  {
    version: "1.2.0", date: { ru: "расширенная граница", en: "expanded border" }, tag: { ru: "ТЫСЯЧИ ЛИЦ", en: "THOUSANDS OF FACES" }, tone: "#e8c34a",
    items: { ru: ["Физические приборы досмотра, база розыска, отпечатки и измеритель.", "Больше имён, фамилий, внешностей и гендерных диалогов.", "Новые конфликты дат, печатей и маршрутов.", "Процедурные пятна кофе, чернил, жира, пальцев и сгибы на документах."], en: ["Physical search devices, wanted database, fingerprints and measuring station.", "More names, surnames, appearances and gendered dialogue.", "New date, seal and route conflicts.", "Procedural coffee, ink, grease, fingerprint and fold marks on documents."] },
  },
  {
    version: "1.0.0", date: { ru: "полная служба", en: "full service" }, tag: { ru: "ГРАНИЦА ЖИВЁТ", en: "THE BORDER LIVES" }, tone: "#e8c34a",
    items: { ru: ["Доска розыска и сравнение лиц.", "Обыск, контрабанда, отпечатки, рост и вес.", "Причина отказа обязательна; штрафы приходят мгновенно.", "Вооружённые нападения и расширенные решения о нуждах семьи.", "Раздельные мужские и женские реплики, даты выдачи и шесть новых видов несоответствий.", "Расширены имена, фамилии и внешности; документы получают процедурные следы кофе, чернил, пальцев, жира и сгибов."], en: ["Wanted board and facial matching.", "Searches, contraband, fingerprints, height and weight.", "Denials require evidence; citations arrive immediately.", "Armed attacks and deeper family-needs decisions.", "Separate male and female dialogue, issue dates, and six new mismatch types.", "Expanded names, surnames and appearances; documents receive procedural coffee, ink, fingerprint, grease and fold marks."] },
  },
  {
    version: "0.9.2",
    date: { ru: "29 сентября 2026", en: "September 29, 2026" },
    tag: { ru: "ПРИКАЗ КОМИССАРА", en: "COMMISSAR'S ORDER" },
    tone: "#a12622",
    items: { ru: ["Справки с работы и транзитные декларации с новыми нарушениями.", "Редкие события очереди и визиты комиссара Краснограда с 45-секундным контролем.", "Раздельная громкость музыки и эффектов."], en: ["Employment certificates and transit declarations with new violations.", "Rare queue events and Commissar Krasnograd visits with a 45-second inspection timer.", "Separate music and effects volume controls."] },
  },
  {
    version: "0.8.0",
    date: { ru: "кассета на столе", en: "the cassette on the desk" },
    tag: { ru: "ПРИКРУЧЕНО К СТОЛУ", en: "BOLTED TO THE DESK" },
    tone: "#d2aa38",
    items: {
      ru: [
        "Штампы «ОТКАЗ»/«АРЕСТ» и «ВХОД» съезжаются к середине стола, когда кассета вызвана рычагом; убрал — стол пуст.",
        "Половины кассеты выезжают из-за краёв самого стола, а не из-за края экрана, неся длинные балки от края стола до середины; сомкнутая балка встаёт сплошной линией через весь стол и стоит на ножках, шов закрыт болтовой накладкой.",
        "Рычаг прикручен к правому краю столешницы и всегда под рукой.",
        "«АРЕСТ» вынесен из кассеты в красную кнопку тревоги в шапке смены: доказал нарушение — кнопка взводится сама; удар — и створка будки захлопывается железным занавесом, документы уходят в протокол.",
        "Документы выкладываются на стол ниже кассеты, чтобы машины не заслоняли бумаги.",
      ],
      en: [
        "The DENY and ADMIT stamps converge at the middle of the desk when the cassette is summoned by the lever; put away — the desk is empty.",
        "The cassette halves ride out from behind the desk's own edges, not the screen's, carrying long beams from the desk edge to the middle; joined, the beam stands as one solid line across the whole desk on bolted feet, the seam covered by a splice plate.",
        "The lever is bolted to the right edge of the desktop, always within reach.",
        "«DETAIN» moved out of the cassette into a red alarm button in the shift header: prove a mismatch and the button arms itself; hit it — the booth flap slams shut with an iron curtain and the documents go into the protocol.",
        "Documents are laid out on the desk below the cassette so the machines never cover the papers.",
      ],
    },
  },
  {
    version: "0.7.0",
    date: { ru: "приказ на двух языках", en: "a bilingual order" },
    tag: { ru: "ЯЗЫК ПОСТА", en: "LANGUAGE OF THE POST" },
    tone: "#d2aa38",
    items: {
      ru: [
        "Полный английский перевод игры и переключатель РУС/ENG в меню и на смене; язык запоминается.",
        "Логотип и заголовки набираются шрифтом Agit Prop, документы и интерфейс — Bitmap Mania mini; для кириллицы эти шрифты автоматически сменяются PixelPlay.",
        "Штемпельная кассета пересобрана: машины жёстко прикручены к толстой несущей балке (в ширину самого штампа), и в центр съезжаются вместе с балкой.",
        "CRT/LCD-развёртка и рамка с экрана сняты — текст читается как с чистой бумаги.",
      ],
      en: [
        "Full English translation with a RU/ENG switch in the menu and during the shift; the choice is remembered.",
        "The logo and headlines are set in Agit Prop, documents and UI in Bitmap Mania mini; for Cyrillic both fonts fall back to PixelPlay automatically.",
        "The stamp cassette rebuilt: the machines are bolted rigidly to a thick load beam (as wide as the stamp itself) and converge at the center together with the beam.",
        "The CRT/LCD scanlines and frame are gone from the screen — the text reads like clean paper.",
      ],
    },
  },
  {
    version: "0.6.5",
    date: { ru: "центр экрана", en: "dead center" },
    tag: { ru: "БУКВАЛЬНО ПО ЦЕНТРУ", en: "DEAD CENTER" },
    tone: "#d2aa38",
    items: {
      ru: [
        "Промышленная балка и штамповые машины теперь стоят ровно на середине экрана — по центру буквально, и по горизонтали, и по вертикали.",
        "Балка протянута через весь экран от края до края, машины въезжают по ней с боков и смыкаются в центре.",
      ],
      en: [
        "The industrial beam and the stamp machines now sit exactly at the middle of the screen — literally centered, both horizontally and vertically.",
        "The beam ran edge to edge across the screen; the machines rode in from the sides and met in the center.",
      ],
    },
  },
  {
    version: "0.6.4",
    date: { ru: "промышленная балка", en: "industrial beam" },
    tag: { ru: "ПО БАЛКЕ — В ЦЕНТР", en: "ALONG THE BEAM" },
    tone: "#d2aa38",
    items: {
      ru: [
        "Через весь пост протянута несущая промышленная балка с болтами и заводской табличкой — она видна всегда.",
        "Штамповые машины въезжают по балке с двух боков поста и смыкаются в одну линию точно по центру экрана; при закрытии разъезжаются обратно.",
        "Каждая группа машин едет на своей каретке, зажатой на балке.",
        "Печать всегда ложится в паспорт — точка удара лишь сдвигает отметку.",
      ],
      en: [
        "A load-bearing industrial beam with bolts and a factory plate ran across the whole post — always visible.",
        "The stamp machines rode along the beam from both sides of the post and closed into one line exactly at the center of the screen; they rolled back apart when closed.",
        "Each group of machines rode its own carriage clamped to the beam.",
        "The stamp always lands in the passport — the strike point only shifts the mark.",
      ],
    },
  },
  {
    version: "0.6.3",
    date: { ru: "пиксельная инвентаризация", en: "pixel inventory" },
    tag: { ru: "НИ ОДНОЙ КРИВОЙ", en: "NOT A SINGLE CURVE" },
    tone: "#d2aa38",
    items: {
      ru: [
        "Все интерфейсные значки заменены ручными bitmap-глифами 12×12; библиотека гладких векторных иконок удалена.",
        "Гербы АССР, КПТА и соседних стран теперь рисуются напрямую в пиксельный canvas 32×32.",
        "Лампа, телефон, чай, трубы, батарея и портрет в будке пересобраны из квадратных пиксельных блоков.",
        "Корпуса штампов переведены из SVG в растровую пиксельную отрисовку без сглаживания.",
        "Штемпельная кассета — одна, все машины рядом, опускается ровно по центру экрана.",
        "Фоновые плитки металла, бумаги, стола и стены стали настоящими bitmap-текстурами.",
        "Windows-версия открывается на весь экран; F11 переключает полноэкранный режим.",
      ],
      en: [
        "All interface icons replaced with hand-drawn 12×12 bitmap glyphs; the smooth vector icon library was removed.",
        "The ASSR, CPTA and neighboring countries' emblems are now drawn directly into a 32×32 pixel canvas.",
        "The lamp, telephone, tea, pipes, battery and portrait in the booth were rebuilt from square pixel blocks.",
        "The stamp bodies moved from SVG to raster pixel rendering without smoothing.",
        "One stamp cassette, all machines side by side, lowered exactly at the center of the screen.",
        "The metal, paper, desk and wall background tiles became real bitmap textures.",
        "The Windows version opens fullscreen; F11 toggles fullscreen mode.",
      ],
    },
  },
  {
    version: "0.6.2",
    date: { ru: "пересменка у стекла", en: "shift change at the glass" },
    tag: { ru: "ПАСПОРТ ВОЗВРАЩЁН", en: "PASSPORT RETURNED" },
    tone: "#b88f70",
    items: {
      ru: [
        "Посетители перерисованы вручную как настоящие bitmap-спрайты 48×60 без генератора и сглаживания.",
        "Штемпельные механизмы собраны в одну центральную металлическую кассету.",
        "Возврат паспорта исправлен: на документе есть кнопка «ОТДАТЬ», а в лотке — возврат всех документов.",
        "Решение по штампу фиксируется ровно один раз после передачи документов посетителю.",
      ],
      en: [
        "Visitors redrawn by hand as true 48×60 bitmap sprites, with no generator and no smoothing.",
        "The stamping mechanisms were assembled into one central metal cassette.",
        "Passport return fixed: the document has a «RETURN» button, and the tray has a return-all button.",
        "The stamp decision is now recorded exactly once, after the documents are handed back to the visitor.",
      ],
    },
  },
  {
    version: "0.6.1",
    date: { ru: "ремонт штемпельной", en: "stamp shop repairs" },
    tag: { ru: "КАССЕТЫ ВЫДВИНУТЫ", en: "CASSETTES DEPLOYED" },
    tone: "#c7bfa0",
    items: {
      ru: [
        "Титульный плакат заменён; прежний арт сохранён на экране финала.",
        "Подключён кириллический PixelPlay — один из оригинальных шрифтов Papers, Please.",
        "Паспорт и остальные документы теперь можно убрать со стола обратно в лоток.",
        "У рычага удлинена железная рукоять.",
        "Штампы закреплены в металлических кассетах и выезжают с левой и правой сторон стола.",
      ],
      en: [
        "The title poster replaced; the old art kept on the ending screen.",
        "Cyrillic PixelPlay connected — one of the original Papers, Please fonts.",
        "The passport and other documents can now be taken off the desk back into the tray.",
        "The lever got a longer iron handle.",
        "The stamps were fixed in metal cassettes and slid out from the left and right sides of the desk.",
      ],
    },
  },
  {
    version: "0.6.0",
    date: { ru: "приказ типографии", en: "print shop order" },
    tag: { ru: "СУРОВЫЙ ПИКСЕЛЬ", en: "HARSH PIXELS" },
    tone: "#d2aa38",
    items: {
      ru: [
        "Интерфейс, документы, эмблемы, будка и рабочий стол переведены на грубую 16-битную палитру без мягких теней и глянца.",
        "Новый оригинальный пиксельный плакат: КПП-7 смотрит на послевоенный атомный комплекс.",
        "Убраны цветные эмодзи — служебные предметы получили единые пиксельные обозначения.",
        "Название АССР приведено к канону Avalon Project: Аргелийский Союз Социалистических Республик.",
        "Windows-версия переведена на Tauri 2; сборка EXE запускается только вручную по приказу.",
      ],
      en: [
        "The UI, documents, emblems, booth and desk moved to a rough 16-bit palette with no soft shadows or gloss.",
        "A new original pixel poster: CP-7 looking at the post-war atomic complex.",
        "Colored emoji removed — duty items got unified pixel marks.",
        "The ASSR name aligned with the Avalon Project canon: the Argelian Union of Socialist Republics.",
        "The Windows version moved to Tauri 2; the EXE build runs only manually, on order.",
      ],
    },
  },
  {
    version: "0.5.0",
    date: { ru: "смена шестая", en: "the sixth shift" },
    tag: { ru: "СЮЖЕТ И ГЕНЕРАЦИЯ", en: "STORY AND GENERATION" },
    tone: "#e8c34a",
    items: {
      ru: [
        "Процедурная генерация очереди: имена, лица, страны, документы и нарушения создаются заново каждую игру по зерну смены.",
        "Сюжетная линия: два постоянных гостя — западный атташе ЭДВАРД КОУЛ и сосед из Краснославии БОГДАН ТИХИЙ. Оба вербуют инспектора всю службу.",
        "Три концовки: «Высший инспектор» (лояльность), «Цена списка» (Запад предаёт и казнь), «За рекой» (побег к соседям без права вернуться).",
        "Кампания расширена до 6 смен (было 5), финальный выбор — в последний день.",
        "Сохранение прогресса в браузере: «Продолжить смену» в главном меню.",
        "Выход в главное меню прямо со смены, вкладка «Изменения» в меню.",
      ],
      en: [
        "Procedural queue generation: names, faces, countries, documents and violations are created anew each game from the shift's seed.",
        "Story line: two regular guests — the western attaché EDWARD COLE and Bohdan Tikhiy from Krasnoslavia. Both recruit the inspector all service long.",
        "Three endings: «Chief Inspector» (loyalty), «The Price of the List» (the West betrays and executes), «Across the River» (escape to the neighbors with no way back).",
        "The campaign grew to 6 shifts (was 5), with the final choice on the last day.",
        "Browser save: «Continue shift» in the main menu.",
        "Exit to the main menu right from a shift; the «Changelog» tab in the menu.",
      ],
    },
  },
  {
    version: "0.4.0",
    date: { ru: "смена пятая", en: "the fifth shift" },
    tag: { ru: "ДОКУМЕНТООБОРОТ", en: "PAPERWORK" },
    tone: "#7f9059",
    items: {
      ru: [
        "Механика предъявления несоответствий: выдели два противоречащих поля и жми «ПРЕДЪЯВИТЬ».",
        "Перетаскиваемые документы на столе с порядком наложения.",
        "Инвентарь-ящик: директива, справочник гербов, календарь поста.",
        "Задержание теперь требует доказанного нарушения.",
        "Интрига до конца смены: награды и протоколы вскрываются только в вечерней ведомости.",
        "Обжитая кабина: лампа, чай в подстаканнике, телефон, портрет председателя, трубы и батарея.",
        "Журнал поста со списком обработанных посетителей.",
      ],
      en: [
        "The mismatch-presenting mechanic: select two contradicting fields and press «PRESENT».",
        "Draggable documents on the desk with stacking order.",
        "The inventory drawer: the directive, the emblem reference, the post calendar.",
        "Detention now requires a proven violation.",
        "Intrigue until the end of the shift: rewards and protocols are revealed only in the evening ledger.",
        "A lived-in cabin: lamp, tea in the glass holder, telephone, the chairman's portrait, pipes and a battery.",
        "The post journal with the list of processed visitors.",
      ],
    },
  },
  {
    version: "0.3.0",
    date: { ru: "смена четвёртая", en: "the fourth shift" },
    tag: { ru: "БДИТЕЛЬНОСТЬ", en: "VIGILANCE" },
    tone: "#c33a2b",
    items: {
      ru: [
        "Кнопка «ЗАДЕРЖАТЬ» и премия за врагов народа.",
        "Самозванцы: фото в паспорте не совпадает с человеком в окне.",
        "Допрос посетителя и очередь-силуэты за стеклом.",
        "Часы смены и переключатель отопления: экономия ценой простуды в семье.",
      ],
      en: [
        "The «DETAIN» button and a bounty for enemies of the people.",
        "Impostors: the passport photo does not match the person at the window.",
        "Visitor interrogation and silhouette queue behind the glass.",
        "Shift clock and the heating switch: savings at the cost of the family's cold.",
      ],
    },
  },
  {
    version: "0.2.0",
    date: { ru: "смена третья", en: "the third shift" },
    tag: { ru: "ГЕРБЫ", en: "EMBLEMS" },
    tone: "#b98f2e",
    items: {
      ru: [
        "Поддельные гербы АССР: у настоящего атома три орбиты, у фальшивки — две.",
        "Удостоверения КПТА с перевёрнутым серпом и молотом (молот справа).",
        "Взятки, экономика семьи и вечерняя ведомость.",
      ],
      en: [
        "Forged ASSR emblems: the true atom has three orbits, the fake one two.",
        "CPTA certificates with the inverted hammer and sickle (hammer on the right).",
        "Bribes, the family economy and the evening ledger.",
      ],
    },
  },
  {
    version: "0.1.0",
    date: { ru: "смена первая", en: "the first shift" },
    tag: { ru: "ОТКРЫТИЕ ПОСТА", en: "POST OPENED" },
    tone: "#6b5d4e",
    items: {
      ru: [
        "Открыт КПП-7. Паспорта, разрешения на въезд, печати «ПРОПУЩЕН» и «ОТКАЗАНО».",
        "Газета «Голос Атома» и директивы Министерства Пропусков.",
        "CRT-оформление, пиксельные посетители, синтезированные звуки.",
      ],
      en: [
        "CP-7 opened. Passports, entry permits, «APPROVED» and «DENIED» stamps.",
        "The «Voice of the Atom» newspaper and Ministry of Passes directives.",
        "CRT styling, pixel visitors, synthesized sounds.",
      ],
    },
  },
];
