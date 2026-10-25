import type { ICategory } from "./ICategory";

/**
 * Содержимое progress.json: раунды -> категории -> вопросы.
 * `leaderPlayer` — игрок, взявший последний вопрос (сбрасывается при смене раунда).
 */
export interface IProgress {
    /** Имя пака (использует редактор), в progress.json может отсутствовать. */
    name?: string;
    rounds: ICategory[][];
    leaderPlayer?: string;
}
