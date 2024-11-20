import React from "react";
import { ICategory, IGame } from "../types/IGame";
import { socket } from "../connection/Client";
import { Category } from "./Category";
import { useSelector } from "react-redux";
import { RootState } from "../types/RootState";
import { createSelector } from "@reduxjs/toolkit";

export const Categories = () =>
{
    const currentRound = useSelector((state: RootState) => state.gameReducer.currentRound);
    const categories: ICategory[] | null = useSelector(createSelector(
        (state: RootState): IGame => state.gameReducer.progress,
        (state: RootState): number => state.gameReducer.currentRound,
        (progress, currentRound): ICategory[] | null => progress.rounds[currentRound]
    ));
    
    React.useEffect(() =>
    {
        socket.on("question", (data: { roundId: number, category: string, questionId: number }) =>
        {
            console.log("Move to", data);
        });
    }, [ currentRound ]);

    if (categories == null)
        return null;
    
    return <div className="table center-block">
        {
            categories
                .map((category: ICategory): React.ReactElement =>
                {
                    return <Category key={category.name} {...category} roundId={currentRound} />;
                })
        }
    </div>;
}