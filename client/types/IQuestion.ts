export interface IQuestionSimple
{
    id: number;
    price: number;
    text: string;
    answer: string;
}

export interface IQuestionImage extends IQuestionSimple
{
    image: string;
}

export type IQuestion = IQuestionImage | IQuestionSimple;