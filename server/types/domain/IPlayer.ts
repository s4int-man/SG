import type { PlayerName } from "../common/PlayerName";

/** Игрок в списке (в т.ч. служебные "Admin" и "TV"). */
export interface IPlayer {
    name: PlayerName;
    score: number;
    /** Проставляется сервером при login/disconnect, в players.json не значима. */
    online?: boolean;
}
