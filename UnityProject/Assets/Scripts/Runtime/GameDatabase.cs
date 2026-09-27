using System.Collections.Generic;

namespace BlazonPlease
{
    public static class GameDatabase
    {
        public const string Version = "0.1.0-unity";
        public const int PayPerCorrect = 5;
        public const int ErrorFine = 3;
        public const int StartCredits = 25;
        public const int DetainBonus = 8;
        public const int EvidenceBonus = 2;

        public static readonly string[] GenericAdmit =
        {
            "Слава Атому.", "Порядок — это атом в сердце.", "Республика благодарит.", "Открытой дороги."
        };

        public static readonly string[] GenericDeny =
        {
            "Как же так...", "Я ещё вернусь. С другими бумагами.", "Очередь вас не простит.", "Протокол порву."
        };

        public static readonly string[] WrongEvidence =
        {
            "И что? Тут всё совпадает, товарищ.",
            "Вы держите меня за дурака? Смотрите внимательнее.",
            "Это одно и то же. Очередь за мной смеётся.",
            "Проверяйте сколько хотите. Бумаги чисты."
        };

        public static readonly string[] SmallTalk =
        {
            "Холодно сегодня. У вас в будке теплее?",
            "Очередь с шести утра стоит. Я тридцатый был.",
            "Быстрее бы. Автобус через час уходит.",
            "Говорят, реактор гудит по ночам. Слышали?",
            "Проверяйте спокойно, товарищ. Я не спешу.",
            "Сын просил магнит привезти. Атомный.",
            "У вас глаза красные. Смена длинная?",
            "В прошлый раз меня три часа держали. Три часа!",
            "Плакаты новые повесили. Красиво.",
            "Не задерживайте, за мной ещё сорок человек.",
            "Пальцы мёрзнут. Печать бы поставили быстрее.",
            "Чай у вас пахнет хорошо. Извините.",
            "Документы в порядке, я проверял трижды.",
            "Сосед говорил, тут строго. Правду говорил?",
            "Раньше без бумажек ходили. Другие времена."
        };

        public static readonly string[] ProbeLines =
        {
            "Документы говорят сами за себя, товарищ.",
            "Я честный человек. Спросите на заводе.",
            "Что именно вас смущает, инспектор?",
            "Разговоры не откроют границу. Или откроют?",
            "Спрашивайте. Мне скрывать нечего.",
            "Опять допрос. В прошлый раз тоже допрашивали.",
            "Вы бы людей пропускали, а не расспрашивали.",
            "Я весь как на ладони, гражданин инспектор."
        };

        public static readonly string[] Purposes =
        {
            "ТУРИЗМ", "РАБОТА", "ТОРГОВЛЯ", "ТРАНЗИТ", "ВИЗИТ К РОДНЫМ", "УЧЁБА", "КОНФЕРЕНЦИЯ", "ЛЕЧЕНИЕ"
        };

        public static readonly string[] Durations =
        {
            "2 НЕДЕЛИ", "30 ДНЕЙ", "3 МЕСЯЦА", "6 МЕСЯЦЕВ", "1 ГОД"
        };

        public static readonly string[] PartyRanks =
        {
            "СЕКРЕТАРЬ ЯЧЕЙКИ КПТА", "ИНСТРУКТОР КПТА", "КОМИССАР ОКРУГА КПТА", "АГИТАТОР КПТА", "ЧЛЕН БЮРО КПТА"
        };

        private const string R1 = "Граждан АССР — пропускать. Герб паспорта: атом с ТРЕМЯ орбитами.";
        private const string R2 = "Иностранцы — только с действительным разрешением. Имя и № — как в паспорте.";
        private const string R2X = "Иностранцам въезд запрещён.";
        private const string R3 = "Просроченный паспорт — отказ. Для всех.";
        private const string R4 = "Гражданам ОТЕПЛИИ — отказ всегда. Разрешения не действуют.";
        private const string R5 = "Серийный № разрешения должен совпадать с № паспорта.";
        private const string R6 = "Подделка: настоящий герб АССР имеет 3 орбиты. Две орбиты — вражеская типография.";
        private const string R7 = "Карточка КПТА: настоящий герб — молот СПРАВА. Классический серп и молот — подделка.";
        private const string R8 = "Задержание работает только с ДОКАЗАННЫМ несоответствием. Враг народа: +8 ₳.";
        private const string R9 = "Сверяй лицо и пол: ФОТО в паспорте должно совпадать с человеком в окне.";
        private const string RX = "НЕСООТВЕТСТВИЯ: выдели два противоречащих поля и нажми «ПРЕДЪЯВИТЬ». +2 ₳.";

        public static readonly List<DayConfig> Days = new List<DayConfig>
        {
            Day(
                1, "12 ОКТЯБРЯ, ГОД 51-Й", "12.10.51",
                "ГРАНИЦА ОТКРЫТА. АТОМ НЕ СПИТ.",
                "Министерство Пропусков назначает инспектора // КПП-7",
                "Трудящийся! Тебе доверен пост №7 — ворота Аргелийской Республики. Пропускай своих. Преграждай путь чужим. Герб с атомом — пропуск в будущее. Партия помнит каждого.",
                new List<RuleData> { Rule("r1", R1, true), Rule("r2x", R2X, true) },
                Expenses(false), 7,
                Violations(ViolationKind.ForeignNoPermit)),
            Day(
                2, "13 ОКТЯБРЯ, ГОД 51-Й", "13.10.51",
                "ИНОСТРАНЦЫ — ПО РАЗРЕШЕНИЮ",
                "Новая директива Министерства // очередь у КПП-7 удвоилась",
                "С сегодняшнего дня гости дружественных стран могут войти — если их бумаги безупречны. Просроченный паспорт превращает гражданина в никого. Сверяй даты с календарём поста.",
                new List<RuleData> { Rule("r1", R1), Rule("r2", R2, true), Rule("r3", R3, true), Rule("rX", RX, true) },
                Expenses(false), 8,
                Violations(ViolationKind.ForeignNoPermit, ViolationKind.PassportExpired, ViolationKind.PermitExpired, ViolationKind.NameMismatch)),
            Day(
                3, "14 ОКТЯБРЯ, ГОД 51-Й", "14.10.51",
                "ЗАПАДНЫЙ СОЮЗ — ПЕРСОНА НОН ГРАТА",
                "Диверсия у реактора №3 // комиссары усиливают контроль",
                "Ночью агенты Отеплии пытались остановить сердце республики. Атом устоял. Двери для Королевства Отеплия закрыты. Особое внимание — поддельным гербам: у вражеской типографии всего две орбиты.",
                new List<RuleData> { Rule("r1", R1), Rule("r2", R2), Rule("r4", R4, true), Rule("r5", R5, true), Rule("r6", R6, true), Rule("r8", R8, true) },
                Expenses(true), 9,
                Violations(ViolationKind.ForeignNoPermit, ViolationKind.PassportExpired, ViolationKind.PermitExpired, ViolationKind.NameMismatch, ViolationKind.IdMismatch, ViolationKind.WestBanned, ViolationKind.FakeAtom)),
            Day(
                4, "15 ОКТЯБРЯ, ГОД 51-Й", "15.10.51",
                "КАРТОЧКА ПАРТИИ — ЛИЦО ПАРТИИ",
                "КПТА предупреждает: враги печатают фальшивые удостоверения",
                "Герб Партии священен и перевёрнут: молот — справа, серп тянется влево. Кто покажет классический знак — самозванец из чужой типографии. И сверяй лица: фото не лжёт, лгут люди.",
                new List<RuleData> { Rule("r1", R1), Rule("r2", R2), Rule("r4", R4), Rule("r6", R6), Rule("r7", R7, true), Rule("r9", R9, true) },
                Expenses(true), 9,
                Violations(ViolationKind.ForeignNoPermit, ViolationKind.PassportExpired, ViolationKind.PermitExpired, ViolationKind.NameMismatch, ViolationKind.IdMismatch, ViolationKind.WestBanned, ViolationKind.FakeAtom, ViolationKind.FakeParty, ViolationKind.PhotoMismatch)),
            Day(
                5, "16 ОКТЯБРЯ, ГОД 51-Й", "16.10.51",
                "ПРОВЕРКА НА ВСЕ ГЛАЗА",
                "Перед Великим Запуском граница просвечивается насквозь",
                "Завтра реактор «ЗАРЯ-1» выйдет на полную мощность. Сегодня враг попытается просочиться в последний раз. Проверяй всё: орбиты, молот, лица, пол, даты, номера. Ошибка сегодня — приговор завтра.",
                new List<RuleData> { Rule("r1", R1), Rule("r2", R2), Rule("r4", R4), Rule("r6", R6), Rule("r7", R7), Rule("r9", R9), Rule("r8", R8) },
                Expenses(true), 10,
                Violations(ViolationKind.ForeignNoPermit, ViolationKind.PassportExpired, ViolationKind.PermitExpired, ViolationKind.NameMismatch, ViolationKind.IdMismatch, ViolationKind.WestBanned, ViolationKind.FakeAtom, ViolationKind.FakeParty, ViolationKind.PhotoMismatch, ViolationKind.SexMismatch)),
            Day(
                6, "17 ОКТЯБРЯ, ГОД 51-Й", "17.10.51",
                "ВЕЛИКИЙ ЗАПУСК СЕГОДНЯ",
                "Реактор «ЗАРЯ-1» выходит на полную мощность в полночь",
                "Вся республика смотрит в небо. Сегодня Атом заговорит голосом АССР. К вечеру решится и твоя судьба: Министерство рассматривает представление на высшего инспектора. Говорят, у поста №7 в последние дни было слишком много гостей.",
                new List<RuleData> { Rule("r1", R1), Rule("r2", R2), Rule("r4", R4), Rule("r6", R6), Rule("r7", R7), Rule("r9", R9) },
                Expenses(true), 10,
                Violations(ViolationKind.ForeignNoPermit, ViolationKind.PassportExpired, ViolationKind.PermitExpired, ViolationKind.NameMismatch, ViolationKind.IdMismatch, ViolationKind.WestBanned, ViolationKind.FakeAtom, ViolationKind.FakeParty, ViolationKind.PhotoMismatch, ViolationKind.SexMismatch))
        };

        private static DayConfig Day(int n, string date, string shortDate, string headline, string subline, string body,
            List<RuleData> rules, List<ExpenseData> expenses, int count, List<ViolationKind> violations)
        {
            return new DayConfig(n, date, shortDate, headline, subline, body, rules, expenses, count, violations);
        }

        private static RuleData Rule(string key, string text, bool isNew = false)
        {
            return new RuleData(key, text, isNew);
        }

        private static List<ExpenseData> Expenses(bool medicine)
        {
            List<ExpenseData> result = new List<ExpenseData>
            {
                new ExpenseData("Еда для семьи", 8),
                new ExpenseData("Отопление барака", 4)
            };
            if (medicine) result.Add(new ExpenseData("Лекарства для матери", 6));
            return result;
        }

        private static List<ViolationKind> Violations(params ViolationKind[] values)
        {
            return new List<ViolationKind>(values);
        }

        public static string CountryShort(CountryCode code)
        {
            switch (code)
            {
                case CountryCode.ASSR: return "АССР";
                case CountryCode.KRS: return "КРАСНОСЛАВИЯ";
                case CountryCode.ZPS: return "ОТЕПЛИЯ";
                case CountryCode.UGS: return "УГОЛЬНЫЙ СОЮЗ";
                default: return "СТЕПНАЯ ВОЛЬНИЦА";
            }
        }

        public static string CountryName(CountryCode code)
        {
            switch (code)
            {
                case CountryCode.ASSR: return "Аргелийская Советская Социалистическая Республика";
                case CountryCode.KRS: return "Народная Республика Краснославия";
                case CountryCode.ZPS: return "Королевство Отеплия";
                case CountryCode.UGS: return "Угольный Союз Трудовых Шахт";
                default: return "Степная Вольница Объединённых Куреней";
            }
        }

        public static readonly EndingData LoyalEnding = new EndingData(
            "loyal", "ВЫСШИЙ ИНСПЕКТОР", "#e8c34a", new[]
            {
                "В полночь «ЗАРЯ-1» вышла на полную мощность. Небо над блоком стало светлее, чем днём, и вся очередь у КПП-7 подняла головы.",
                "Утром на пост приехала чёрная машина. За бдительность, неподкупность и точный счёт орбит тебе присвоили звание ВЫСШЕГО ИНСПЕКТОРА.",
                "Западного атташе объявили персоной нон грата. Богдан Тихий больше не приходил — его лодку нашли пустой у третьего причала.",
                "Теперь у тебя свой кабинет и паёк первой категории. Сын спрашивает, сколько орбит у атома. Три. У настоящего всегда три."
            });

        public static readonly EndingData WestEnding = new EndingData(
            "west", "ЦЕНА СПИСКА", "#c33a2b", new[]
            {
                "Машина шла на запад всю ночь. Хаузер говорил о кофе, квартире и новом имени. Список лежал у него во внутреннем кармане.",
                "На третьем блокпосту Хаузер вышел «оформить бумаги» и не вернулся. В салон заглянули люди в форме АССР.",
                "Тебя судили за четыре часа. На Западе твой список стоил дешевле, чем добрые отношения с республикой атома.",
                "Последнее, что ты видел — свет «Зари-1» над блоком. Он был очень яркий. И совершенно чужой."
            });

        public static readonly EndingData NeighborEnding = new EndingData(
            "neighbor", "ЗА РЕКОЙ", "#7f9059", new[]
            {
                "Лодка отошла от третьего причала в четверть третьего. Сын спал у тебя на коленях, а за спиной разгоралось зарево Великого Запуска.",
                "В Краснославии дом у края села оказался настоящим: печь топится, крыша новая, во дворе яблоня.",
                "В АССР тебя объявили изменником. Граница за рекой закрыта для тебя навсегда.",
                "Иногда по ночам с той стороны виден свет реактора. Чужая заря, отвечаешь ты. И закрываешь ставни."
            });

        public static readonly EndingData SuspectEnding = new EndingData(
            "suspect", "ПОД НАБЛЮДЕНИЕМ", "#b98f2e", new[]
            {
                "Ты остался. Не уехал ни на запад, ни за реку — но и чистым не остался.",
                "В деле инспектора поста №7 подшито слишком много мелочей: конверты, разговоры через стекло, даты.",
                "Повышения не будет. Будет перевод на пост №19 — глухой переезд у болота.",
                "Граница — это ты. Только теперь границу тоже сторожат."
            });

        public static readonly EndingData ShiftEnding = new EndingData(
            "shift", "СМЕНА ПРОДОЛЖАЕТСЯ", "#d8c9a8", new[]
            {
                "Великий Запуск прошёл без твоего имени. Инспектор поста №7 работал в пределах нормы.",
                "Слишком много спорных штампов — представление на высшего инспектора отложили.",
                "Коул уехал. Богдан Тихий перестал приходить. Очередь у КПП-7 не кончается никогда.",
                "Завтра новый день, новые гербы, новые лица. Три орбиты. Молот справа. Ты знаешь своё дело."
            });

        public static EndingData PickEnding(FlagsData flags, TotalsData totals)
        {
            if (flags.FinalChoice == "west") return WestEnding;
            if (flags.FinalChoice == "neighbor") return NeighborEnding;
            if (flags.WestTrust >= 4 || flags.Bribe) return SuspectEnding;
            return totals.Errors <= 6 ? LoyalEnding : ShiftEnding;
        }
    }
}
