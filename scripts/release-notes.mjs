// Генерирует заметки релиза из свежей записи src/game/changelog.ts.
// Используется workflow-ом сборки Windows EXE (теги exe-*).
import fs from 'node:fs';

const src = fs.readFileSync('src/game/changelog.ts', 'utf8');
const head = src.slice(src.indexOf('export const CHANGELOG'));
const m = head.match(/version:\s*"([^"]+)"[\s\S]*?tag:\s*"([^"]+)"[\s\S]*?items:\s*\[([\s\S]*?)\]/);
if (!m) throw new Error('не удалось разобрать changelog');
const items = [...m[3].matchAll(/"([^"]+)"/g)].map((x) => `- ${x[1]}`).join('\n');
console.log(
  `**Версия ${m[1]} — ${m[2]}**\n\n` +
  `${items}\n\n` +
  `Скачать:\n- \`blazon-please.exe\` — портативная версия, без установки\n- \`*-setup.exe\` — установщик Windows\n\n` +
  `Полный список изменений — на экране «Сводка» в игре. Сборка выполнена автоматически через GitHub Actions.`
);
