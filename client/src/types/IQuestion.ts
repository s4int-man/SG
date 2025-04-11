export interface IQuestion
{
    id: number;
    price: number;
    text: string;
    answer: string;
    answerImage?: string;
    answerAudio?: string;
    answerVideo?: string;
    completed?: boolean;
    answerPlayer?: string;
    image?: string;
    audio?: string;
}

export type ISelectedQuestion = { roundId: number, category: string, questionId: number };