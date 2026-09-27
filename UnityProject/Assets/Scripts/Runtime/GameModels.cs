using System;
using System.Collections.Generic;

namespace BlazonPlease
{
    public enum CountryCode { ASSR, KRS, ZPS, UGS, STV }
    public enum Sex { M, F }
    public enum Decision { Admit, Deny, Detain }
    public enum ViolationKind
    {
        None,
        ForeignNoPermit,
        PassportExpired,
        PermitExpired,
        NameMismatch,
        IdMismatch,
        WestBanned,
        FakeAtom,
        FakeParty,
        PhotoMismatch,
        SexMismatch
    }

    [Serializable]
    public sealed class RuleData
    {
        public string Key;
        public string Text;
        public bool IsNew;

        public RuleData(string key, string text, bool isNew = false)
        {
            Key = key;
            Text = text;
            IsNew = isNew;
        }
    }

    [Serializable]
    public sealed class ExpenseData
    {
        public string Label;
        public int Amount;

        public ExpenseData(string label, int amount)
        {
            Label = label;
            Amount = amount;
        }
    }

    [Serializable]
    public sealed class DayConfig
    {
        public int Number;
        public string Date;
        public string DateShort;
        public string Headline;
        public string Subline;
        public string Body;
        public List<RuleData> Rules;
        public List<ExpenseData> Expenses;
        public int EntrantCount;
        public List<ViolationKind> Violations;

        public DayConfig(
            int number,
            string date,
            string dateShort,
            string headline,
            string subline,
            string body,
            List<RuleData> rules,
            List<ExpenseData> expenses,
            int entrantCount,
            List<ViolationKind> violations)
        {
            Number = number;
            Date = date;
            DateShort = dateShort;
            Headline = headline;
            Subline = subline;
            Body = body;
            Rules = rules;
            Expenses = expenses;
            EntrantCount = entrantCount;
            Violations = violations;
        }
    }

    [Serializable]
    public sealed class PassportData
    {
        public CountryCode Country;
        public string Name;
        public Sex Sex;
        public string DateOfBirth;
        public string Expiry;
        public string Id;
        public bool FakeAtom;
        public string PhotoDescription;
    }

    [Serializable]
    public sealed class PermitData
    {
        public string Name;
        public string PassportId;
        public string Purpose;
        public string Duration;
        public string Expiry;
    }

    [Serializable]
    public sealed class PartyCardData
    {
        public string Name;
        public string Rank;
        public bool Mirrored;
    }

    [Serializable]
    public sealed class FieldPair
    {
        public string First;
        public string Second;

        public FieldPair(string first, string second)
        {
            First = first;
            Second = second;
        }

        public bool Matches(string a, string b)
        {
            return (First == a && Second == b) || (First == b && Second == a);
        }
    }

    [Serializable]
    public sealed class AgentOption
    {
        public string Label;
        public string Reply;
        public int West;
        public int Neighbor;
        public int Loyalty;
        public int Credits;
        public string FinalChoice;

        public AgentOption(
            string label,
            string reply,
            int west = 0,
            int neighbor = 0,
            int loyalty = 0,
            int credits = 0,
            string finalChoice = "")
        {
            Label = label;
            Reply = reply;
            West = west;
            Neighbor = neighbor;
            Loyalty = loyalty;
            Credits = credits;
            FinalChoice = finalChoice;
        }
    }

    [Serializable]
    public sealed class AgentOffer
    {
        public string Prompt;
        public List<AgentOption> Options;

        public AgentOffer(string prompt, List<AgentOption> options)
        {
            Prompt = prompt;
            Options = options;
        }
    }

    [Serializable]
    public sealed class EntrantData
    {
        public string Dialogue;
        public string Interrogate;
        public string ReactionAdmit;
        public string ReactionDeny;
        public PassportData Passport;
        public PermitData Permit;
        public PartyCardData PartyCard;
        public string PersonDescription;
        public Sex ActualSex;
        public Decision Expected;
        public string Citation;
        public string Caught;
        public bool Detainable;
        public ViolationKind Violation;
        public List<FieldPair> Mismatches = new List<FieldPair>();
        public string AgentKind;
        public AgentOffer Offer;
    }

    [Serializable]
    public sealed class FlagsData
    {
        public bool Bribe;
        public int WestTrust;
        public int NeighborTrust;
        public int Loyalty;
        public string FinalChoice = "";
        public bool MetWest;
        public bool MetNeighbor;

        public void Apply(FlagsData delta)
        {
            if (delta == null) return;
            Bribe |= delta.Bribe;
            WestTrust += delta.WestTrust;
            NeighborTrust += delta.NeighborTrust;
            Loyalty += delta.Loyalty;
            MetWest |= delta.MetWest;
            MetNeighbor |= delta.MetNeighbor;
            if (!string.IsNullOrEmpty(delta.FinalChoice) &&
                (delta.FinalChoice != "loyal" || string.IsNullOrEmpty(FinalChoice)))
            {
                FinalChoice = delta.FinalChoice;
            }
        }
    }

    [Serializable]
    public sealed class TotalsData
    {
        public int Correct;
        public int Errors;
        public int Detains;
        public int Evidence;
    }

    [Serializable]
    public sealed class DayResult
    {
        public int Correct;
        public List<string> Errors = new List<string>();
        public int BribeGain;
        public int Detains;
        public int DetainBonus;
        public int Evidence;
        public int EvidenceBonus;
        public int AgentCredits;
        public FlagsData Flags = new FlagsData();
    }

    [Serializable]
    public sealed class SaveData
    {
        public int Version = 1;
        public int Seed;
        public int DayIndex;
        public int Credits;
        public FlagsData Flags = new FlagsData();
        public TotalsData Totals = new TotalsData();
        public int HeatStreak;
        public long SavedAtUnix;
    }

    [Serializable]
    public sealed class NoticeData
    {
        public string Text;
        public int Amount;

        public NoticeData(string text, int amount = 0)
        {
            Text = text;
            Amount = amount;
        }
    }

    public sealed class EndingData
    {
        public string Key;
        public string Title;
        public string Tone;
        public string[] Lines;

        public EndingData(string key, string title, string tone, string[] lines)
        {
            Key = key;
            Title = title;
            Tone = tone;
            Lines = lines;
        }
    }
}
