import type { PlayerName } from "../common/PlayerName";
import type { TimestampMs } from "../common/TimestampMs";

/** playerName -> дедлайн персонального кулдауна в мс. */
export type CooldownDeadlineMap = Map<PlayerName, TimestampMs>;
