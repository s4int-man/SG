import React from "react";
import { ICategory } from "../types/IGame";
import { ICompletedQuestion, IRoundProgress } from "../types/IProgress";
import { socket } from "../connection/Client";
import { Category } from "./Category";

export const Categories = (props: { roundId: number }) =>
{
    const [ categories, setCategories ] = React.useState<ICategory[]>([]);
    const [ completed, setCompleted ] = React.useState<ICompletedQuestion[]>([]);
    
    React.useEffect(() =>
    {
        socket.on("progress", (progress: IRoundProgress[]): void =>
        {
            console.log("progress", progress);

            const result = progress[props.roundId];

            if (result != null)
                setCompleted(result.completedQuestions);
            else
                setCompleted([]);
        });

        socket.on("question", (data: { roundId: number, category: string, questionId: number }) =>
        {
            console.log("Move to", data);
        });

        socket.emit("progress");
    }, [ props ]);
    
    return <div className="table center-block">
        {
            categories
                .map((category: ICategory): React.ReactElement =>
                {
                    return <Category key={category.name} {...category} roundId={props.roundId} completed={completed} />;
                })
        }
    </div>;
}