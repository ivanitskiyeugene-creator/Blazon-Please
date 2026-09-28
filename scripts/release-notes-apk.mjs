// Генерирует заметки релиза для Android APK (теги apk-*).
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const fallbackVersion = pkg.mobileVersion || pkg.version;
const src = fs.readFileSync('src/game/changelog.ts', 'utf8');
const head = src.slice(src.indexOf('export const CHANGELOG'));
const match = head.match(
  /version:\s*"([^"]+)"[\s\S]*?tag:\s*\{[^}]*?ru:\s*"([^"]+)"[\s\S]*?ru:\s*\[([\s\S]*?)\]/,
);

const version = match?.[1] ?? fallbackVersion;
const tag = match?.[2] ?? 'ОБНОВЛЕНИЕ КПП-7';
const items = match
  ? [...match[3].matchAll(/"([^"]+)"/g)].map((item) => `- ${item[1]}`).join('\n')
  : '- Исправления и улучшения пограничного поста.';

console.log(
  `**Гербы, пожалуйста! (Android APK) v${version} — ${tag}**\n\n` +
  `### Изменения ${version}\n${items}\n\n` +
  `### Мобильное управление\n` +
  `- Адаптивный сенсорный интерфейс для телефонов и планшетов.\n` +
  `- Быстрые вкладки «Будка / Стол / Свод» и действия с документами.\n` +
  `- Сенсорные штампы и тревожная кнопка «АРЕСТ».\n\n` +
  `### Скачать\n` +
  `- \`Blazon-Please-${version}.apk\` — установочный файл Android.\n\n` +
  `*Сборка выполнена автоматически через GitHub Actions.*`,
);
