/**
 * Функция фиксации неправильного ответа.
 * В server.mjs объявлена как `let markAnswerWrong = null` и присваивается
 * внутри connection, чтобы обработчик таймаута мог переиспользовать ту же логику.
 * В TS лучше заменить на обычную функцию, принимающую io аргументом.
 */
export type MarkAnswerWrong = (fromTimeout?: boolean) => void;
