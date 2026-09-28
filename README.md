# Гербы, пожалуйста!

Игра о работе инспектора КПП-7 в альтернативной советской республике.

Основная версия написана на React/Vite. Десктопное приложение использует **Tauri 2**, поэтому игровая логика и интерфейс остаются общими для браузера и Windows.

## Скачать готовую Windows-сборку

Сборка запускается **только вручную**, когда нужна новая версия. Она не стартует после каждого изменения и не тратит минуты GitHub Actions впустую.

Ручной запуск создаёт два файла:

- обычный переносимый `blazon-please.exe`;
- установщик `*-setup.exe`.

Чтобы получить запрошенную сборку, открой на GitHub вкладку **Actions**, выбери успешный запуск **Build Windows EXE** и скачай артефакт `Blazon-Please-Windows-x64`.

На Windows 11 WebView2 уже установлен вместе с системой. Дополнительно ставить движок или Unity не нужно.

## Языки / Languages

Игра двуязычна: **русский** и **английский**. Переключатель РУС/ENG — в верхних лентах главного меню и экрана смены, выбор запоминается.

Шрифты: заголовки и логотип набираются **Agit Prop** (Сергей Казаков), документы и интерфейс — растровым **BM mini** (BitmapMania). Оба шрифта латинские, поэтому русские буквы автоматически подставляются из **PixelPlay** — как в оригинальных Papers, Please.

The game is bilingual: Russian and English. Use the РУС/ENG switch in the top bars of the main menu and the shift screen; the choice is remembered.

## Разработка веб-версии

```bash
npm ci
npm run dev
```

## Локальный запуск десктопной версии

Для локальной Tauri-разработки нужны:

1. Node.js 22 LTS;
2. Rust через [rustup](https://rustup.rs/);
3. Microsoft C++ Build Tools с компонентом **Desktop development with C++** и Windows SDK.

После установки:

```bash
npm ci
npm run desktop:dev
```

## Локальная Windows-сборка

```bash
npm run desktop:build
```

Результат появится в:

- `src-tauri/target/release/blazon-please.exe`;
- `src-tauri/target/release/bundle/nsis/`.

## Команды

| Команда | Назначение |
| --- | --- |
| `npm run dev` | Веб-версия с горячей перезагрузкой |
| `npm run build` | Сборка фронтенда |
| `npm run desktop:dev` | Игра в окне Tauri |
| `npm run desktop:build` | Windows-приложение и установщик |
| `npm run desktop:info` | Проверка окружения Tauri |

Сохранение игры остаётся локальным и работает через `localStorage` внутри системного WebView. В дальнейшем этот же фронтенд можно использовать для Android-сборки Tauri 2.

## Шрифт

Интерфейс использует **PixelPlay** — один из шрифтов, указанных в титрах *Papers, Please*. Автор: Aleksander Shevchuk, 2010. Лицензия: CC BY-SA 3.0. Полное уведомление находится в `public/fonts/PIXELPLAY-LICENSE.txt`.
