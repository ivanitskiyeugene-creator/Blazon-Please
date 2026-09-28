export interface ChangeEntry {
  version: string;
  date: { ru: string; en: string };
  tag: { ru: string; en: string };
  tone: string;
  items: { ru: string[]; en: string[] };
}

export const APP_VERSION = "0.9.0";

export const CHANGELOG: ChangeEntry[] = [
  {
    version: "0.9.0",
    date: { ru: "эпоха блоков и геральдики", en: "the era of blocs & heraldry" },
    tag: { ru: "НОВЫЕ СТРАНЫ, ГЕРБЫ И ТАЛОНЫ", en: "NEW NATIONS, EMBLEMS & TALONS" },
    tone: "#e8c34a",
    items: {
      ru: [
        "8 государств вселенной Avalon Project: АССР, Народная Республика Аргестан, Королевство Отеплия (MAWU), Республика Горностан (Брунь), Республика Остоляндия (Порт-Артур), Соединённые Штаты Виктерии (USV), Ондарская Народная Республика (СНС) и Республика Балтелия.",
        "Механика подделки гербов зарубежных стран: проверка ориентации молота Горностана, числа волн и звёзд Остоляндии, молний и звёзд орла Виктерии, лучей солнца Ондара, лучей маяка Балтелии и меча Отеплии.",
        "Интерактивный «Справочник гербов и символов» в книжке инспектора: сверка эталонов и выявление признаков фальсификата с возможностью доказательства нарушения.",
        "Новые документы: транзитные талоны EASA, пайковые талоны АССР, декларации микроэлектроники ACPS и удостоверения ветеранов Великой Аргелийской войны (1938–1947).",
        "Мобильная адаптация: сенсорные быстрые действия, переключение вкладок «Будка / Стол / Свод», выдвижные штампы и отзывчивая раскладка.",
      ],
      en: [
        "8 sovereign nations of the Avalon Project lore: ASSR, People's Republic of Argestan, Kingdom of Oteplia (MAWU), Republic of Gornostan (Brun), Republic of Ostolandia (Port-Arthur), United States of Victeria (USV), Ondar People's Republic (SNS), and Republic of Baltelia.",
        "Counterfeit foreign coat of arms mechanics: inspect Gornostan's hammer direction, Ostolandia's waves and stars, Victeria's eagle talons and stars, Ondar's sun rays, Baltelia's lighthouse beams, and Oteplia's sword hand.",
        "Interactive «Emblems & Crests Reference Guide» in the Inspector Rulebook: compare genuine standards against known counterfeit flaws to prove violations.",
        "New documents: EASA transit vouchers, ASSR ration coupons, ACPS tech clearance declarations, and Great Argelian War (1938–1947) veteran certificates.",
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
