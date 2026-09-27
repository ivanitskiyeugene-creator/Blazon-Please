using System;
using System.Collections.Generic;
using System.Text;
using UnityEngine;
using UnityEngine.UI;

namespace BlazonPlease
{
    public static class GameScreens
    {
        public static void ShowTitle(GameApp app, SaveData save)
        {
            GameObject root = Begin(app, "Главное меню", Palette.Ink);
            UiFactory.Panel(root.transform, "Верхняя лента", 0, 1015, 1920, 65, Palette.Coal, false);
            UiFactory.Text(root.transform, "Министерство", "МИНИСТЕРСТВО ПРОПУСКОВ НАРОДА", 42, 1023, 700, 46, 20, Palette.Ash, TextAnchor.MiddleLeft, FontStyle.Bold);
            UiFactory.Text(root.transform, "Версия", "UNITY PORT  •  " + GameDatabase.Version, 1500, 1023, 370, 46, 18, Palette.Ash, TextAnchor.MiddleRight);

            UiFactory.Text(root.transform, "Республика", "АРГЕЛИЙСКАЯ СОВЕТСКАЯ\nСОЦИАЛИСТИЧЕСКАЯ РЕСПУБЛИКА", 100, 845, 850, 85, 26, Palette.Gold, TextAnchor.MiddleLeft, FontStyle.Bold);
            UiFactory.Text(root.transform, "Заголовок", "ГЕРБЫ,", 95, 590, 920, 240, 112, Palette.Paper, TextAnchor.MiddleLeft, FontStyle.Bold);
            UiFactory.Text(root.transform, "Подзаголовок", "ПОЖАЛУЙСТА", 100, 470, 900, 130, 67, Palette.Red, TextAnchor.MiddleLeft, FontStyle.Bold);
            UiFactory.Text(root.transform, "Описание",
                "Шесть смен на КПП-7. Очередь меняется каждую игру, но двое приходят всегда: западный атташе и сосед из-за реки. Оба зовут к себе. Решать — тебе.",
                105, 345, 820, 115, 26, Palette.Ash, TextAnchor.UpperLeft);

            if (save != null)
            {
                UiFactory.Button(root.transform, "Продолжить", "ПРОДОЛЖИТЬ СМЕНУ " + (save.DayIndex + 1) + "  •  " + save.Credits + " ₳  •  " + SaveService.Age(save.SavedAtUnix),
                    105, 235, 790, 76, Palette.Red, app.ContinueGame, 25);
                UiFactory.Button(root.transform, "Новая игра", "НОВАЯ СЛУЖБА", 105, 145, 500, 66, Palette.Panel, app.StartNewGame, 22);
                UiFactory.Button(root.transform, "Удалить", "СТЕРЕТЬ СОХРАНЕНИЕ", 620, 145, 275, 66, Palette.Coal, app.DeleteSave, 17, Palette.Ash);
            }
            else
            {
                UiFactory.Button(root.transform, "Новая игра", "НОВАЯ СЛУЖБА", 105, 205, 790, 80, Palette.Red, app.StartNewGame, 28);
            }

            GameObject posterPanel = UiFactory.Panel(root.transform, "Плакат", 1070, 135, 700, 790, Palette.Coal);
            Texture2D poster = Resources.Load<Texture2D>("Images/poster");
            if (poster != null) UiFactory.RawImage(posterPanel.transform, "Плакат", poster, 18, 90, 664, 675, Color.white);
            UiFactory.Panel(posterPanel.transform, "Подпись фон", 18, 18, 664, 72, Palette.Coal, false);
            UiFactory.Text(posterPanel.transform, "Подпись", "«АТОМ СМОТРИТ НА ГРАНИЦУ. ГРАНИЦА — ЭТО ТЫ.»", 32, 28, 635, 48, 19, Palette.Gold, TextAnchor.MiddleCenter, FontStyle.Bold);

            UiFactory.Panel(root.transform, "Нижняя лента", 0, 0, 1920, 60, Palette.Coal, false);
            UiFactory.Text(root.transform, "Сводка", "/// ГОЛОС АТОМА: РЕАКТОР «ЗАРЯ-1» ГОТОВИТСЯ К ВЕЛИКОМУ ЗАПУСКУ  •  МОЛОТ — СПРАВА  •  У АТОМА ТРИ ОРБИТЫ",
                25, 7, 1870, 44, 18, Palette.Ash, TextAnchor.MiddleCenter);
        }

        public static void ShowBriefing(GameApp app)
        {
            DayConfig day = app.CurrentDay;
            GameObject root = Begin(app, "Инструктаж", Palette.Ink);
            Header(root.transform, "СМЕНА " + day.Number + " ИЗ " + GameDatabase.Days.Count, day.Date, app.Save.Credits + " ₳");

            GameObject news = UiFactory.Panel(root.transform, "Газета", 65, 90, 900, 875, Palette.Paper);
            UiFactory.Text(news.transform, "Издание", "ГОЛОС АТОМА", 38, 790, 540, 62, 45, Palette.Ink, TextAnchor.MiddleLeft, FontStyle.Bold);
            UiFactory.Text(news.transform, "Орган", "ОРГАН ЦК КПТА\nЦЕНА: 2 КОП.", 640, 790, 220, 62, 16, Palette.Ink, TextAnchor.MiddleRight);
            UiFactory.Panel(news.transform, "Разделитель", 35, 778, 830, 4, Palette.Ink, false);
            UiFactory.Text(news.transform, "Дата", day.Date + " — ИЗДАНИЕ УТРЕННЕЕ", 40, 735, 820, 34, 16, Palette.Line);
            UiFactory.Text(news.transform, "Заголовок", day.Headline, 38, 585, 825, 145, 43, Palette.Ink, TextAnchor.MiddleLeft, FontStyle.Bold);
            UiFactory.Text(news.transform, "Подзаголовок", day.Subline.ToUpperInvariant(), 40, 520, 820, 58, 20, Palette.DarkRed, TextAnchor.MiddleLeft, FontStyle.Bold);
            UiFactory.Text(news.transform, "Текст", day.Body, 42, 235, 812, 275, 27, Palette.Ink, TextAnchor.UpperLeft);
            UiFactory.Text(news.transform, "Типография", "ОТПЕЧАТАНО В ТИПОГРАФИИ «ТРЕТЬЯ ОРБИТА»", 40, 35, 820, 50, 15, Palette.Line, TextAnchor.MiddleCenter);

            GameObject directive = UiFactory.Panel(root.transform, "Директива", 1000, 345, 855, 620, Palette.Panel);
            UiFactory.Text(directive.transform, "Заголовок", "ДИРЕКТИВА НА СМЕНУ " + day.Number, 28, 550, 800, 48, 28, Palette.Gold, TextAnchor.MiddleLeft, FontStyle.Bold);
            float ruleY = 485;
            for (int index = 0; index < day.Rules.Count; index++)
            {
                RuleData rule = day.Rules[index];
                string prefix = (index + 1).ToString("00") + "  ";
                string suffix = rule.IsNew ? "   <color=#c33a2b><b>НОВОЕ</b></color>" : "";
                UiFactory.Text(directive.transform, "Правило " + rule.Key, prefix + rule.Text + suffix,
                    30, ruleY, 790, 64, 20, Palette.Bone, TextAnchor.UpperLeft);
                ruleY -= 75;
            }

            GameObject expenses = UiFactory.Panel(root.transform, "Расходы", 1000, 145, 855, 175, Palette.Coal);
            UiFactory.Text(expenses.transform, "Подпись", "ВЕЧЕРОМ ВЫЧТЕТСЯ ИЗ ПАЙКА:", 25, 125, 500, 30, 16, Palette.Ash, TextAnchor.MiddleLeft, FontStyle.Bold);
            StringBuilder expenseText = new StringBuilder();
            foreach (ExpenseData expense in day.Expenses) expenseText.AppendLine(expense.Label + "    −" + expense.Amount + " ₳");
            expenseText.Append("За верное решение    +" + GameDatabase.PayPerCorrect + " ₳");
            UiFactory.Text(expenses.transform, "Строки", expenseText.ToString(), 30, 22, 790, 100, 19, Palette.Bone, TextAnchor.UpperLeft);

            if (app.Notices != null && app.Notices.Count > 0)
            {
                StringBuilder notices = new StringBuilder("ИЗВЕЩЕНИЯ:  ");
                foreach (NoticeData notice in app.Notices)
                {
                    notices.Append(notice.Text);
                    if (notice.Amount != 0) notices.Append("  ").Append(notice.Amount).Append(" ₳");
                    notices.Append("    ");
                }
                UiFactory.Text(root.transform, "Извещения", notices.ToString(), 1000, 94, 850, 48, 16, Palette.Red, TextAnchor.MiddleLeft, FontStyle.Bold);
            }

            UiFactory.Button(root.transform, "Открыть", "ОТКРЫТЬ КПП-7  ›", 1000, 25, 855, 62, Palette.Red, app.OpenCheckpoint, 25);
        }

        public static void ShowGame(GameApp app)
        {
            DayConfig day = app.CurrentDay;
            EntrantData entrant = app.CurrentEntrant;
            GameObject root = Begin(app, "КПП-7", Palette.Ink);
            Header(root.transform,
                "КПП-7  //  СМЕНА " + day.Number,
                day.Date + "     ПОСЕТИТЕЛЬ " + Math.Min(app.EntrantIndex + 1, app.Entrants.Count) + "/" + app.Entrants.Count,
                "БАЛАНС УТРА: " + app.Save.Credits + " ₳");

            GameObject booth = UiFactory.Panel(root.transform, "Окно приёма", 20, 75, 470, 920, Palette.Coal);
            UiFactory.Text(booth.transform, "Окно", "ОКНО ПРИЁМА", 20, 855, 430, 44, 19, Palette.Ash, TextAnchor.MiddleCenter, FontStyle.Bold);
            UiFactory.Panel(booth.transform, "Стекло", 22, 365, 426, 480, Palette.Hex("#211c17"));

            if (app.WaitingForNext)
            {
                UiFactory.Text(booth.transform, "Очередь", "За мутным стеклом ждёт очередь.\nГромкоговоритель трещит.", 50, 570, 370, 110, 24, Palette.Ash, TextAnchor.MiddleCenter);
                UiFactory.Button(booth.transform, "Следующий", "📢  СЛЕДУЮЩИЙ!", 60, 430, 350, 82, Palette.Red, app.CallNext, 27);
            }
            else if (entrant != null)
            {
                UiFactory.Text(booth.transform, "Имя", entrant.Passport.Name, 38, 765, 390, 54, 28, Palette.Gold, TextAnchor.MiddleCenter, FontStyle.Bold);
                UiFactory.Text(booth.transform, "Страна", GameDatabase.CountryShort(entrant.Passport.Country), 38, 725, 390, 38, 18, Palette.Ash, TextAnchor.MiddleCenter);
                UiFactory.Text(booth.transform, "Силуэт", entrant.ActualSex == Sex.M ? "◼\n╱█╲\n╱ ╲" : "●\n╱█╲\n╱ ╲", 150, 515, 170, 190, 48, Palette.Bone, TextAnchor.MiddleCenter, FontStyle.Bold);
                AddFieldButton(app, booth.transform, "face", "ЛИЦО: " + entrant.PersonDescription, 38, 455, 390, 54, 16);
                UiFactory.Text(booth.transform, "Реплика", "«" + app.Reaction + "»", 40, 375, 385, 72, 18, Palette.Paper, TextAnchor.MiddleCenter);
                Button interrogate = UiFactory.Button(booth.transform, "Допрос", "ДОПРОСИТЬ", 60, 300, 350, 54, Palette.Panel, app.Interrogate, 19);
                interrogate.interactable = !app.DecisionMade;
            }

            UiFactory.Text(booth.transform, "Журнал", "ЖУРНАЛ ПОСТА", 25, 320, 420, 32, 16, Palette.Ash, TextAnchor.MiddleCenter, FontStyle.Bold);
            string journal = "Обработано: " + app.EntrantIndex + "\nВерных решений: " + app.Result.Correct +
                             "\nПротоколов: " + app.Result.Errors.Count + "\nДоказательств: " + app.Result.Evidence;
            UiFactory.Text(booth.transform, "Итоги", journal, 35, 145, 400, 160, 20, Palette.Bone, TextAnchor.UpperLeft);
            UiFactory.Button(booth.transform, "Меню", "В ГЛАВНОЕ МЕНЮ", 60, 45, 350, 55, Palette.Panel, app.ExitToMenu, 17, Palette.Ash);

            GameObject desk = UiFactory.Panel(root.transform, "Стол", 510, 75, 960, 920, Palette.Hex("#201914"));
            UiFactory.Text(desk.transform, "Стол заголовок", "РАБОЧИЙ СТОЛ  //  ВЫБЕРИ ДВА ПРОТИВОРЕЧАЩИХ ПОЛЯ", 22, 870, 915, 35, 17, Palette.Ash, TextAnchor.MiddleCenter, FontStyle.Bold);
            if (!app.WaitingForNext && entrant != null)
            {
                DrawPassport(app, desk.transform, entrant);
                DrawPermitOrCard(app, desk.transform, entrant);
                DrawReferences(app, desk.transform, day, entrant);
            }
            else
            {
                UiFactory.Text(desk.transform, "Пусто", "ДОКУМЕНТЫ ПОКА НЕ ПЕРЕДАНЫ", 100, 420, 760, 70, 27, Palette.Line, TextAnchor.MiddleCenter, FontStyle.Bold);
            }

            GameObject controls = UiFactory.Panel(root.transform, "Панель решений", 1490, 75, 410, 920, Palette.Coal);
            DrawControls(app, controls.transform);

            if (!app.WaitingForNext && entrant != null && !app.OfferHandled && entrant.Offer != null)
                DrawOffer(app, root.transform, entrant);
        }

        private static void DrawPassport(GameApp app, Transform parent, EntrantData entrant)
        {
            GameObject panel = UiFactory.Panel(parent, "Паспорт", 18, 390, 450, 465, Palette.Hex("#5b2722"));
            UiFactory.Text(panel.transform, "Название", "ПАСПОРТ", 18, 415, 414, 36, 23, Palette.Paper, TextAnchor.MiddleCenter, FontStyle.Bold);
            AddFieldButton(app, panel.transform, "p.country", "СТРАНА: " + GameDatabase.CountryShort(entrant.Passport.Country), 18, 365, 414, 42, 16);
            AddFieldButton(app, panel.transform, "p.name", "ИМЯ: " + entrant.Passport.Name, 18, 317, 414, 42, 16);
            AddFieldButton(app, panel.transform, "p.sex", "ПОЛ: " + (entrant.Passport.Sex == Sex.M ? "М" : "Ж"), 18, 269, 196, 42, 16);
            AddFieldButton(app, panel.transform, "p.dob", "РОЖД.: " + entrant.Passport.DateOfBirth, 226, 269, 206, 42, 16);
            AddFieldButton(app, panel.transform, "p.expiry", "ДЕЙСТВИТЕЛЕН ДО: " + entrant.Passport.Expiry, 18, 221, 414, 42, 16);
            AddFieldButton(app, panel.transform, "p.id", "№ ПАСПОРТА: " + entrant.Passport.Id, 18, 173, 414, 42, 16);
            AddFieldButton(app, panel.transform, "p.photo", "ФОТО: " + entrant.Passport.PhotoDescription, 18, 101, 414, 66, 15);
            AddFieldButton(app, panel.transform, "p.emblem", entrant.Passport.FakeAtom ? "ГЕРБ: АТОМ • 2 ОРБИТЫ" : "ГЕРБ: АТОМ • 3 ОРБИТЫ", 18, 35, 414, 56, 17);
        }

        private static void DrawPermitOrCard(GameApp app, Transform parent, EntrantData entrant)
        {
            GameObject panel = UiFactory.Panel(parent, "Дополнительные документы", 486, 390, 456, 465, Palette.Paper);
            if (entrant.Permit != null)
            {
                UiFactory.Text(panel.transform, "Название", "РАЗРЕШЕНИЕ НА ВЪЕЗД", 18, 415, 420, 36, 21, Palette.Ink, TextAnchor.MiddleCenter, FontStyle.Bold);
                AddFieldButton(app, panel.transform, "w.name", "ИМЯ: " + entrant.Permit.Name, 18, 355, 420, 44, 16, true);
                AddFieldButton(app, panel.transform, "w.passId", "№ ПАСПОРТА: " + entrant.Permit.PassportId, 18, 305, 420, 44, 16, true);
                AddFieldButton(app, panel.transform, "w.purpose", "ЦЕЛЬ: " + entrant.Permit.Purpose, 18, 255, 420, 44, 16, true);
                AddFieldButton(app, panel.transform, "w.duration", "СРОК: " + entrant.Permit.Duration, 18, 205, 420, 44, 16, true);
                AddFieldButton(app, panel.transform, "w.expiry", "ДЕЙСТВИТЕЛЬНО ДО: " + entrant.Permit.Expiry, 18, 155, 420, 44, 16, true);
            }
            else
            {
                UiFactory.Text(panel.transform, "Нет разрешения", "РАЗРЕШЕНИЕ\nНЕ ПРЕДЪЯВЛЕНО", 45, 255, 365, 120, 28, Palette.DarkRed, TextAnchor.MiddleCenter, FontStyle.Bold);
            }

            if (entrant.PartyCard != null)
            {
                UiFactory.Text(panel.transform, "Карта", "КАРТОЧКА КПТА  •  " + entrant.PartyCard.Name, 22, 100, 410, 42, 15, Palette.DarkRed, TextAnchor.MiddleCenter, FontStyle.Bold);
                AddFieldButton(app, panel.transform, "c.emblem",
                    entrant.PartyCard.Mirrored ? "ГЕРБ КПТА: МОЛОТ СПРАВА" : "ГЕРБ КПТА: МОЛОТ СЛЕВА",
                    22, 35, 410, 56, 16, true);
            }
        }

        private static void DrawReferences(GameApp app, Transform parent, DayConfig day, EntrantData entrant)
        {
            GameObject panel = UiFactory.Panel(parent, "Справочник", 18, 18, 924, 350, Palette.Panel);
            UiFactory.Text(panel.transform, "Название", "СЛУЖЕБНЫЙ СПРАВОЧНИК", 18, 305, 880, 32, 18, Palette.Gold, TextAnchor.MiddleLeft, FontStyle.Bold);
            AddFieldButton(app, panel.transform, "cal.today", "СЕГОДНЯ: " + day.DateShort, 18, 250, 270, 44, 16);
            AddFieldButton(app, panel.transform, "ref.atom", "ЭТАЛОН АССР: 3 ОРБИТЫ", 306, 250, 284, 44, 15);
            AddFieldButton(app, panel.transform, "ref.party", "ЭТАЛОН КПТА: МОЛОТ СПРАВА", 608, 250, 296, 44, 14);

            float x = 18f;
            float y = 190f;
            float width = 432f;
            for (int index = 0; index < day.Rules.Count; index++)
            {
                RuleData rule = day.Rules[index];
                AddFieldButton(app, panel.transform, "rule." + rule.Key, rule.Text, x, y, width, 52, 13);
                if (x < 100f) x = 472f; else { x = 18f; y -= 62f; }
            }

            if (entrant.PartyCard == null)
                UiFactory.Text(panel.transform, "Подсказка", "Поля подсвечиваются при выборе. Второй выбор заменяет самый старый.", 20, 8, 880, 30, 14, Palette.Ash, TextAnchor.MiddleCenter);
        }

        private static void DrawControls(GameApp app, Transform parent)
        {
            UiFactory.Text(parent, "Заголовок", "ПРОВЕРКА", 25, 850, 360, 46, 25, Palette.Gold, TextAnchor.MiddleCenter, FontStyle.Bold);
            string selection = app.SelectedFields.Count == 0
                ? "Выбери два поля"
                : "Выбрано: " + string.Join("  +  ", app.SelectedFields.ToArray());
            UiFactory.Text(parent, "Выбор", selection, 24, 760, 362, 80, 17, app.SelectedFields.Count == 2 ? Palette.Gold : Palette.Ash, TextAnchor.MiddleCenter);
            Button present = UiFactory.Button(parent, "Предъявить", "🔍  ПРЕДЪЯВИТЬ", 30, 695, 350, 58, Palette.Blue, app.PresentEvidence, 20);
            present.interactable = app.SelectedFields.Count == 2 && !app.DecisionMade && !app.WaitingForNext && app.CurrentDay.Number >= 2;
            Button clear = UiFactory.Button(parent, "Сброс", "СБРОСИТЬ ВЫБОР", 30, 635, 350, 44, Palette.Panel, app.ClearSelection, 15, Palette.Ash);
            clear.interactable = app.SelectedFields.Count > 0;

            string evidence = app.EvidenceProven ? "✓ НАРУШЕНИЕ ДОКАЗАНО" : "НАРУШЕНИЕ НЕ ДОКАЗАНО";
            UiFactory.Text(parent, "Статус", evidence, 20, 565, 370, 52, 17, app.EvidenceProven ? Palette.Red : Palette.Ash, TextAnchor.MiddleCenter, FontStyle.Bold);
            UiFactory.Text(parent, "Штампы", "ШТАМПЫ", 25, 505, 360, 42, 21, Palette.Paper, TextAnchor.MiddleCenter, FontStyle.Bold);

            Button deny = UiFactory.Button(parent, "Отказ", "ОТКАЗ", 30, 420, 350, 70, Palette.DarkRed, delegate { app.Decide(Decision.Deny); }, 27);
            Button detain = UiFactory.Button(parent, "Арест", "ЗАДЕРЖАТЬ", 30, 335, 350, 70, Palette.Hex("#6b5b18"), delegate { app.Decide(Decision.Detain); }, 24);
            Button admit = UiFactory.Button(parent, "Вход", "ПРОПУСТИТЬ", 30, 250, 350, 70, Palette.Moss, delegate { app.Decide(Decision.Admit); }, 24);
            bool canDecide = !app.WaitingForNext && !app.DecisionMade && app.OfferHandled;
            deny.interactable = canDecide;
            admit.interactable = canDecide;
            detain.gameObject.SetActive(app.CurrentDay.Number >= 3);
            detain.interactable = canDecide && app.EvidenceProven;

            if (app.DecisionMade)
            {
                UiFactory.Text(parent, "Решение", "ШТАМП ПОСТАВЛЕН\nВерни документы посетителю.", 30, 155, 350, 75, 18, Palette.Gold, TextAnchor.MiddleCenter, FontStyle.Bold);
                string label = app.EntrantIndex + 1 >= app.Entrants.Count ? "ЗАКРЫТЬ СМЕНУ" : "ВЕРНУТЬ ДОКУМЕНТЫ";
                UiFactory.Button(parent, "Дальше", label, 30, 65, 350, 72, Palette.Red, app.AdvanceEntrant, 21);
            }
            else
            {
                UiFactory.Text(parent, "Подсказка", app.CurrentDay.Number < 2
                    ? "В первую смену достаточно сверить страну с директивой."
                    : "Нажми на поле документа, затем на противоречащее правило или поле.",
                    25, 60, 360, 120, 16, Palette.Ash, TextAnchor.MiddleCenter);
            }
        }

        private static void DrawOffer(GameApp app, Transform root, EntrantData entrant)
        {
            GameObject shade = UiFactory.Panel(root, "Затемнение", 0, 0, 1920, 1080, new Color(0f, 0f, 0f, 0.82f), false);
            shade.transform.SetAsLastSibling();
            GameObject modal = UiFactory.Panel(shade.transform, "Тайное предложение", 420, 150, 1080, 780,
                entrant.AgentKind == "west" ? Palette.Hex("#202638") : Palette.Hex("#273022"));
            UiFactory.Text(modal.transform, "Тип", entrant.AgentKind == "west" ? "РАЗГОВОР ВПОЛГОЛОС  //  ОТЕПЛИЯ" : "РАЗГОВОР ВПОЛГОЛОС  //  КРАСНОСЛАВИЯ",
                50, 700, 980, 46, 22, Palette.Gold, TextAnchor.MiddleLeft, FontStyle.Bold);
            UiFactory.Text(modal.transform, "Имя", entrant.Passport.Name, 50, 650, 980, 36, 18, Palette.Ash, TextAnchor.MiddleLeft);
            UiFactory.Text(modal.transform, "Предложение", "«" + entrant.Offer.Prompt + "»", 55, 455, 970, 180, 25, Palette.Paper, TextAnchor.UpperLeft, FontStyle.Italic);

            float y = 355f;
            for (int index = 0; index < entrant.Offer.Options.Count; index++)
            {
                int captured = index;
                AgentOption option = entrant.Offer.Options[index];
                UiFactory.Button(modal.transform, "Вариант " + index, option.Label, 55, y, 970, 72, Palette.Panel,
                    delegate { app.ChooseOffer(captured); }, 21);
                y -= 88f;
            }
            UiFactory.Text(modal.transform, "Примечание", "Разговор не заменяет решения: документы всё равно придётся проштамповать.", 55, 25, 970, 42, 15, Palette.Ash, TextAnchor.MiddleCenter);
        }

        private static void AddFieldButton(GameApp app, Transform parent, string key, string label,
            float x, float y, float width, float height, int fontSize, bool paper = false)
        {
            bool selected = app.IsFieldSelected(key);
            Color normal = paper ? Palette.Hex("#b9a988") : Palette.Hex("#342c25");
            Color selectedColor = Palette.Hex("#9a7922");
            Button button = UiFactory.Button(parent, "Поле " + key, label, x, y, width, height,
                selected ? selectedColor : normal, delegate { app.ToggleField(key); }, fontSize,
                paper && !selected ? Palette.Ink : Palette.Paper);
            button.interactable = !app.DecisionMade && !app.WaitingForNext && app.CurrentDay.Number >= 2;
        }

        public static void ShowLedger(GameApp app)
        {
            DayConfig day = app.CurrentDay;
            DayResult result = app.Result;
            GameObject root = Begin(app, "Ведомость", Palette.Ink);
            GameObject paper = UiFactory.Panel(root.transform, "Ведомость", 430, 45, 1060, 990, Palette.Paper);
            UiFactory.Text(paper.transform, "Название", "ВЕДОМОСТЬ СМЕНЫ " + day.Number, 45, 910, 650, 56, 38, Palette.Ink, TextAnchor.MiddleLeft, FontStyle.Bold);
            UiFactory.Text(paper.transform, "Дата", "КПП-7  //  " + day.DateShort, 730, 910, 280, 56, 18, Palette.Line, TextAnchor.MiddleRight);
            UiFactory.Panel(paper.transform, "Линия", 40, 895, 980, 4, Palette.Ink, false);

            List<string> rows = new List<string>();
            rows.Add("Верных решений: " + result.Correct + " × " + GameDatabase.PayPerCorrect + " ₳<color=#2f5c33>                         +" + (result.Correct * GameDatabase.PayPerCorrect) + " ₳</color>");
            if (result.Evidence > 0) rows.Add("Доказано несоответствий: " + result.Evidence + "<color=#2f5c33>                         +" + result.EvidenceBonus + " ₳</color>");
            if (result.Detains > 0) rows.Add("Задержано врагов народа: " + result.Detains + "<color=#2f5c33>                         +" + result.DetainBonus + " ₳</color>");
            if (result.AgentCredits > 0) rows.Add("Конверты за разговоры<color=#8a6a1c>                         +" + result.AgentCredits + " ₳</color>");
            if (result.Errors.Count > 0) rows.Add("Протоколы: " + result.Errors.Count + " × " + GameDatabase.ErrorFine + " ₳<color=#7c1d18>                         −" + (result.Errors.Count * GameDatabase.ErrorFine) + " ₳</color>");
            foreach (ExpenseData expense in day.Expenses)
            {
                bool heating = expense.Label.ToLowerInvariant().StartsWith("отоплен");
                rows.Add(heating && app.HeatSkipped
                    ? expense.Label + " — ОТКЛЮЧЕНО<color=#6b5d4e>                         0 ₳</color>"
                    : expense.Label + "<color=#7c1d18>                         −" + expense.Amount + " ₳</color>");
            }

            float y = 835f;
            foreach (string row in rows)
            {
                UiFactory.Text(paper.transform, "Строка", row, 55, y, 950, 42, 21, Palette.Ink, TextAnchor.MiddleLeft);
                UiFactory.Panel(paper.transform, "Пунктир", 55, y - 4, 950, 1, new Color(Palette.Line.r, Palette.Line.g, Palette.Line.b, 0.35f), false);
                y -= 50f;
            }

            if (result.Errors.Count > 0)
            {
                StringBuilder errors = new StringBuilder("ПРОТОКОЛЫ ДНЯ\n");
                int count = Math.Min(6, result.Errors.Count);
                for (int index = 0; index < count; index++) errors.Append("— ").Append(result.Errors[index]).AppendLine();
                if (result.Errors.Count > count) errors.Append("— и ещё ").Append(result.Errors.Count - count);
                GameObject errorPanel = UiFactory.Panel(paper.transform, "Ошибки", 55, 330, 950, 190, Palette.Hex("#c8ad8d"));
                UiFactory.Text(errorPanel.transform, "Список", errors.ToString(), 20, 14, 910, 162, 17, Palette.DarkRed, TextAnchor.UpperLeft, FontStyle.Bold);
            }

            UiFactory.Button(paper.transform, "Отопление",
                app.HeatSkipped ? "ОТОПЛЕНИЕ ОТКЛЮЧЕНО — СЕМЬЯ МЁРЗНЕТ  (+4 ₳)" : "ОТОПЛЕНИЕ ВКЛЮЧЕНО  (−4 ₳)  •  НАЖМИ, ЧТОБЫ СЭКОНОМИТЬ",
                55, 245, 950, 62, app.HeatSkipped ? Palette.Blue : Palette.DarkRed, app.ToggleHeating, 18);

            bool broke = app.LedgerTotal < 0;
            UiFactory.Text(paper.transform, "Итог", "ИТОГ ДОМА: " + app.LedgerTotal + " ₳", 55, 155, 600, 72, 34,
                broke ? Palette.DarkRed : Palette.Hex("#2f5c33"), TextAnchor.MiddleLeft, FontStyle.Bold);
            string next = broke ? "СВЕРИТЬ ДОЛГ..." : (app.Save.DayIndex >= GameDatabase.Days.Count - 1 ? "ИТОГИ СЛУЖБЫ" : "ЛЕЧЬ СПАТЬ  //  СМЕНА " + (day.Number + 1));
            UiFactory.Button(paper.transform, "Продолжить", next, 55, 45, 950, 76, Palette.Red, app.ContinueFromLedger, 24);
        }

        public static void ShowEnding(GameApp app, EndingData ending)
        {
            GameObject root = Begin(app, "Финал", Palette.Ink);
            GameObject panel = UiFactory.Panel(root.transform, "Финал", 340, 75, 1240, 930, Palette.Panel);
            UiFactory.Text(panel.transform, "Метка", "ИТОГ СЛУЖБЫ НА КПП-7", 50, 845, 1140, 40, 18, Palette.Ash, TextAnchor.MiddleCenter, FontStyle.Bold);
            UiFactory.Text(panel.transform, "Название", ending.Title, 55, 745, 1130, 90, 54, Palette.Hex(ending.Tone), TextAnchor.MiddleCenter, FontStyle.Bold);
            StringBuilder lines = new StringBuilder();
            foreach (string line in ending.Lines) lines.AppendLine(line).AppendLine();
            UiFactory.Text(panel.transform, "Текст", lines.ToString(), 90, 315, 1060, 410, 25, Palette.Bone, TextAnchor.UpperLeft);
            string stats = "ВЕРНЫХ: " + app.Save.Totals.Correct + "     ПРОТОКОЛОВ: " + app.Save.Totals.Errors +
                           "     ДОКАЗАНО: " + app.Save.Totals.Evidence + "     ЗАДЕРЖАНО: " + app.Save.Totals.Detains +
                           "     НА РУКАХ: " + app.Save.Credits + " ₳";
            UiFactory.Text(panel.transform, "Статистика", stats, 50, 230, 1140, 52, 18, Palette.Ash, TextAnchor.MiddleCenter, FontStyle.Bold);
            UiFactory.Button(panel.transform, "В меню", "В ГЛАВНОЕ МЕНЮ", 340, 80, 560, 82, Palette.Red, app.ShowTitle, 25);
        }

        public static void ShowGameOver(GameApp app)
        {
            GameObject root = Begin(app, "Конец игры", Palette.Hex("#090706"));
            UiFactory.Text(root.transform, "Название", "ЛИШЕНИЕ ПАЙКА", 350, 740, 1220, 100, 58, Palette.Red, TextAnchor.MiddleCenter, FontStyle.Bold);
            string body =
                "Баланс семьи ушёл в минус. Министерство не прощает должников.\n\n" +
                "Квартира отошла блоку. Сын плачет у остывшей печки. Комиссар смотрит в сторону.\n\n" +
                "Тебя перевели на урановый рудник за Северным Тупиком.\n\n" +
                "Там тоже проверяют документы. Только очередь — из вагонеток.";
            UiFactory.Text(root.transform, "Текст", body, 470, 315, 980, 380, 28, Palette.Ash, TextAnchor.MiddleCenter);
            UiFactory.Button(root.transform, "В меню", "В ГЛАВНОЕ МЕНЮ", 710, 150, 500, 80, Palette.DarkRed, app.ShowTitle, 24);
        }

        private static GameObject Begin(GameApp app, string name, Color color)
        {
            UiFactory.ClearChildren(app.ViewRoot);
            return UiFactory.Screen(app.ViewRoot, name, color);
        }

        private static void Header(Transform root, string left, string middle, string right)
        {
            UiFactory.Panel(root, "Шапка", 0, 1010, 1920, 70, Palette.Coal, false);
            UiFactory.Text(root, "Левая шапка", left, 28, 1018, 500, 50, 23, Palette.Gold, TextAnchor.MiddleLeft, FontStyle.Bold);
            UiFactory.Text(root, "Центр шапки", middle, 520, 1018, 900, 50, 18, Palette.Ash, TextAnchor.MiddleCenter);
            UiFactory.Text(root, "Правая шапка", right, 1430, 1018, 450, 50, 20, Palette.Paper, TextAnchor.MiddleRight, FontStyle.Bold);
        }
    }
}
