using System;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.EventSystems;
using UnityEngine.UI;

namespace BlazonPlease
{
    public static class Palette
    {
        public static readonly Color Ink = Hex("#120f0c");
        public static readonly Color Coal = Hex("#1d1815");
        public static readonly Color Panel = Hex("#29231e");
        public static readonly Color Line = Hex("#594c40");
        public static readonly Color Paper = Hex("#d8c9a8");
        public static readonly Color Bone = Hex("#cbb89a");
        public static readonly Color Ash = Hex("#8a7e74");
        public static readonly Color Gold = Hex("#e8c34a");
        public static readonly Color Red = Hex("#a62822");
        public static readonly Color DarkRed = Hex("#5e1715");
        public static readonly Color Moss = Hex("#58724d");
        public static readonly Color Blue = Hex("#48577d");

        public static Color Hex(string value)
        {
            Color color;
            return ColorUtility.TryParseHtmlString(value, out color) ? color : Color.white;
        }
    }

    public static class UiFactory
    {
        private static Font _font;

        public static Font DefaultFont
        {
            get
            {
                if (_font != null) return _font;
                _font = UnityEngine.Font.CreateDynamicFontFromOSFont(
                    new[] { "Segoe UI", "Arial", "Liberation Sans", "DejaVu Sans" }, 24);
                if (_font == null) _font = Resources.GetBuiltinResource<Font>("Arial.ttf");
                return _font;
            }
        }

        public static Canvas CreateCanvas(Transform parent)
        {
            GameObject canvasObject = new GameObject("Main Canvas", typeof(RectTransform), typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
            canvasObject.transform.SetParent(parent, false);
            Canvas canvas = canvasObject.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = 0;
            CanvasScaler scaler = canvasObject.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1920f, 1080f);
            scaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
            scaler.matchWidthOrHeight = 0.5f;
            return canvas;
        }

        public static void EnsureEventSystem()
        {
            if (UnityEngine.Object.FindObjectOfType<EventSystem>() != null) return;
            new GameObject("EventSystem", typeof(EventSystem), typeof(StandaloneInputModule));
        }

        public static GameObject Screen(Transform parent, string name, Color color)
        {
            GameObject go = new GameObject(name, typeof(RectTransform), typeof(Image));
            go.transform.SetParent(parent, false);
            RectTransform rect = go.GetComponent<RectTransform>();
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            go.GetComponent<Image>().color = color;
            return go;
        }

        public static GameObject Panel(Transform parent, string name, float x, float y, float width, float height, Color color, bool border = true)
        {
            GameObject go = new GameObject(name, typeof(RectTransform), typeof(Image));
            go.transform.SetParent(parent, false);
            SetRect(go.GetComponent<RectTransform>(), x, y, width, height);
            Image image = go.GetComponent<Image>();
            image.color = color;
            if (border)
            {
                Outline outline = go.AddComponent<Outline>();
                outline.effectColor = Palette.Line;
                outline.effectDistance = new Vector2(2f, -2f);
            }
            return go;
        }

        public static Text Text(
            Transform parent,
            string name,
            string value,
            float x,
            float y,
            float width,
            float height,
            int fontSize,
            Color color,
            TextAnchor alignment = TextAnchor.MiddleLeft,
            FontStyle style = FontStyle.Normal)
        {
            GameObject go = new GameObject(name, typeof(RectTransform), typeof(Text));
            go.transform.SetParent(parent, false);
            SetRect(go.GetComponent<RectTransform>(), x, y, width, height);
            Text text = go.GetComponent<Text>();
            text.font = DefaultFont;
            text.text = value;
            text.fontSize = fontSize;
            text.color = color;
            text.alignment = alignment;
            text.fontStyle = style;
            text.supportRichText = true;
            text.horizontalOverflow = HorizontalWrapMode.Wrap;
            text.verticalOverflow = VerticalWrapMode.Truncate;
            text.raycastTarget = false;
            return text;
        }

        public static Button Button(
            Transform parent,
            string name,
            string label,
            float x,
            float y,
            float width,
            float height,
            Color color,
            UnityAction onClick,
            int fontSize = 22,
            Color? textColor = null)
        {
            GameObject go = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(Button));
            go.transform.SetParent(parent, false);
            SetRect(go.GetComponent<RectTransform>(), x, y, width, height);
            Image image = go.GetComponent<Image>();
            image.color = color;
            Outline outline = go.AddComponent<Outline>();
            outline.effectColor = Palette.Line;
            outline.effectDistance = new Vector2(2f, -2f);

            Button button = go.GetComponent<Button>();
            ColorBlock colors = button.colors;
            colors.normalColor = color;
            colors.highlightedColor = Lighten(color, 0.16f);
            colors.pressedColor = Lighten(color, 0.28f);
            colors.selectedColor = Lighten(color, 0.12f);
            colors.disabledColor = new Color(color.r, color.g, color.b, 0.32f);
            colors.colorMultiplier = 1f;
            colors.fadeDuration = 0.08f;
            button.colors = colors;
            if (onClick != null) button.onClick.AddListener(onClick);

            Text text = Text(go.transform, "Label", label, 8f, 4f, width - 16f, height - 8f, fontSize,
                textColor ?? Palette.Paper, TextAnchor.MiddleCenter, FontStyle.Bold);
            text.resizeTextForBestFit = true;
            text.resizeTextMinSize = Math.Max(10, fontSize - 8);
            text.resizeTextMaxSize = fontSize;
            return button;
        }

        public static RawImage RawImage(Transform parent, string name, Texture texture, float x, float y, float width, float height, Color color)
        {
            GameObject go = new GameObject(name, typeof(RectTransform), typeof(RawImage));
            go.transform.SetParent(parent, false);
            SetRect(go.GetComponent<RectTransform>(), x, y, width, height);
            RawImage image = go.GetComponent<RawImage>();
            image.texture = texture;
            image.color = color;
            return image;
        }

        public static void SetRect(RectTransform rect, float x, float y, float width, float height)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.zero;
            rect.pivot = Vector2.zero;
            rect.anchoredPosition = new Vector2(x, y);
            rect.sizeDelta = new Vector2(width, height);
        }

        public static void ClearChildren(Transform parent)
        {
            for (int index = parent.childCount - 1; index >= 0; index--)
            {
                GameObject child = parent.GetChild(index).gameObject;
                child.SetActive(false);
                UnityEngine.Object.Destroy(child);
            }
        }

        public static Color Lighten(Color color, float amount)
        {
            return Color.Lerp(color, Color.white, amount);
        }
    }
}
