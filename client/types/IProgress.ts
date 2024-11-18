export interface IPlayer
{
    name: string;
    score: number;
    online: boolean;
}

export interface ICompletedQuestion
{
    category: string;
    id: number;
    player: string;
}

export interface IRoundProgress
{
    round: number;
    completedQuestions: ICompletedQuestion[];
}

export interface IProgress
{
    players: IPlayer[];
    progress: IRoundProgress[];
}