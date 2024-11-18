import { IQuestion } from "./IQuestion";

export interface ICategory
{
    name: string;
    questions: IQuestion[];
}

export interface IGame
{
    rounds: ICategory[][];
}