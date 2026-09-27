using System;
using System.Collections.Generic;

namespace BlazonPlease
{
    public static class GameGenerator
    {
        private sealed class NamePool
        {
            public string[] Male;
            public string[] Female;
            public string[] Last;
            public bool Slavic;

            public NamePool(string[] male, string[] female, string[] last, bool slavic)
            {
                Male = male;
                Female = female;
                Last = last;
                Slavic = slavic;
            }
        }

        private static readonly Dictionary<CountryCode, NamePool> Names = new Dictionary<CountryCode, NamePool>
        {
            { CountryCode.ASSR, new NamePool(
                new[] { "ИВАН", "ПЁТР", "СТЕПАН", "ГЕННАДИЙ", "ЛЕВ", "ЮЛИЙ", "ОТТО", "АРКАДИЙ", "ФЁДОР", "ЕГОР", "ДЕМЬЯН", "РУБЕН", "ГЛЕБ", "ТИМУР", "ВАЛЕНТИН" },
                new[] { "КЛАВДИЯ", "НИНА", "ПОЛИНА", "ВЕРА", "АЛИНА", "ЛЮБОВЬ", "ГАЛИНА", "АДА", "МАРФА", "ЗИНАИДА", "ОЛЬГА", "РАИСА", "ТАМАРА" },
                new[] { "СИДОРОВ", "МОРОЗОВ", "ГРОМОВ", "БЕЛОВ", "КОЗЛОВ", "СОКОЛОВ", "ТАРАСОВ", "РЕАКТОРОВ", "ФИЗИКИН", "АТОМОВ", "ЗОРИН", "КУЗНЕЦОВ", "ОРЛОВ", "НЕЙТРОНОВ", "УРАНОВ" }, true) },
            { CountryCode.KRS, new NamePool(
                new[] { "БОРИС", "АНДРЕЙ", "ГУРАМ", "МИРОСЛАВ", "ЛУКА", "ЯН", "КИР", "БОГДАН", "ОСТАП", "ВЛАД" },
                new[] { "ЗОЯ", "МИЛОСЛАВА", "ДАНА", "ЛЮДМИЛА", "ЯРИНА", "ОКСАНА", "СТЕФА" },
                new[] { "ВАРГА", "КРАМОРОВ", "ЧАСОВЩИКОВ", "БУМАЖНИКОВ", "ТИХИЙ", "ЗЕЛЕНКО", "ЛИПА", "ГОРАН", "ДУНАЕВ" }, true) },
            { CountryCode.ZPS, new NamePool(
                new[] { "ВИКТОР", "ЛЕОН", "МАКС", "ГЕНРИХ", "КЛАУС", "ОСКАР", "ЗИГФРИД", "РЕЙНХАРД" },
                new[] { "ЭММА", "АННА", "ЛОТТА", "КЛАРА", "ИНГРИД", "ХЕЛЬГА" },
                new[] { "КЁНИГ", "ФОГЕЛЬ", "РИХТЕР", "ШУЛЬЦ", "БАЙЕР", "КРАМЕР", "ШТЕРН", "ФИШЕР", "ХАУЗЕР" }, false) },
            { CountryCode.UGS, new NamePool(
                new[] { "ПЁТР", "МАКАР", "ЮРА", "ТРОФИМ", "ЗАХАР", "КУЗЬМА", "СЕВА" },
                new[] { "ВЕРА", "ДАРЬЯ", "МАРИЯ", "ФЁКЛА", "ЛИДИЯ" },
                new[] { "ШАХТОВ", "ГРИГОРЬЕВ", "БОРЕЦ", "ТЕЛЕГИН", "РЕЛЬСОВ", "УГЛОВ", "КОПАЧ", "ШТОЛЬНЯ" }, true) },
            { CountryCode.STV, new NamePool(
                new[] { "ТАРАС", "ГРИЦЬ", "ДАНИЛО", "МИКОЛА", "ЯРОСЛАВ", "ПАНАС" },
                new[] { "ОКСАНА", "СОНЯ", "МАРЬЯНА", "ГАННА", "ОДАРКА", "КАТРЯ" },
                new[] { "КОЗАК", "ДОНЦОВ", "КОЛОСОВ", "СТЕПОВОЙ", "ЧУМАК", "ВИТЕР", "ПОЛЕВОЙ" }, true) }
        };

        private static readonly CountryCode[] ForeignCountries =
        {
            CountryCode.KRS, CountryCode.UGS, CountryCode.STV, CountryCode.ZPS
        };

        private static readonly string[] Hair = { "короткие волосы", "пробор", "лохматые волосы", "лысина", "ушанка", "фуражка", "пучок" };
        private static readonly string[] Faces = { "без примет", "усы", "борода", "очки", "очки и усы" };

        public static List<EntrantData> BuildDay(int seed, DayConfig day, FlagsData flags)
        {
            Random random = new Random(unchecked(seed * 7919 + day.Number * 104729));
            List<EntrantData> entrants = new List<EntrantData>();
            for (int index = 0; index < day.EntrantCount; index++)
            {
                entrants.Add(MakeEntrant(random, day, index == 0));
            }

            List<StoryVisit> visits = GameStory.GetVisits(day.Number, flags, day.DateShort);
            visits.Sort((a, b) => a.Position.CompareTo(b.Position));
            foreach (StoryVisit visit in visits)
            {
                int position = Math.Min(Math.Max(1, visit.Position), entrants.Count);
                entrants.Insert(position, visit.Entrant);
            }
            return entrants;
        }

        private static EntrantData MakeEntrant(Random random, DayConfig day, bool forceClean)
        {
            CountryCode country = forceClean ? CountryCode.ASSR : (Chance(random, 0.45) ? CountryCode.ASSR : Pick(random, ForeignCountries));
            Sex actualSex = Chance(random, 0.45) ? Sex.F : Sex.M;
            string person = MakePerson(random, actualSex);
            string name = MakeName(random, country, actualSex);
            string id = random.Next(100000, 1000000).ToString();

            List<ViolationKind> pool = new List<ViolationKind>();
            foreach (ViolationKind kind in day.Violations)
            {
                if (country == CountryCode.ASSR &&
                    (kind == ViolationKind.ForeignNoPermit || kind == ViolationKind.PermitExpired ||
                     kind == ViolationKind.NameMismatch || kind == ViolationKind.IdMismatch || kind == ViolationKind.WestBanned)) continue;
                if (country == CountryCode.ZPS && (kind == ViolationKind.FakeParty || kind == ViolationKind.FakeAtom)) continue;
                if (country != CountryCode.ASSR && (kind == ViolationKind.FakeParty || kind == ViolationKind.FakeAtom)) continue;
                pool.Add(kind);
            }

            ViolationKind violation = !forceClean && pool.Count > 0 && Chance(random, 0.48)
                ? Pick(random, pool)
                : ViolationKind.None;

            // В первый день любой иностранец нарушает прямой запрет.
            if (country != CountryCode.ASSR && day.Number == 1) violation = ViolationKind.ForeignNoPermit;
            // После третьей смены граждан Отеплии не пропускают при любых бумагах.
            if (country == CountryCode.ZPS && day.Violations.Contains(ViolationKind.WestBanned)) violation = ViolationKind.WestBanned;

            PassportData passport = new PassportData
            {
                Country = country,
                Name = name,
                Sex = actualSex,
                DateOfBirth = BirthDate(random),
                Expiry = FutureDate(random, day.Number),
                Id = id,
                FakeAtom = false,
                PhotoDescription = person
            };

            PermitData permit = null;
            if (country != CountryCode.ASSR && day.Number >= 2 && violation != ViolationKind.ForeignNoPermit)
            {
                permit = new PermitData
                {
                    Name = name,
                    PassportId = id,
                    Purpose = Pick(random, GameDatabase.Purposes),
                    Duration = Pick(random, GameDatabase.Durations),
                    Expiry = FutureDate(random, day.Number)
                };
            }

            PartyCardData partyCard = null;
            if (country == CountryCode.ASSR && (violation == ViolationKind.FakeParty || Chance(random, 0.18)))
            {
                partyCard = new PartyCardData
                {
                    Name = name,
                    Rank = Pick(random, GameDatabase.PartyRanks),
                    Mirrored = true
                };
            }

            List<FieldPair> mismatches = new List<FieldPair>();
            switch (violation)
            {
                case ViolationKind.ForeignNoPermit:
                    permit = null;
                    mismatches.Add(new FieldPair("p.country", day.Number >= 2 ? "rule.r2" : "rule.r2x"));
                    break;
                case ViolationKind.PassportExpired:
                    passport.Expiry = PastDate(random, day.Number);
                    mismatches.Add(new FieldPair("p.expiry", "cal.today"));
                    break;
                case ViolationKind.PermitExpired:
                    if (permit != null)
                    {
                        permit.Expiry = PastDate(random, day.Number);
                        mismatches.Add(new FieldPair("w.expiry", "cal.today"));
                    }
                    break;
                case ViolationKind.NameMismatch:
                    if (permit != null)
                    {
                        permit.Name = MutateName(random, name);
                        mismatches.Add(new FieldPair("p.name", "w.name"));
                    }
                    break;
                case ViolationKind.IdMismatch:
                    if (permit != null)
                    {
                        permit.PassportId = MutateId(id);
                        mismatches.Add(new FieldPair("p.id", "w.passId"));
                    }
                    break;
                case ViolationKind.WestBanned:
                    mismatches.Add(new FieldPair("p.country", "rule.r4"));
                    break;
                case ViolationKind.FakeAtom:
                    passport.FakeAtom = true;
                    mismatches.Add(new FieldPair("p.emblem", "ref.atom"));
                    break;
                case ViolationKind.FakeParty:
                    partyCard = new PartyCardData
                    {
                        Name = name,
                        Rank = Pick(random, GameDatabase.PartyRanks),
                        Mirrored = false
                    };
                    mismatches.Add(new FieldPair("c.emblem", "ref.party"));
                    break;
                case ViolationKind.PhotoMismatch:
                    passport.PhotoDescription = MakeDifferentPerson(random, actualSex, person);
                    mismatches.Add(new FieldPair("p.photo", "face"));
                    break;
                case ViolationKind.SexMismatch:
                    passport.Sex = actualSex == Sex.M ? Sex.F : Sex.M;
                    passport.PhotoDescription = MakeDifferentPerson(random, passport.Sex, person);
                    mismatches.Add(new FieldPair("p.photo", "face"));
                    mismatches.Add(new FieldPair("p.sex", "face"));
                    break;
            }

            return new EntrantData
            {
                Dialogue = Pick(random, GameDatabase.SmallTalk),
                Interrogate = Pick(random, GameDatabase.ProbeLines),
                Passport = passport,
                Permit = permit,
                PartyCard = partyCard,
                PersonDescription = person,
                ActualSex = actualSex,
                Expected = violation == ViolationKind.None ? Decision.Admit : Decision.Deny,
                Citation = Citation(violation),
                Caught = CaughtLine(violation),
                Detainable = violation == ViolationKind.FakeAtom || violation == ViolationKind.FakeParty ||
                              violation == ViolationKind.PhotoMismatch || violation == ViolationKind.SexMismatch,
                Violation = violation,
                Mismatches = mismatches
            };
        }

        private static string MakeName(Random random, CountryCode country, Sex sex)
        {
            NamePool pool = Names[country];
            string first = sex == Sex.M ? Pick(random, pool.Male) : Pick(random, pool.Female);
            string last = Pick(random, pool.Last);
            if (sex == Sex.F && pool.Slavic && !last.EndsWith("А") && !last.EndsWith("Я")) last += "А";
            return first + " " + last;
        }

        private static string MakePerson(Random random, Sex sex)
        {
            string hair = Pick(random, Hair);
            string face = sex == Sex.F && random.NextDouble() < 0.65 ? "без примет" : Pick(random, Faces);
            return (sex == Sex.M ? "мужчина" : "женщина") + ", " + hair + ", " + face;
        }

        private static string MakeDifferentPerson(Random random, Sex sex, string original)
        {
            string value = MakePerson(random, sex);
            int guard = 0;
            while (value == original && guard++ < 8) value = MakePerson(random, sex);
            return value;
        }

        private static string FutureDate(Random random, int dayNumber)
        {
            int currentMonth = 10;
            int currentYear = 51;
            int addMonths = random.Next(1, 14);
            int monthIndex = currentMonth - 1 + addMonths;
            int month = monthIndex % 12 + 1;
            int year = currentYear + monthIndex / 12;
            return FormatDate(random.Next(1, 29), month, year);
        }

        private static string PastDate(Random random, int dayNumber)
        {
            int currentDay = 11 + dayNumber;
            int month = 10 - random.Next(0, 10);
            int year = 51;
            if (month <= 0) { month += 12; year--; }
            int maxDay = month == 10 && year == 51 ? Math.Max(1, currentDay - 1) : 28;
            return FormatDate(random.Next(1, maxDay + 1), month, year);
        }

        private static string BirthDate(Random random)
        {
            return FormatDate(random.Next(1, 29), random.Next(1, 13), random.Next(0, 34));
        }

        private static string FormatDate(int day, int month, int year)
        {
            return day.ToString("00") + "." + month.ToString("00") + "." + year.ToString("00");
        }

        private static string MutateName(Random random, string name)
        {
            char[] chars = name.ToCharArray();
            if (chars.Length < 4) return name + "А";
            int index = random.Next(1, chars.Length);
            if (chars[index] == ' ') index = Math.Min(chars.Length - 1, index + 1);
            const string letters = "АОЕИУВНРСТЛК";
            chars[index] = letters[random.Next(letters.Length)];
            return new string(chars);
        }

        private static string MutateId(string id)
        {
            char[] chars = id.ToCharArray();
            int i = chars.Length - 2;
            char temp = chars[i];
            chars[i] = chars[i + 1];
            chars[i + 1] = temp;
            if (new string(chars) == id) chars[chars.Length - 1] = chars[chars.Length - 1] == '9' ? '0' : (char)(chars[chars.Length - 1] + 1);
            return new string(chars);
        }

        private static string Citation(ViolationKind violation)
        {
            switch (violation)
            {
                case ViolationKind.ForeignNoPermit: return "Иностранец без разрешения на въезд";
                case ViolationKind.PassportExpired: return "Паспорт просрочен";
                case ViolationKind.PermitExpired: return "Разрешение на въезд просрочено";
                case ViolationKind.NameMismatch: return "Имя в разрешении не совпадает с паспортом";
                case ViolationKind.IdMismatch: return "Номер разрешения не совпадает с № паспорта";
                case ViolationKind.WestBanned: return "Гражданам Отеплии въезд запрещён";
                case ViolationKind.FakeAtom: return "Поддельный герб АССР: две орбиты";
                case ViolationKind.FakeParty: return "Поддельное удостоверение КПТА";
                case ViolationKind.PhotoMismatch: return "Фото в паспорте не соответствует предъявителю";
                case ViolationKind.SexMismatch: return "Пол и фото не соответствуют предъявителю";
                default: return "Документы были в порядке — решение без основания";
            }
        }

        private static string CaughtLine(ViolationKind violation)
        {
            switch (violation)
            {
                case ViolationKind.PassportExpired: return "Просрочен? Он же вчера был хорош!";
                case ViolationKind.PermitExpired: return "Бумажка кончилась, а дела остались.";
                case ViolationKind.NameMismatch: return "Одна буква! Одна буква, товарищ!";
                case ViolationKind.IdMismatch: return "Ошибка канцелярии, клянусь Атомом.";
                case ViolationKind.WestBanned: return "Это нарушение дипломатического протокола!";
                case ViolationKind.FakeAtom: return "Две орбиты, три орбиты... Вы их считаете?!";
                case ViolationKind.FakeParty: return "Молот слева! Я перепутал сторону!";
                case ViolationKind.PhotoMismatch: return "Фото старое. Совсем старое. Ладно, не моё.";
                case ViolationKind.SexMismatch: return "Это паспорт родственника. Простите.";
                default: return "Это... это ничего не значит!";
            }
        }

        private static T Pick<T>(Random random, IList<T> values)
        {
            return values[random.Next(values.Count)];
        }

        private static bool Chance(Random random, double probability)
        {
            return random.NextDouble() < probability;
        }
    }
}
