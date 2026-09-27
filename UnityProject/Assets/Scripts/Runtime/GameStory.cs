using System;
using System.Collections.Generic;

namespace BlazonPlease
{
    public sealed class StoryVisit
    {
        public int Position;
        public EntrantData Entrant;
    }

    public static class GameStory
    {
        private sealed class VisitTemplate
        {
            public int Day;
            public int Position;
            public string Agent;
            public string Dialogue;
            public string Interrogate;
            public string Prompt;
            public List<AgentOption> Options;

            public VisitTemplate(int day, int position, string agent, string dialogue, string interrogate, string prompt, List<AgentOption> options)
            {
                Day = day;
                Position = position;
                Agent = agent;
                Dialogue = dialogue;
                Interrogate = interrogate;
                Prompt = prompt;
                Options = options;
            }
        }

        private static readonly List<VisitTemplate> Visits = new List<VisitTemplate>
        {
            Visit(2, 3, "west",
                "Коул. Эдвард Коул, торговый атташе. Документы чисты. Я к вам по другому поводу.",
                "Допрос? Хорошо. Разговоры — это валюта.",
                "У вас талантливые глаза, инспектор. Такие глаза видят расписания смен и фамилии физиков. Начнём с малого: сколько человек проходит через пост за смену?",
                Options(
                    Option("Назвать цифру (+6 ₳)", "Прекрасно. Купите сыну чего-нибудь тёплого.", west: 1, credits: 6),
                    Option("«Проходите молча»", "Молчание. Тоже ответ. Я терпелив.", loyalty: 1),
                    Option("«Ещё слово — вызову комиссара»", "Комиссары портят торговлю.", loyalty: 2))),
            Visit(3, 4, "neighbor",
                "Тихий моя фамилия. Богдан Тихий. Я из Краснославии, тут рядом, за рекой.",
                "У нас за рекой на вопросы отвечают за кружкой, а не через стекло.",
                "У нас нет реакторов. Зато есть яблони и никто не считает орбиты. За рекой вас накормят. Без бумаг.",
                Options(
                    Option("«Расскажите про яблони»", "Белый налив. Сын ваш такого не пробовал.", neighbor: 1),
                    Option("«Мой дом — здесь»", "Дом там, где печка тёплая. Но я уважаю.", loyalty: 1),
                    Option("«Это агитация. Отказ»", "Жёстко. Я не обидчивый.", loyalty: 2))),
            Visit(3, 7, "west",
                "Снова я. У вас сегодня диверсия была? Опасное место, этот ваш атом.",
                "Я атташе. Атташе положено интересоваться.",
                "Слухи говорят, что «Заря-1» выходит на мощность в конце недели. Мне нужна точная дата. Двадцать пять атоморублей.",
                Options(
                    Option("Назвать дату запуска (+25 ₳)", "Вы умный человек. Умные люди долго живут. Обычно.", west: 2, credits: 25),
                    Option("«Дату знает вся республика»", "Из ваших уст она стоила бы дороже.", west: 1),
                    Option("«Я не продаю республику»", "Все продают. Вопрос цены.", loyalty: 2))),
            Visit(4, 3, "neighbor",
                "Принёс вам яблоко. Не берите, если нельзя. Просто посмотрите.",
                "Я честный контрабандист яблок. Худшее, что при мне — семечки.",
                "У нас есть пустой дом на краю села. Если однажды ночью придёте к реке с семьёй — лодка будет. Просто подумайте.",
                Options(
                    Option("«Где именно лодка?»", "Третий причал за старой мельницей.", neighbor: 2),
                    Option("«Я подумаю»", "Думать — тоже работа. Тёплая работа.", neighbor: 1),
                    Option("«Доложу о вашей лодке»", "Река всё равно течёт в обе стороны.", loyalty: 2))),
            Visit(4, 7, "west",
                "Коул. Вы уже привыкли ко мне. Привычка — начало дружбы.",
                "Пытаетесь поймать меня на слове? Милая попытка.",
                "Мне нужен образец нового удостоверения КПТА. Один бланк. Сорок атоморублей и ваше имя в списке первого рейса.",
                Options(
                    Option("Достать бланк КПТА (+40 ₳)", "Теперь вы наш человек.", west: 3, credits: 40),
                    Option("«Бланков нет. Только слухи»", "Завтра поговорим о конце.", west: 1),
                    Option("«Вон от моего окна»", "Как грубо. После всего, что я предлагал.", loyalty: 2))),
            Visit(5, 3, "west",
                "Завтра большой день у вашей республики. И у вас, инспектор.",
                "Волнуетесь? Волнение — признак, что вы ещё живы.",
                "Завтра ночью машина увезёт вас на Запад. Взамен — список всех, кого вы пропустили с гербом КПТА. Сегодня скажите: вы слушаете?",
                Options(
                    Option("«Я слушаю»", "Завтра всё изменится.", west: 2),
                    Option("«Я ещё не решил»", "Нерешительность кончается в полночь.", west: 1),
                    Option("«Я служу АССР»", "Служба — красивое слово для бедности.", loyalty: 3))),
            Visit(5, 6, "neighbor",
                "Из Отеплии к вам тоже ходит. Он пахнет одеколоном и деньгами.",
                "Верьте реке. Река никого ещё не обманула.",
                "Он вас продаст. А у меня — лодка, яблони и никаких списков. Завтра ночью я буду у третьего причала.",
                Options(
                    Option("«Буду думать до завтра»", "Думайте у воды.", neighbor: 2),
                    Option("«Я никуда не бегу»", "Бег — не позор.", neighbor: 1),
                    Option("«Сдам вас обоих»", "Останетесь один со своим гербом.", loyalty: 3))),
            Visit(6, 4, "west",
                "Последний раз, инспектор. Машина заведена. Через сорок минут её не будет.",
                "Времени на допросы нет. Есть время на решение.",
                "Список имён — и вы садитесь в машину. Через неделю будете пить кофе там, где не считают орбиты. Ваше слово.",
                Options(
                    Option("Отдать список и уехать в Отеплию", "Умница. Отеплия вас ждёт.", west: 3, finalChoice: "west"),
                    Option("Отказать и остаться", "Вы были почти свободны. Почти.", loyalty: 3, finalChoice: "loyal"))),
            Visit(6, 8, "neighbor",
                "Лодка на воде. Гребец мёрзнет. Семья ваша собрана?",
                "Спрашивайте быстро. Течение не ждёт.",
                "За рекой вас никто не знает и никто не спросит документов. Но обратно дороги не будет. Идёте?",
                Options(
                    Option("Уйти за реку к соседям", "Тогда бегом. И не смотрите назад.", neighbor: 3, finalChoice: "neighbor"),
                    Option("Остаться в АССР", "Значит, судьба такая. Прощайте.", loyalty: 3, finalChoice: "loyal")))
        };

        public static List<StoryVisit> GetVisits(int day, FlagsData flags, string dateShort)
        {
            List<StoryVisit> result = new List<StoryVisit>();
            foreach (VisitTemplate visit in Visits)
            {
                if (visit.Day != day) continue;
                if (day == 6 && visit.Agent == "west" && flags.WestTrust < 1) continue;
                if (day == 6 && visit.Agent == "neighbor" && flags.NeighborTrust < 1) continue;
                result.Add(new StoryVisit
                {
                    Position = visit.Position,
                    Entrant = BuildAgent(visit, day, dateShort)
                });
            }
            return result;
        }

        private static EntrantData BuildAgent(VisitTemplate visit, int day, string dateShort)
        {
            bool west = visit.Agent == "west";
            string name = west ? "ВИКТОР ХАУЗЕР" : "БОГДАН ТИХИЙ";
            string id = west ? "500141" : "400227";
            CountryCode country = west ? CountryCode.ZPS : CountryCode.KRS;
            bool banned = west && day >= 3;
            string year = dateShort.Substring(dateShort.Length - 2);
            int nextYear;
            if (!int.TryParse(year, out nextYear)) nextYear = 51;
            nextYear++;

            EntrantData entrant = new EntrantData
            {
                Dialogue = visit.Dialogue,
                Interrogate = visit.Interrogate,
                ReactionAdmit = west ? "До завтра, инспектор." : "Бывайте здоровы. И тепло одевайтесь.",
                ReactionDeny = west ? "Ничего. Я найду другое окно." : "Река подождёт. И я подожду.",
                PersonDescription = west ? "мужчина, аккуратный пробор, очки" : "мужчина, ушанка, усы",
                ActualSex = Sex.M,
                Passport = new PassportData
                {
                    Country = country,
                    Name = name,
                    Sex = Sex.M,
                    DateOfBirth = west ? "03.04.14" : "19.08.09",
                    Expiry = "28.12." + year,
                    Id = id,
                    PhotoDescription = west ? "мужчина, аккуратный пробор, очки" : "мужчина, ушанка, усы"
                },
                Permit = new PermitData
                {
                    Name = name,
                    PassportId = id,
                    Purpose = "ТОРГОВЛЯ",
                    Duration = "1 ГОД",
                    Expiry = "30.09." + nextYear.ToString("00")
                },
                Expected = banned ? Decision.Deny : Decision.Admit,
                Citation = banned ? "Гражданам Отеплии въезд запрещён — пропущен агент" : "Документы были в порядке — решение без основания",
                Caught = west ? "Бумаги, бумаги. Мы же выше бумаг, инспектор." : "Поймали. Ну и что? Я всё равно приду завтра.",
                Detainable = false,
                Violation = banned ? ViolationKind.WestBanned : ViolationKind.None,
                AgentKind = visit.Agent,
                Offer = new AgentOffer(visit.Prompt, visit.Options)
            };
            if (banned) entrant.Mismatches.Add(new FieldPair("p.country", "rule.r4"));
            return entrant;
        }

        private static VisitTemplate Visit(int day, int position, string agent, string dialogue, string interrogate, string prompt, List<AgentOption> options)
        {
            return new VisitTemplate(day, position, agent, dialogue, interrogate, prompt, options);
        }

        private static List<AgentOption> Options(params AgentOption[] options)
        {
            return new List<AgentOption>(options);
        }

        private static AgentOption Option(string label, string reply, int west = 0, int neighbor = 0, int loyalty = 0, int credits = 0, string finalChoice = "")
        {
            return new AgentOption(label, reply, west, neighbor, loyalty, credits, finalChoice);
        }
    }
}
