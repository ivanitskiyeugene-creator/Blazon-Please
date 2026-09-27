using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace BlazonPlease.Editor
{
    public static class BuildWindows
    {
        private const string ScenePath = "Assets/Scenes/Main.unity";

        [MenuItem("Blazon Please/Build/Windows x86_64")]
        public static void Build()
        {
            string outputDirectory = Path.GetFullPath(Path.Combine(Application.dataPath, "../Builds/Windows"));
            Directory.CreateDirectory(outputDirectory);

            PlayerSettings.companyName = "Blazon Please";
            PlayerSettings.productName = "Гербы, пожалуйста!";
            PlayerSettings.bundleVersion = GameDatabase.Version;
            PlayerSettings.defaultScreenWidth = 1920;
            PlayerSettings.defaultScreenHeight = 1080;
            PlayerSettings.fullScreenMode = FullScreenMode.FullScreenWindow;
            PlayerSettings.resizableWindow = true;

            BuildPlayerOptions options = new BuildPlayerOptions
            {
                scenes = new[] { ScenePath },
                locationPathName = Path.Combine(outputDirectory, "BlazonPlease.exe"),
                target = BuildTarget.StandaloneWindows64,
                options = BuildOptions.None
            };

            BuildReport report = BuildPipeline.BuildPlayer(options);
            if (report.summary.result == BuildResult.Succeeded)
            {
                Debug.Log("Windows-сборка готова: " + options.locationPathName);
                EditorUtility.RevealInFinder(outputDirectory);
            }
            else
            {
                Debug.LogError("Сборка завершилась со статусом: " + report.summary.result);
            }
        }
    }
}
