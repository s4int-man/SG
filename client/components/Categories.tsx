"use client";
import { ICompletedQuestion, IRoundProgress } from "@/app/types/IProgress";
import { socket } from "@/client";
import { Category } from "@/components/Category";
import { ICategory } from "@/models/IGame";
import React from "react";

export const Categories = (props: { roundId: number, categories: ICategory[] }) =>
{
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
            props.categories
                .map((category: ICategory): React.ReactElement =>
                {
                    return <Category key={category.name} {...category} roundId={props.roundId} completed={completed} />;
                })
        }
    </div>;
}