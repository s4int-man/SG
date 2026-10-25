# AGENTS.md

Инструкция для агентов, которые работают с этим репозиторием. Всё ниже — проверено по коду, а не догадки.

## Что это за проект

«Святая игра» — self-hosted викторина для компании: один сервер в локальной сети, игроки заходят со своих телефонов через браузер, отдельно выводится экран для проектора и открывается панель ведущего. Никакого внешнего бэкенда и авторизации — весь матч живёт на одном Node-процессе в LAN.

Три роли, различаются **только именем**, под которым клиент логинится:

| Роль | Имя | Что делает |
|---|---|---|
| Игрок | любое | отвечает / пасует, копит баллы, может переименоваться |
| Ведущий (emcee) | `Admin` | выбирает вопросы, открывает ответ, выставляет «верно/неверно», меняет настройки, удаляет игроков |
| Экран (TV) | `TV` | проекция вопроса на телевизор, проигрывает медиа и звуки |

Константы заданы в двух местах и должны совпадать: `EMCEE = "Admin"` / `TV = "TV"` в `server/server.mjs` и `emcee` / `tv` в `client/src/config.json`.

Игровая механика: раунды → категории → вопросы с ценой (кратно 100). Игрок вызывается отвечать, на ответ отводится `answerTimeLimitSec`, у остальных после взятия вопроса кулдаун. Есть «кот в мешке» (`catInBag`) — отказываться нельзя, право хода переходит назначенному игроку. Все игроки пасанули — ответ открывается автоматически. Неверный ответ штрафует игрока на цену вопроса.

## Структура репозитория

```
server/                Node-сервер: Express + Socket.IO, состояние в JSON-файлах
├── server.mjs         вся игровая логика (ПОКА JavaScript)
├── progressUtils.ts   загрузка/сохранение progress, players, settings (TypeScript)
├── progressUtils.mjs  устаревшая JS-копия — удалить при переносе server.ts
├── types/             контракты и типы (см. раздел «Миграция в TypeScript»)
├── public/            статика: медиа вопросов + собранный клиент (в .gitignore)
├── progress.json      текущая игра: раунды → категории → вопросы + прогресс
├── players.json       игроки и баллы
├── settings.json      настройки игры
└── tsconfig.json      strict, noEmit, moduleResolution: Bundler

client/                React 18 + Create React App + TypeScript + Redux Toolkit
├── src/
│   ├── App.tsx            маршруты (/login, /editor, /screens/game, /screens/question)
│   ├── config.json        адрес сервера + имена ролей  ← править при переносе
│   ├── connection/Client.tsx   единственный экземпляр socket.io-client
│   ├── hooks/useConnection.tsx  все socket.on(...) → dispatch в Redux
│   ├── store/GameReducer.ts     единственная slice с игровым состоянием
│   ├── types/             клиентские копии доменных типов
│   ├── components/        экраны + components/Question/* (Admin/Tv/Player версии)
│   ├── components/Editor/ редактор паков (работает только с localhost)
│   └── styles/            CSS Modules (*.module.css)
└── public/              index.html, шрифты

game-1.json, game-test.json   образцы паков вопросов для редактора
```

## Запуск и команды

| Что | Команда | Примечание |
|---|---|---|
| Сервер (сейчас) | `cd server && node server.mjs` | порт 4000 |
| Сервер (после переноса) | `cd server && npm run dev` / `npm start` | `tsx watch server.ts` — **файла `server.ts` ещё нет** |
| Проверка типов сервера | `cd server && npm run typecheck` | он же `npx tsc --noEmit` |
| Клиент (dev) | `cd client && npm start` | :3000, прокси не настроен |
| Клиент (сборка) | `cd client && npm run build` | артефакт копируется в `server/public` |

Обязательные тонкости:

- **Рабочая директория сервера — `server/`.** `progressUtils` открывает `progress.json`, `players.json`, `settings.json` по относительным путям, то есть относительно `cwd`. Запуск из корня репозитория даст `ENOENT`.
- Сервер слушает `listen(port)` без хоста, то есть на всех интерфейсах. Переменная `hostname = "localhost"` в `server.mjs` участвует только в тексте лога и ни на что не влияет.
- Клиент подключается к захардкоженному `config.server` (например `http://192.168.0.8:4000`). При смене машины/подсети править `client/src/config.json`, а не переменные окружения — их нет.
- `server/public` лежит в `.gitignore`: там лежат медиа вопросов и, при деплое, собранный клиент. Скрипта-копирователя в репозитории нет — `client/build` переносится вручную; `homepage` в `client/package.json` не задан, поэтому ассеты отдаются от корня (что и нужно, когда статику раздаёт сервер). В гите только исходники медиа (`public/audio`, `public/images`).
- Тестов в проекте **нет** (`react-scripts test` настроен, но ни одного `*.test.*`). Единственная доступная проверка — `tsc --noEmit` на сервере и компиляция CRA на клиенте.

## Модель данных (JSON рядом с сервером)

### `progress.json`
```jsonc
{
  "rounds": [                       // массив раундов
    [ { "name": "Про ДР",           // массив категорий раунда
        "questions": [
          { "id": 1, "price": 100, "text": "...", "answer": "32",
            "completed": true, "answerPlayer": null }
        ] } ]
  ],
  "leaderPlayer": "Святой"          // кто взял последний вопрос; может отсутствовать
}
```
Прогресс хранится **внутри самих вопросов** (`completed`, `answerPlayer`) — отдельного реестра результатов нет. Редактор вычищает `completed` / `answerPlayer` из вопросов, а при скачивании «чистого пака» ещё и `leaderPlayer`.

Вопрос (`IQuestion`): `id`, `price`, `text`, `answer`, медиа `image|audio|video` (условие вопроса) и `answerImage|answerAudio|answerVideo` (ответ), флаг `catInBag`. Пути к медиа относительные (`/audio/catInBag.mp3`), отдаются статикой из `server/public`.

### `players.json`
`[{ "name": "Святой", "score": -664, "online": true }]`. Балл может быть отрицательным (штраф за неверный ответ = −цена вопроса).

### `settings.json`
```json
{ "answerTimeLimitSec": 30, "answerQueueEnabled": true, "answerCooldownSec": 5 }
```
`saveSettings` зажимает значения: лимит 5…300 с, кулдаун 0…60 с. При отсутствии файла создаётся дефолтный.

## Контракты Socket.IO

Обе карты описаны в `server/types/socket/` и типизуют сервер через `GameIoServer` / `GameSocket`. **Часть имён (`answerPlayer`, `selected`, `openAnswer`, `audioPlay`, `progress`, `players`) встречается в обоих направлениях** — это разные события для клиента и сервера, не путать при правках.

### Клиент → сервер (`ClientToServerEvents`, 17 шт.)

| Событие | Payload | Кто / смысл |
|---|---|---|
| `login` | `name` | все; вход, сервер шлёт полный снапшот состояния |
| `progress` / `players` | — | перезапросить состояние |
| `selected` | `roundId, category, questionId, leaderPlayer?` | ведущий выбрал вопрос (аргументы позиционные!) |
| `answerPlayer` | `name` | игрок заявил, что отвечает |
| `passQuestion` | `name` | игрок пасует |
| `catInBagPlayer` | `playerName` | ведущий назначает отвечающего в «коте в мешке» |
| `openAnswer` | — | ведущий открывает ответ |
| `right` / `wrong` | — | результат ответа (±`price`) |
| `closeQuestion` | — | снять вопрос без ответа |
| `setGameSettings` | `Partial<GameSettings>` | настройки (только `Admin`) |
| `setAnswerTimeLimit` | `seconds` | **deprecated**, дубль `setGameSettings` |
| `updatePlayerScore` | `playerName, score` | только `Admin` |
| `deletePlayer` | `playerName` | только `Admin` |
| `renamePlayer` | `newName` | игрок переименовывается |
| `audioPlay` | — | перезапустить звук ответа у остальных |

### Сервер → клиент (`ServerToClientEvents`, 21 шт.)

| Событие | Payload | Смысл |
|---|---|---|
| `progress` | `IProgress` | весь прогресс |
| `players` | `IPlayer[]` | список игроков (клиент сортирует по баллам) |
| `currentRound` | `number` | индекс раунда |
| `question` | `IQuestion` | выбранный вопрос |
| `selected` | `SelectedQuestion \| null` | координаты вопроса / снят с экрана |
| `answerPlayer` | `string \| null` | кто отвечает |
| `answerQueue` | `string[]` | очередь желающих |
| `passedPlayers` | `string[]` | кто пасанул |
| `answerTimeLimit` | `number` | текущий лимит ответа |
| `answerTimer` | `number \| null` | секунд до конца ответа текущего отвечающего (рассылка всем, `null` — таймера нет) |
| `answerCooldownTimer` | `number \| null` | персональный кулдаун, шлётся поимённо |
| `gameSettings` | `GameSettings` | полный набор настроек |
| `leaderPlayer` | `string \| undefined` | кто взял вопрос |
| `catInBagSelected` | `boolean` | «кот в мешке» назначен |
| `openAnswer` | — | ответ открыт |
| `audioPlay` / `audioStop` | — | управление звуком ответа |
| `to_game` / `to_question` | — | команда клиенту сменить экран |
| `renamed` / `renameError` | `string` | результат переименования |

## REST API (редактор)

Все эндпоинты, кроме `/api/lan`, закрыты middleware `requireLocalhost` (только `127.0.0.1` / `::1`). CORS открыт полностью (`Access-Control-Allow-Origin: *`).

| Метод | Путь | Тело/ответ |
|---|---|---|
| GET | `/api/lan` | `{ addresses: string[], preferred: string \| null }` — для QR-кода «зайти в игру» |
| GET | `/api/progress` | `IProgress` |
| PUT | `/api/progress` | тело `IProgress` (обязателен массив `rounds`), ответ `{ ok: true }`; сохраняет и рассылает `progress` всем сокетам |
| POST | `/api/media/:kind` | `kind` = `image\|audio\|video`; тело — сырой файл (`express.raw`, лимит 80 МБ), query: `filename, pack, round, categoryId, questionId, type`; ответ `{ path: "/editor/images/..." }` |

Ошибки всегда `{ error: string }`. JSON-боди парсится с лимитом 10 МБ. Имена файлов sanitize'ятся (`sanitizePackName`, `sanitizeToken`), итоговый вид: `<pack>-<round>-<categoryId>-<questionId>-<type><ext>`.

## Архитектура сервера (`server/server.mjs`)

Весь матч — это модульные переменные + обработчики `socket.on`. Никаких классов и DI. Состояние перечислено в типе `ServerState` (`server/types/state/ServerState.ts`) — используйте его как чек-лист, ничего не забыть.

Ключевые сущности:

- **`progress` / `players` / `settings`** — загружаются при старте, сохраняются точечно (`saveProgress`, `savePlayers`, `saveSettings`) сразу после мутации.
- **`currentQuestion`** — ссылка на объект вопроса **внутри** `progress`, поэтому `completeQuestion()` мутирует прогресс напрямую.
- **`answerQueue` / `answerPlayer`** — очередь отвечающих, голова очереди и есть `answerPlayer`. `syncAnswerState()` — единственная точка, которая синхронизирует голову очереди, рассылает `answerPlayer`/`answerQueue` и перезапускает таймер при смене отвечающего.
- **Таймер ответа**: `answerDeadline` + `answerTickInterval` (тик раз в секунду, шлёт `answerTimer`) + `answerTimer` (timeout по истечении → `markAnswerWrong(true)`).
- **Кулдаун**: `cooldownDeadlines: Map<name, deadlineMs>` + один общий тикер `cooldownTickInterval`; `answerCooldownTimer` шлётся **персонально** через `playerSockets`. `questionCooldownStartedAt` нужен, чтобы восстановить кулдаун при переподключении (`syncCooldownForPlayer`).
- **`isOpened`** — ответ открыт: после этого `answerPlayer`, `passQuestion` и `openAnswer` игнорируются.
- **`passedPlayers`** + `tryAutoOpenIfAllPassed()` — все пасанули → авто-открытие ответа.
- **`catInBagSelected`** — при «коте в мешке» неверный ответ не возвращает ход очереди, а закрывает вопрос.
- **`markAnswerWrong`** — объявлена как `let = null` на уровне модуля и **присваивается внутри `connection`**, чтобы timeout мог переиспользовать ту же логику. Это исторический костыль.
- **`playerSockets`** — `Map<name, socket>` для адресной рассылки; `bindPlayerSocket`/`unbindPlayerSocket` (unbind проверяет, что это всё ещё тот же сокет — защита от гонки при переподключении).
- **`currentRound` / `findCurrentRound()`** — первый недочитанный раунд; `roundFinished()` проходит по всем вопросам.
- Проверка прав на сервере — только `isAdmin()`, то есть `socketName === "Admin"`. Паролей нет.

Поток «вопрос задан»: `selected` → сброс очереди/пасов/кулдауна → `emit("selected")` → через `QUESTION_SELECT_HIGHLIGHT_MS` (2000 мс) → `emit("question")` + старт кулдауна.

## Миграция в TypeScript (в процессе)

Сделано: `progressUtils.ts`, `tsconfig.json`, `types/`, `package.json` (скрипты `dev`/`start` уже смотрят на `tsx server.ts`, **но `server.ts` ещё не создан** — сервер по-прежнему запускается через `node server.mjs`).

Правила, которые приняты и их надо придерживаться:

1. **`types/` — единый источник правды по типам сервера.** Один тип = один файл, имя файла = имя типа (PascalCase). `index.ts`-барелей **нет**, импорты только явными путями:
   ```ts
   import type { IPlayer } from "./types/domain/IPlayer";
   import type { GameIoServer } from "./types/socket/GameIoServer";
   ```
2. Папки = логические части, зависимости однонаправленные, **без циклов**:
   `common → domain → settings → socket → api → state`
   ```
   types/common/    PlayerName, Seconds, TimestampMs, TimerHandle
   types/domain/    IPlayer, IQuestion, ICategory, IProgress, SelectedQuestion,
                    QuestionMediaField, SpecialRole
   types/settings/  GameSettings, GameSettingsPatch
   types/socket/    ClientToServerEvents, ServerToClientEvents, InterServerEvents,
                    SocketData, GameIoServer, GameSocket, MarkAnswerWrong
   types/api/       MediaKind, MediaKindConfig, MediaKindMap, MediaUploadQuery,
                    MediaUploadResponse, LanAddressesResponse, OkResponse, ApiErrorResponse
   types/state/     ServerState, CooldownDeadlineMap, PlayerSocketMap
   ```
3. `tsconfig.json` — `strict: true`, `noEmit: true`, `moduleResolution: "Bundler"`, `include: ["*.ts", "types/**/*.ts"]`. **При добавлении новой папки проверять `npx tsc --showConfig`** — файлы вне `include` молча не проверяются.
4. Socket.IO типизуется дженериками: `new GameIoServer(httpServer, ...)` и `(socket: GameSocket) => ...`. Тогда `emit`/`on` проверяют и имя события, и payload.
5. `progressUtils.ts` реэкспортирует доменные типы (`export type { IPlayer } from "./types/domain/IPlayer"`) — сохранено для совместимости, новые импорты лучше писать напрямую из `types/`.
6. При переносе кода в `server.ts` не «глушить» строгость: `findQuestion` возвращает `IQuestion | undefined`, `players.find(...)` в обработчике `right` разыменовывается без проверки — это реальные дыры, их надо закрывать проверками, а не `!` и не `any`.
7. `progressUtils.mjs` — мёртвая копия, удалить вместе с `server.mjs` после переноса.

## Клиент (`client/`)

- React 18 + CRA (`react-scripts` 5) + TypeScript 4.9 + Redux Toolkit + react-router-dom 6.
- **`MemoryRouter`, а не `BrowserRouter`** (`src/index.tsx`): адресная строка не отражает маршрут. Стартовый путь берётся из `window.location.pathname`, но только если он начинается с `/editor` — иначе всегда `/`. Поэтому редактор открывается по URL с сервера, а остальные маршруты живут внутри сессии.
- Роль определяется именем из `localStorage.getItem("name")` и сравнением с `config.emcee` / `config.tv` (`Header.tsx`, `Question.tsx`). Имя ставится при логине, обновляется при переименовании.
- `src/hooks/useConnection.tsx` — единственное место подписки на сокеты: один `useEffect` со всеми `socket.on` и зеркальным `socket.off`, каждый обработчик — `useCallback` с `dispatch`. Новое событие = добавить в этот список **и** в `GameReducer`.
- `src/store/GameReducer.ts` — одна slice, состояние приближено к «сырым» payload'ам сервера (`answerPlayer` хранится как объект игрока, `answerCooldown` — секунды).
- Компоненты вопроса дублируются под роли: `Question/AdminQuestion.tsx`, `Question/TvQuestion.tsx`, `Question/PlayerQuestion.tsx` (+ общие куски `AnswerStatus`, `ImageAnswer`, `AudioAnswer`, `VideoAnswer`, `CatInBag*`).
- Стили — CSS Modules в `src/styles/*.module.css`.
- `src/types/` — **независимая копия** доменных типов (`IGame.ts`, `IQuestion.ts`, `IProgress.ts`). CRA не даёт импортировать за пределы `src`, поэтому серверные и клиентские типы приходится синхронизировать руками при изменении контракта.

## Подводные камни (читать перед правками)

1. **`QUESTION_SELECT_HIGHLIGHT_MS = 2000` дублируется**: `server/server.mjs` и `client/src/constants/timing.ts` («Must match server delay»). Менять строго синхронно.
2. Имена ролей дублируются: `server.mjs` (`EMCEE`, `TV`) и `client/src/config.json` (`emcee`, `tv`).
3. **Игроки с 0 баллов теряются.** `loadPlayers()` фильтрует `score !== 0`, а `disconnectPlayer()` удаляет офлайн-игрока с `score == 0`. `Admin`/`TV` никогда не удаляются — иначе у мобильных клиентов пропадает шапка.
4. `answerPlayer`, `selected`, `openAnswer`, `audioPlay`, `progress`, `players` — имена событий в обе стороны. При правке легко перепутать карты.
5. `answerCooldownTimer` и `answerTimer` — адресные/массовые рассылки с `null`, означающим «таймера нет». Клиент хранит `null` как «нет таймера», а не `0`.
6. `setAnswerTimeLimit` — устаревший дубль `setGameSettings`, оставлен для совместимости со старыми сборками клиента.
7. `requireLocalhost` блокирует API редактора не с localhost: если сервер поднят в Docker/на ВМ, редактор оттуда не заработает.
8. `@types/express@^5` при `express@^4` в зависимостях — мажоры не совпадают. Если типы начнут противоречить рантайму, ставить `@types/express@^4.17.21`.
9. Версии: `typescript@7.0.2` на сервере (нативный компилятор) и `typescript@^4.9.5` в клиенте — API разных поколений, не переносить синтаксис «в лоб» между проектами.
10. `findCurrentRound()` в цикле доходит до `progress.rounds.length` — опирается на то, что `roundFinished()` для индекса за границей возвращает `true`.
11. Никакой валидации payload'ов сокетов нет: сервер доверяет клиенту (`updatePlayerScore` приводит к числу, остальное — как пришло).
12. `server/public` в `.gitignore`, поэтому медиа, загруженные через редактор, в репозиторий не попадают.

## Конвенции

- Кодинг-стайл: 4 пробела, **Allman-скобки** — открывающая скобка функции/блока на отдельной строке; `if`/`else` со скобками даже на одну строку. Тот же стиль и в клиенте.
- Комментарии и сообщения в коде — по-русски допустимы (так уже в `server.mjs`, `types/`, `progressUtils.ts`).
- Коммиты — короткий императив на английском: `Implement ...`, `Add ...`, `Refactor ...`, `fix styles`.
- Типы: префикс `I` для доменных интерфейсов (`IPlayer`, `IQuestion`), без `I` — для контрактов протокола и настроек (`GameSettings`, `ServerToClientEvents`).
- Избегать `any` и `!`: в `server/` включён `strict`, проверка — `npm run typecheck`.

## Как проверять свою работу

```bash
cd server && npm run typecheck          # tsc --noEmit, должен быть чисто
cd server && npx tsc --showConfig       # все нужные файлы в программе компиляции
cd server && node server.mjs            # должен напечатать "> Ready on http://localhost:4000"
cd client && npm start                  # CRA соберёт без ошибок типов
```

Быстрая ручная проверка сценария: открыть `:3000` под именем `Admin` (ведущий), `TV` (экран) и любым именем (игрок) → выбрать вопрос → игрок жмёт «Отвечать» → ведущий «Верно/Неверно» → смена раунда.

## Что дальше (известные задачи)

1. Перенести `server.mjs` → `server.ts` (скрипты уже настроены), типизовав состояние через `ServerState` и сокеты через `GameIoServer`/`GameSocket`; попутно закрыть `undefined`-дыры из п. 6 раздела про миграцию.
2. Удалить `server.mjs` и `progressUtils.mjs` после переноса.
3. Решить с дублированием типов клиент/сервер (общая папка или пакет — упирается в ограничения CRA).
4. Опционально: вынести константы (`EMCEE`, `TV`, `QUESTION_SELECT_HIGHLIGHT_MS`) в один источник, чтобы не держать их в двух местах.
