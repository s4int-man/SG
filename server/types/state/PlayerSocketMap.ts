import type { PlayerName } from "../common/PlayerName";
import type { GameSocket } from "../socket/GameSocket";

/** playerName -> сокет (последний подключённый сокет игрока). */
export type PlayerSocketMap = Map<PlayerName, GameSocket>;
