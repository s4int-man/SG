import React from "react";
import { ICategory, IGame } from "../types/IGame";
import { Category } from "./Category";
import { useSelector } from "react-redux";
import { RootState } from "../types/RootState";
import { createSelector } from "@reduxjs/toolkit";
import styles from "../styles/Root.module.css";
import { useScreenOrientation } from "../hooks/useScreenOrientation";

function isCategoryExhausted(category: ICategory): boolean
{
    return category.questions.every(question => question.completed);
}

export const Categories = () =>
{
    const { isPortrait } = useScreenOrientation();
    const currentRound = useSelector((state: RootState) => state.gameReducer.currentRound);
    const categories: ICategory[] | null = useSelector(createSelector(
        (state: RootState): IGame => state.gameReducer.progress,
        (state: RootState): number => state.gameReducer.currentRound,
        (progress, currentRound): ICategory[] | null => progress.rounds[currentRound]
    ));

    if (categories == null)
        return null;

    const ordered = isPortrait
        ? [ ...categories ].sort((a, b) =>
        {
            const aDone = isCategoryExhausted(a);
            const bDone = isCategoryExhausted(b);
            if (aDone === bDone)
                return 0;
            return aDone ? 1 : -1;
        })
        : categories;

    return <div className={styles.board}>
        {
            ordered.map((category: ICategory): React.ReactElement =>
            {
                return <Category key={category.name} {...category} roundId={currentRound} />;
            })
        }
    </div>;
}
