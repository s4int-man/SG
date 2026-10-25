/** Настройки игры — то, что лежит в settings.json. */
export interface GameSettings {
    answerTimeLimitSec: number;
    answerQueueEnabled: boolean;
    answerCooldownSec: number;
}
