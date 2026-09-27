using UnityEngine;

namespace BlazonPlease
{
    [RequireComponent(typeof(AudioSource))]
    public sealed class SfxPlayer : MonoBehaviour
    {
        private AudioSource _source;
        private AudioClip _ui;
        private AudioClip _stamp;
        private AudioClip _bad;
        private AudioClip _coin;

        private void Awake()
        {
            _source = GetComponent<AudioSource>();
            _source.playOnAwake = false;
            _ui = MakeTone("ui", 680f, 0.045f, 0.13f, false);
            _stamp = MakeTone("stamp", 105f, 0.13f, 0.24f, true);
            _bad = MakeTone("bad", 175f, 0.22f, 0.18f, true);
            _coin = MakeTone("coin", 980f, 0.16f, 0.12f, false);
        }

        public void Ui() { Play(_ui); }
        public void Stamp() { Play(_stamp); }
        public void Bad() { Play(_bad); }
        public void Coin() { Play(_coin); }

        private void Play(AudioClip clip)
        {
            if (clip != null) _source.PlayOneShot(clip);
        }

        private static AudioClip MakeTone(string name, float frequency, float duration, float volume, bool noisy)
        {
            const int sampleRate = 44100;
            int length = Mathf.CeilToInt(sampleRate * duration);
            float[] samples = new float[length];
            System.Random random = new System.Random(name.GetHashCode());
            for (int index = 0; index < length; index++)
            {
                float t = index / (float)sampleRate;
                float envelope = Mathf.Clamp01(1f - t / duration);
                float wave = Mathf.Sin(2f * Mathf.PI * frequency * t);
                if (noisy) wave = wave * 0.7f + ((float)random.NextDouble() * 2f - 1f) * 0.3f;
                samples[index] = wave * envelope * volume;
            }
            AudioClip clip = AudioClip.Create(name, length, 1, sampleRate, false);
            clip.SetData(samples, 0);
            return clip;
        }
    }
}
