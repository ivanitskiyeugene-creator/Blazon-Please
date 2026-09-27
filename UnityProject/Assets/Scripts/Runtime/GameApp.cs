using System;
using System.Collections.Generic;
using UnityEngine;

namespace BlazonPlease
{
    public sealed class GameBootstrap
    {
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        private static void StartGame()
        {
            if (UnityEngine.Object.FindObjectOfType<GameApp>() != null) return;
            GameObject root = new GameObject("Blazon Please");
            root.AddComponent<GameApp>();
        }
    }

    public sealed class GameApp : MonoBehaviour
    {
        public Transform ViewRoot { get; private set; }
        public SaveData Save { get; private set; }
        public DayConfig CurrentDay { get { return GameDatabase.Days[Save.DayIndex]; } }
        public List<EntrantData> Entrants { get; private set; }
        public int EntrantIndex { get; private set; }
        public EntrantData CurrentEntrant
        {
            get { return Entrants != null && EntrantIndex >= 0 && EntrantIndex < Entrants.Count ? Entrants[EntrantIndex] : null; }
        }
        public bool WaitingForNext { get; private set; }
        public bool DecisionMade { get; private set; }
        public bool EvidenceProven { get; private set; }
        public bool OfferHandled { get; private set; }
        public string Reaction { get; private set; }
        public List<string> SelectedFields { get; private set; } = new List<string>();
        public DayResult Result { get; private set; }
        public List<NoticeData> Notices { get; private set; } = new List<NoticeData>();
        public bool HeatSkipped { get; private set; }
        public int LedgerTotal { get { return CalculateLedgerTotal(HeatSkipped); } }

        private SaveData _menuSave;
        private SfxPlayer _sfx;

        private void Awake()
        {
            Application.targetFrameRate = 60;
            Screen.fullScreenMode = FullScreenMode.FullScreenWindow;
            UiFactory.EnsureEventSystem();
            Canvas canvas = UiFactory.CreateCanvas(transform);
            ViewRoot = canvas.transform;
            _sfx = gameObject.AddComponent<SfxPlayer>();
            _menuSave = SaveService.Load();
        }

        private void Start()
        {
            ShowTitle();
        }

        public void ShowTitle()
        {
            _menuSave = SaveService.Load();
            GameScreens.ShowTitle(this, _menuSave);
        }

        public void StartNewGame()
        {
            _sfx.Stamp();
            Save = new SaveData
            {
                Seed = UnityEngine.Random.Range(1, 1000001),
                DayIndex = 0,
                Credits = GameDatabase.StartCredits,
                Flags = new FlagsData(),
                Totals = new TotalsData(),
                HeatStreak = 0
            };
            Notices = new List<NoticeData>();
            SaveService.Write(Save);
            ShowBriefing();
        }

        public void ContinueGame()
        {
            SaveData loaded = SaveService.Load();
            if (loaded == null)
            {
                ShowTitle();
                return;
            }
            _sfx.Ui();
            Save = loaded;
            Notices = new List<NoticeData>();
            ShowBriefing();
        }

        public void DeleteSave()
        {
            _sfx.Bad();
            SaveService.Clear();
            _menuSave = null;
            ShowTitle();
        }

        public void ShowBriefing()
        {
            GameScreens.ShowBriefing(this);
        }

        public void OpenCheckpoint()
        {
            _sfx.Stamp();
            Entrants = GameGenerator.BuildDay(Save.Seed, CurrentDay, Save.Flags);
            EntrantIndex = 0;
            Result = new DayResult();
            WaitingForNext = true;
            ResetEntrantState();
            WaitingForNext = true;
            GameScreens.ShowGame(this);
        }

        public void CallNext()
        {
            if (!WaitingForNext || CurrentEntrant == null) return;
            _sfx.Ui();
            WaitingForNext = false;
            DecisionMade = false;
            EvidenceProven = false;
            OfferHandled = CurrentEntrant.Offer == null;
            SelectedFields.Clear();
            Reaction = CurrentEntrant.Dialogue;
            GameScreens.ShowGame(this);
        }

        public void Interrogate()
        {
            if (WaitingForNext || DecisionMade || CurrentEntrant == null) return;
            _sfx.Ui();
            Reaction = CurrentEntrant.Interrogate;
            GameScreens.ShowGame(this);
        }

        public void ToggleField(string field)
        {
            if (WaitingForNext || DecisionMade || CurrentDay.Number < 2) return;
            _sfx.Ui();
            if (SelectedFields.Contains(field))
            {
                SelectedFields.Remove(field);
            }
            else
            {
                if (SelectedFields.Count >= 2) SelectedFields.RemoveAt(0);
                SelectedFields.Add(field);
            }
            GameScreens.ShowGame(this);
        }

        public bool IsFieldSelected(string field)
        {
            return SelectedFields.Contains(field);
        }

        public void ClearSelection()
        {
            SelectedFields.Clear();
            GameScreens.ShowGame(this);
        }

        public void PresentEvidence()
        {
            if (CurrentEntrant == null || SelectedFields.Count != 2 || DecisionMade) return;
            bool correct = false;
            foreach (FieldPair pair in CurrentEntrant.Mismatches)
            {
                if (pair.Matches(SelectedFields[0], SelectedFields[1]))
                {
                    correct = true;
                    break;
                }
            }

            SelectedFields.Clear();
            if (correct)
            {
                _sfx.Bad();
                if (!EvidenceProven)
                {
                    Result.Evidence++;
                    Result.EvidenceBonus += GameDatabase.EvidenceBonus;
                }
                EvidenceProven = true;
                Reaction = string.IsNullOrEmpty(CurrentEntrant.Caught) ? "Это... это ничего не значит!" : CurrentEntrant.Caught;
            }
            else
            {
                _sfx.Bad();
                Reaction = GameDatabase.WrongEvidence[EntrantIndex % GameDatabase.WrongEvidence.Length];
            }
            GameScreens.ShowGame(this);
        }

        public void ChooseOffer(int optionIndex)
        {
            EntrantData entrant = CurrentEntrant;
            if (entrant == null || entrant.Offer == null || OfferHandled) return;
            if (optionIndex < 0 || optionIndex >= entrant.Offer.Options.Count) return;
            AgentOption option = entrant.Offer.Options[optionIndex];
            Result.Flags.WestTrust += option.West;
            Result.Flags.NeighborTrust += option.Neighbor;
            Result.Flags.Loyalty += option.Loyalty;
            Result.AgentCredits += option.Credits;
            if (!string.IsNullOrEmpty(option.FinalChoice) &&
                (option.FinalChoice != "loyal" || string.IsNullOrEmpty(Result.Flags.FinalChoice)))
            {
                Result.Flags.FinalChoice = option.FinalChoice;
            }
            if (entrant.AgentKind == "west") Result.Flags.MetWest = true;
            if (entrant.AgentKind == "neighbor") Result.Flags.MetNeighbor = true;
            OfferHandled = true;
            Reaction = option.Reply;
            if (option.Credits > 0) _sfx.Coin(); else _sfx.Ui();
            GameScreens.ShowGame(this);
        }

        public void Decide(Decision decision)
        {
            EntrantData entrant = CurrentEntrant;
            if (entrant == null || WaitingForNext || DecisionMade || !OfferHandled) return;
            if (decision == Decision.Detain && (!EvidenceProven || CurrentDay.Number < 3)) return;

            _sfx.Stamp();
            DecisionMade = true;
            if (decision == Decision.Detain)
            {
                if (entrant.Detainable)
                {
                    Result.Detains++;
                    Result.DetainBonus += GameDatabase.DetainBonus;
                    Reaction = string.IsNullOrEmpty(entrant.ReactionDeny) ? "Меня свяжут с адвокатом!" : entrant.ReactionDeny;
                }
                else
                {
                    Result.Errors.Add("Ошибочное задержание невиновного: жалоба ушла в Обком");
                    Reaction = string.IsNullOrEmpty(entrant.ReactionDeny) ? "Это произвол! Честный человек!" : entrant.ReactionDeny;
                }
            }
            else if (decision == entrant.Expected)
            {
                Result.Correct++;
                if (decision == Decision.Admit)
                {
                    Reaction = string.IsNullOrEmpty(entrant.ReactionAdmit)
                        ? GameDatabase.GenericAdmit[(EntrantIndex + 1) % GameDatabase.GenericAdmit.Length]
                        : entrant.ReactionAdmit;
                }
                else
                {
                    Reaction = string.IsNullOrEmpty(entrant.ReactionDeny)
                        ? GameDatabase.GenericDeny[(EntrantIndex + 2) % GameDatabase.GenericDeny.Length]
                        : entrant.ReactionDeny;
                }
            }
            else
            {
                Result.Errors.Add(entrant.Citation);
                Reaction = decision == Decision.Admit
                    ? (string.IsNullOrEmpty(entrant.ReactionAdmit) ? GameDatabase.GenericAdmit[EntrantIndex % GameDatabase.GenericAdmit.Length] : entrant.ReactionAdmit)
                    : (string.IsNullOrEmpty(entrant.ReactionDeny) ? GameDatabase.GenericDeny[EntrantIndex % GameDatabase.GenericDeny.Length] : entrant.ReactionDeny);
            }
            GameScreens.ShowGame(this);
        }

        public void AdvanceEntrant()
        {
            if (!DecisionMade) return;
            EntrantIndex++;
            if (Entrants == null || EntrantIndex >= Entrants.Count)
            {
                FinishDay();
                return;
            }
            ResetEntrantState();
            WaitingForNext = true;
            GameScreens.ShowGame(this);
        }

        public void ExitToMenu()
        {
            _sfx.Ui();
            ShowTitle();
        }

        public void ToggleHeating()
        {
            _sfx.Ui();
            HeatSkipped = !HeatSkipped;
            GameScreens.ShowLedger(this);
        }

        public void ContinueFromLedger()
        {
            _sfx.Stamp();
            int balance = LedgerTotal;
            Save.Credits = balance;
            if (balance < 0)
            {
                SaveService.Clear();
                GameScreens.ShowGameOver(this);
                return;
            }

            if (Save.DayIndex >= GameDatabase.Days.Count - 1)
            {
                SaveService.Clear();
                GameScreens.ShowEnding(this, GameDatabase.PickEnding(Save.Flags, Save.Totals));
                return;
            }

            Save.HeatStreak = HeatSkipped ? Save.HeatStreak + 1 : 0;
            Notices = new List<NoticeData>();
            if (Save.HeatStreak == 1)
            {
                Notices.Add(new NoticeData("Печь в бараке холодная. Семья куталась всю ночь. Ещё одна такая — простуда."));
            }
            else if (Save.HeatStreak >= 2)
            {
                Notices.Add(new NoticeData("СЫН ПРОСТУДИЛСЯ. Лекарства добываются по-мародёрски дорого.", -6));
                Save.HeatStreak = 0;
            }

            int nextDay = Save.DayIndex + 1;
            if (Save.Flags.WestTrust >= 3 && GameDatabase.Days[nextDay].Number >= 5)
                Notices.Add(new NoticeData("СЛУЖБА БДИТЕЛЬНОСТИ заметила беседы с иностранным атташе."));
            if (Save.Flags.NeighborTrust >= 3 && GameDatabase.Days[nextDay].Number >= 5)
                Notices.Add(new NoticeData("ПАТРУЛЬ У РЕКИ УСИЛЕН. На третьем причале видели чужую лодку."));
            if (Save.Flags.Bribe)
                Notices.Add(new NoticeData("Министерство изъяло подозрительные средства соратника поста.", -10));

            foreach (NoticeData notice in Notices) Save.Credits += notice.Amount;
            Save.DayIndex = nextDay;
            SaveService.Write(Save);
            ShowBriefing();
        }

        public int CalculateLedgerTotal(bool heatSkipped)
        {
            if (Save == null || Result == null) return 0;
            int expenses = 0;
            foreach (ExpenseData expense in CurrentDay.Expenses)
            {
                bool heating = expense.Label.ToLowerInvariant().StartsWith("отоплен");
                if (!(heatSkipped && heating)) expenses += expense.Amount;
            }
            int pay = Result.Correct * GameDatabase.PayPerCorrect;
            int fine = Result.Errors.Count * GameDatabase.ErrorFine;
            return Save.Credits + pay + Result.BribeGain + Result.DetainBonus + Result.EvidenceBonus + Result.AgentCredits - fine - expenses;
        }

        private void ResetEntrantState()
        {
            DecisionMade = false;
            EvidenceProven = false;
            OfferHandled = true;
            Reaction = "";
            SelectedFields.Clear();
        }

        private void FinishDay()
        {
            Save.Flags.Apply(Result.Flags);
            Save.Totals.Correct += Result.Correct;
            Save.Totals.Errors += Result.Errors.Count;
            Save.Totals.Detains += Result.Detains;
            Save.Totals.Evidence += Result.Evidence;
            HeatSkipped = false;
            GameScreens.ShowLedger(this);
        }
    }
}
