import type { GameSettings } from "./GameSettings";

/** Частичная настройка — то, что присылает ведущий через "setGameSettings". */
export type GameSettingsPatch = Partial<GameSettings>;
