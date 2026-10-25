import type { QuestionMediaField } from "../domain/QuestionMediaField";

/** Query-параметры загрузки медиа (всё приходит строками из URL). */
export interface MediaUploadQuery {
    filename?: string;
    pack?: string;
    round?: string;
    categoryId?: string;
    questionId?: string;
    /** Имя поля вопроса: image / audio / video / answerImage / ... */
    type?: QuestionMediaField | string;
}
