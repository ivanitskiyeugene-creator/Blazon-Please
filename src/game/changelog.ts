export interface ChangeEntry {
  version: string;
  date: { ru: string; en: string };
  tag: { ru: string; en: string };
  tone: string;
  items: { ru: string[]; en: string[] };
}

export const APP_VERSION = "0.9.3";

export const CHANGELOG: ChangeEntry[] = [
  {
    version: "0.9.3",
    date: { ru: "Комиссар и протоколы", en: "The Commissar & citations" },
    tag: { ru: "ОСОБЫЙ ОТДЕЛ НА ПОСТУ", en: "SPECIAL DEPARTMENT AT THE POST" },
    tone: "#c0392b",
    items: {
      ru: [
        "На пост периодически наведывается комиссар Особого отдела: он не показывает паспорт, а допрашивает инспектора об агентах — с кем вы имели дело, западный ли атташе или сосед-лодочник, — и предлагает кого-нибудь сдать.",
        "Штрафы теперь выписываются почти сразу: через пару секунд после ошибки из окна выезжает протокол. Первые два протокола за смену — предупреждение без штрафа, дальше каждый стоит денег.",
        "Экономика затянута под послевоенный дефицит: ставка за штамп и премии за улики и задержания урезаны (PER_PAY 5→2, улики 2→1, задержание 8→4), а суточные расходы оставлены высокими — денег теперь еле хватает, и взятки агентов становятся настоящим соблазном.",
      ],
      en: [
        "A Special Department commissar drops by the post from time to time: he shows no passport but interrogates the inspector about the agents — whom you dealt with, the western attaché or the boatman neighbour — and offers you someone to hand over.",
        "Fines are now issued almost immediately: a citation slides out of the window a couple of seconds after a mistake. The first two citations of a shift are warnings with no fine; after that each one costs money.",
        "Economy tightened for post-war scarcity: the per-stamp rate and the evidence/detention bonuses were cut (PER_PAY 5→2, evidence 2→1, detention 8→4) while daily expenses stay high — money is barely enough now, making agent bribes a real temptation.",
      ],
    },
  },
  {
    version: "0.9.2",
    date: { ru: "Ондар за рубежом", en: "Ondar abroad" },
    tag: { ru: "ПАСПОРТ ОНДАРА ВОЗВРАЩЁН", en: "ONDAR PASSPORT RESTORED" },
    tone: "#d2aa38",
    items: {
      ru: [
        "Ондар в списке союзных республик статьи АССР отсутствует, поэтому он снова считается суверенным иностранным государством, а не частью Союза.",
        "Ондарская Народная Республика опять выдаёт собственный паспорт со своим гербом-солнцем (7 лучей; подделка — 5 лучей) и требует разрешение на въезд, как прочие иностранцы.",
        "Ондар убран из мест выдачи единого паспорта АССР; на границе он появляется с 4-й смены среди иностранных гостей, а его герб добавлен в справочник и в проверку подделок.",
      ],
      en: [
        "Ondar is absent from the ASSR article's list of union republics, so it is once again treated as a sovereign foreign state rather than part of the Union.",
        "The Ondar People's Republic issues its own passport again, with its sun emblem (7 rays; forgery — 5 rays) and an entry permit requirement like other foreigners.",
        "Ondar was removed from the ASSR unified-passport places of issue; it appears at the border from shift 4 among foreign guests, and its emblem is back in the reference guide and forgery checks.",
      ],
    },
  },
  {
    version: "0.9.1",
    date: { ru: "канон октября 1951-го", en: "the canon of October 1951" },
    tag: { ru: "КРАСНОСЛАВИЯ ВОЗВРАЩЕНА", en: "KRASNOSLAVIA RESTORED" },
    tone: "#d2aa38",
    items: {
      ru: [
        "Краснославия вернулась в очередь и справочник гербов. Богдан Тихий снова приезжает с краснославским паспортом, а западного атташе во всех документах и финалах зовут Эдвард Коул.",
        "Аргестан, Гартелия, Горностан, Балтелия, Остоляндия и Ондар больше не выдают отдельные иностранные паспорта: в 1951 году это части АССР. Их граждане предъявляют единый паспорт АССР, где республика указана только как место выдачи.",
        "Кампания очищена от анахронизмов: EASA образован только в 2007 году, поэтому его талоны, блок MAWU, ACPS и рельсотроны убраны из 1951-го. Новые документы сохранены как талоны Минпропа и грузовые декларации эпохи радиоламп.",
        "Послевоенная Отеплия теперь показана разделённой оккупационной зоной, как на вики; даты ВАВ закреплены как 1938–1947, существование АССР — 1931–1995.",
        "Исправлены правила смен: для каждого возможного нарушения снова есть действующая строка директивы; при полном запрете на въезд иностранец больше не может быть ошибочно помечен как чистый, а первый посетитель смены гарантированно соответствует правилам.",
      ],
      en: [
        "Krasnoslavia is back in the queue and emblem guide. Bohdan Tikhiy once again carries a Krasnoslavian passport, while the western attaché is consistently named Edward Cole in documents and endings.",
        "Argestan, Gartelia, Gornostan, Baltelia, Ostolandia and Ondar no longer issue separate foreign passports: in 1951 they are parts of the ASSR. Their citizens carry one ASSR passport, with the republic shown only as the place of issue.",
        "The campaign has been cleared of anachronisms: EASA was not founded until 2007, so its talons, the MAWU bloc, ACPS and railguns were removed from 1951. The new paperwork remains as Ministry talons and radio-era cargo declarations.",
        "Post-war Oteplia is now shown as a divided occupation zone as documented by the wiki; the GAW dates are fixed at 1938–1947 and the ASSR at 1931–1995.",
        "Shift directives were reconciled with generation: every possible violation once again has an active rule; a foreigner cannot be marked clean while a total entry ban is in force, and each shift's first entrant is guaranteed to satisfy the rules.",
      ],
    },
  },
  {
    version: "0.9.0",
    date: { ru: "эпоха блоков и геральдики", en: "the era of blocs & heraldry" },
    tag: { ru: "НОВЫЕ СТРАНЫ, ГЕРБЫ И ТАЛОНЫ", en: "NEW NATIONS, EMBLEMS & TALONS" },
    tone: "#e8c34a",
    items: {
      ru: [
        "В 0.9.0 Аргестан, Горностан, Остоляндия, Ондар и Балтелия были ошибочно представлены отдельными паспортными государствами. Эта ошибка исправлена в 0.9.1: в 1951 году они находятся внутри АССР.",
        "Подделки гербов были привязаны к ошибочному набору паспортов; в 0.9.1 их заменили гербы восстановленных независимых эмитентов.",
        "Интерактивный «Справочник гербов и символов» в книжке инспектора: сверка эталонов и выявление признаков фальсификата с возможностью доказательства нарушения.",
        "В 0.9.0 появились талоны EASA и декларации ACPS; 0.9.1 сохраняет механику документов, но заменяет анахронизмы формами Министерства Пропусков и грузовыми декларациями 1951 года.",
        "Мобильная адаптация: сенсорные быстрые действия, переключение вкладок «Будка / Стол / Свод», выдвижные штампы и отзывчивая раскладка.",
      ],
      en: [
        "Version 0.9.0 mistakenly presented Argestan, Gornostan, Ostolandia, Ondar and Baltelia as separate passport states. Version 0.9.1 corrects this: in 1951 they are inside the ASSR.",
        "Emblem forgeries were tied to the incorrect passport set; 0.9.1 replaces them with emblems of the restored independent issuers.",
        "Interactive «Emblems & Crests Reference Guide» in the Inspector Rulebook: compare genuine standards against known counterfeit flaws to prove violations.",
        "Version 0.9.0 introduced EASA talons and ACPS declarations; 0.9.1 keeps the document mechanics but replaces the anachronisms with Ministry of Passes forms and 1951 cargo declarations.",
        "Mobile viewport optimization: touch quick-action bars, responsive Booth / Desk / Rules tabs, expandable stamps, and ergonomic desk layouts.",
      ],
    },
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
        "Паспорт всегда возвращается посетителю: проверил, шлёпнул печать, нажал «ОТДАТЬ» — только тогда шлагбаум открывается или захлопывается.",
        "У каждого посетителя в очереди теперь свой паспорт со своим гербом, серией и датами — всё генерируется заново каждую смену.",
        "На лотке лежат сразу все бумаги: паспорт, пропуск, партийный билет. Бери по одной или все сразу.",
      ],
      en: [
        "The passport is always returned to the visitor: inspect, slam the stamp, press «RETURN» — only then does the barrier raise or drop.",
        "Every visitor in the queue now has their own passport with their own emblem, serial and dates — generated anew each shift.",
        "All papers lie on the tray together: passport, permit, party card. Take one at a time or all at once.",
      ],
    },
  },
];
