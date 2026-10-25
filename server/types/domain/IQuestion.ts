/** Один вопрос категории. */
export interface IQuestion {
    id: number;
    price: number;
    text: string;
    answer: string;
    /** Медиа вопроса. */
    image?: string;
    audio?: string;
    video?: string;
    /** Медиа ответа. */
    answerImage?: string;
    answerAudio?: string;
    answerVideo?: string;
    /** «Кот в мешке» — игрок обязан отвечать, право хода переходит к нему. */
    catInBag?: boolean;
    /** Поля прогресса: проставляются сервером, редактор их вычищает. */
    completed?: boolean;
    answerPlayer?: string | null;
}
