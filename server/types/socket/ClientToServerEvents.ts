import type { PlayerName } from "../common/PlayerName";
import type { Seconds } from "../common/Seconds";
import type { GameSettingsPatch } from "../settings/GameSettingsPatch";

/**
 * События, которые сервер слушает (socket.on).
 * Порядок аргументов `selected` — исторически позиционный, оставлен как есть.
 */
export interface ClientToServerEvents {
    /** Вход в игру под именем (в т.ч. "Admin" / "TV"). */
    login: (name: PlayerName) => void;
    /** Перезапросить progress. */
    progress: () => void;
    /** Перезапросить список игроков. */
    players: () => void;
    /** Ведущий выбрал вопрос. */
    selected: (
        roundId: number,
        category: string,
        questionId: number,
        leaderPlayer?: PlayerName,
    ) => void;
    /** Игрок заявил, что отвечает. */
    answerPlayer: (name: PlayerName) => void;
    /** Ведущий назначил отвечающего для «кота в мешке». */
    catInBagPlayer: (playerName: PlayerName) => void;
    /** Игрок пасует на этом вопросе. */
    passQuestion: (name: PlayerName) => void;
    /** Ведущий открыл ответ. */
    openAnswer: () => void;
    /** Ведущий подтвердил правильный ответ (+price игроку). */
    right: () => void;
    /** Ведущий зафиксировал неправильный ответ (-price игроку). */
    wrong: () => void;
    /** @deprecated использует "setGameSettings", оставлен для совместимости. */
    setAnswerTimeLimit: (seconds: Seconds) => void;
    /** Ведущий меняет настройки игры. */
    setGameSettings: (next: GameSettingsPatch) => void;
    /** Перезапустить звук ответа у остальных клиентов. */
    audioPlay: () => void;
    /** Ведущий закрывает вопрос без ответа. */
    closeQuestion: () => void;
    /** Админ: выставить счёт игрока. */
    updatePlayerScore: (playerName: PlayerName, score: number) => void;
    /** Админ: удалить игрока. */
    deletePlayer: (playerName: PlayerName) => void;
    /** Игрок переименовывается. */
    renamePlayer: (newName: PlayerName) => void;
}
