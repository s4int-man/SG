/** Координаты вопроса — payload события "selected". */
export interface SelectedQuestion {
    roundId: number;
    category: string;
    questionId: number;
}
