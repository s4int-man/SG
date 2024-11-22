export interface IQuestionSimple
{
    id: number;
    price: number;
    text: string;
    answer: string;
    completed?: boolean;
    answerPlayer?: string;
}

export interface IQuestionImage extends IQuestionSimple
{
    image: string;
}

export type IQuestion = IQuestionImage | IQuestionSimple;

export type ISelectedQuestion = { roundId: number, category: string, questionId: number };