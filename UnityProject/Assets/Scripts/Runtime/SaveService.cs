using System;
using System.IO;
using UnityEngine;

namespace BlazonPlease
{
    public static class SaveService
    {
        private const int SaveVersion = 1;
        private const string FileName = "kpp7-save.json";

        public static string SavePath
        {
            get { return Path.Combine(Application.persistentDataPath, FileName); }
        }

        public static SaveData Load()
        {
            try
            {
                if (!File.Exists(SavePath)) return null;
                SaveData data = JsonUtility.FromJson<SaveData>(File.ReadAllText(SavePath));
                if (data == null || data.Version != SaveVersion) return null;
                if (data.DayIndex < 0 || data.DayIndex >= GameDatabase.Days.Count) return null;
                if (data.Flags == null) data.Flags = new FlagsData();
                if (data.Totals == null) data.Totals = new TotalsData();
                return data;
            }
            catch (Exception exception)
            {
                Debug.LogWarning("Не удалось прочитать сохранение: " + exception.Message);
                return null;
            }
        }

        public static void Write(SaveData data)
        {
            try
            {
                data.Version = SaveVersion;
                data.SavedAtUnix = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                string directory = Path.GetDirectoryName(SavePath);
                if (!string.IsNullOrEmpty(directory)) Directory.CreateDirectory(directory);
                File.WriteAllText(SavePath, JsonUtility.ToJson(data, true));
            }
            catch (Exception exception)
            {
                Debug.LogWarning("Не удалось записать сохранение: " + exception.Message);
            }
        }

        public static void Clear()
        {
            try
            {
                if (File.Exists(SavePath)) File.Delete(SavePath);
            }
            catch (Exception exception)
            {
                Debug.LogWarning("Не удалось удалить сохранение: " + exception.Message);
            }
        }

        public static string Age(long unixSeconds)
        {
            if (unixSeconds <= 0) return "недавно";
            TimeSpan age = DateTimeOffset.UtcNow - DateTimeOffset.FromUnixTimeSeconds(unixSeconds);
            if (age.TotalMinutes < 1) return "только что";
            if (age.TotalHours < 1) return ((int)age.TotalMinutes) + " мин. назад";
            if (age.TotalDays < 1) return ((int)age.TotalHours) + " ч. назад";
            return ((int)age.TotalDays) + " дн. назад";
        }
    }
}
