import React from "react";
import { socket } from "../connection/Client";
import styles from "../styles/QuestionPrice.module.css";
import { IQuestion, ISelectedQuestion } from "../types/IQuestion";
import { useSelector } from "react-redux";
import { RootState } from "../types/RootState";
import { useScreenOrientation } from "../hooks/useScreenOrientation";

export function QuestionPrice(props: { roundId: number, category: string, question: IQuestion })
{
    const selectedQuestion: ISelectedQuestion | null = useSelector((state: RootState): ISelectedQuestion | null => state.gameReducer.selectedQuestion);
    const leaderPlayer = useSelector((state: RootState) => state.gameReducer.leaderPlayer);

    const isSelected: boolean = selectedQuestion != null && selectedQuestion.questionId == props.question.id && selectedQuestion.category == props.category;
    const { isPortrait } = useScreenOrientation();

    const myName = localStorage.getItem("name");

    const selectQuestion = (): void =>
    {
        if (selectedQuestion != null || (leaderPlayer != undefined && myName != leaderPlayer && myName != "Святой"))
            return;

        socket.emit("selected", props.roundId, props.category, props.question.id);
    };

    return <div className={`${styles.price} ${isSelected ? styles.selected : ""}`} onClick={selectQuestion}>
        <span className={`text ${props.question.completed ? styles.completed : ""}`}>{props.question.completed && !isPortrait ? "" : props.question.price}</span>
    </div>;
}