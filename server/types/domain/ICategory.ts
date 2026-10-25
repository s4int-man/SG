import type { IQuestion } from "./IQuestion";

/** Категория (набор вопросов) внутри раунда. */
export interface ICategory {
    name: string;
    questions: IQuestion[];
}
