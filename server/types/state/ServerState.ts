import type { PlayerName } from "../common/PlayerName";
import type { Seconds } from "../common/Seconds";
import type { TimestampMs } from "../common/TimestampMs";
import type { TimerHandle } from "../common/TimerHandle";
import type { IPlayer } from "../domain/IPlayer";
import type { IProgress } from "../domain/IProgress";
import type { IQuestion } from "../domain/IQuestion";
import type { GameSettings } from "../settings/GameSettings";
import type { CooldownDeadlineMap } from "./CooldownDeadlineMap";
import type { PlayerSocketMap } from "./PlayerSocketMap";

/**
 * Всё mutable-состояние модуля server.mjs — чек-лист для переноса:
 * если поля нет в этом интерфейсе, значит оно забыто.
 */
export interface ServerState {
    progress: IProgress;
    players: IPlayer[];
    settings: GameSettings;
    /** Текущий отвечающий (голова очереди) — null, если очереди нет. */
    answerPlayer: PlayerName | null;
    /** Очередь желающих ответить. */
    answerQueue: PlayerName[];
    /** Кто пасанул текущий вопрос. */
    passedPlayers: PlayerName[];
    /** Таймер конца ответа + его тикер. */
    answerTimer: TimerHandle;
    answerTickInterval: TimerHandle;
    /** Дедлайн ответа текущего игрока в мс. */
    answerDeadline: TimestampMs | null;
    /** Актуальный лимит ответа (копия settings.answerTimeLimitSec). */
    answerTimeLimitSec: Seconds;
    /** Персональные кулдауны + их общий тикер. */
    cooldownDeadlines: CooldownDeadlineMap;
    cooldownTickInterval: TimerHandle;
    /** Момент старта кулдауна по текущему вопросу (нужен для reconnect). */
    questionCooldownStartedAt: TimestampMs | null;
    /** Сокеты игроков по именам. */
    playerSockets: PlayerSocketMap;
    /** Текущий вопрос (ссылка на объект внутри progress) или null. */
    currentQuestion: IQuestion | null;
    /** Координаты выбранного вопроса. */
    roundId: number;
    category: string;
    questionId: number;
    /** Индекс текущего раунда. */
    currentRound: number;
    /** Ответ открыт (кнопки для игроков заблокированы). */
    isOpened: boolean;
    /** Имя игрока, взявшего последний вопрос. */
    leaderPlayer?: string;
    /** «Кот в мешке» назначен на текущий вопрос. */
    catInBagSelected: boolean;
}
