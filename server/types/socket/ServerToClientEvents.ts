import type { PlayerName } from "../common/PlayerName";
import type { Seconds } from "../common/Seconds";
import type { IPlayer } from "../domain/IPlayer";
import type { IProgress } from "../domain/IProgress";
import type { IQuestion } from "../domain/IQuestion";
import type { SelectedQuestion } from "../domain/SelectedQuestion";
import type { GameSettings } from "../settings/GameSettings";

/** События, которые сервер рассылает (io.sockets.emit / socket.emit). */
export interface ServerToClientEvents {
    /** Весь прогресс (rounds + leaderPlayer). */
    progress: (progress: IProgress) => void;
    /** Актуальный список игроков. */
    players: (players: IPlayer[]) => void;
    /** Индекс текущего раунда. */
    currentRound: (currentRound: number) => void;
    /** Выбранный вопрос целиком. */
    question: (question: IQuestion) => void;
    /** Координаты выбранного вопроса, null — вопрос снят с экрана. */
    selected: (selected: SelectedQuestion | null) => void;
    /** Кто сейчас отвечает (null — никто). */
    answerPlayer: (answerPlayer: PlayerName | null) => void;
    /** Очередь желающих ответить. */
    answerQueue: (answerQueue: PlayerName[]) => void;
    /** Кто пасанул текущий вопрос. */
    passedPlayers: (passedPlayers: PlayerName[]) => void;
    /** Текущий лимит времени на ответ. */
    answerTimeLimit: (seconds: Seconds) => void;
    /** Секунды до конца ответа отвечающему (null — таймера нет). */
    answerTimer: (secondsLeft: Seconds | null) => void;
    /** Персональный кулдаун игрока (null — кулдауна нет). */
    answerCooldownTimer: (secondsLeft: Seconds | null) => void;
    /** Полный набор настроек игры. */
    gameSettings: (settings: GameSettings) => void;
    /** Игрок, взявший последний вопрос (undefined — никого). */
    leaderPlayer: (leaderPlayer?: PlayerName) => void;
    /** «Кот в мешке» назначен на текущий вопрос. */
    catInBagSelected: (catInBagSelected: boolean) => void;
    /** Ответ открыт. */
    openAnswer: () => void;
    /** Включить звук ответа. */
    audioPlay: () => void;
    /** Остановить звук ответа. */
    audioStop: () => void;
    /** Перейти на экран игры (вопроса нет). */
    to_game: () => void;
    /** Перейти на экран вопроса. */
    to_question: () => void;
    /** Игрока успешно переименовали. */
    renamed: (newName: PlayerName) => void;
    /** Причина отказа в переименовании. */
    renameError: (message: string) => void;
}
