import React from "react";
import { socket } from "../connection/Client";
import styles from "../styles/QuestionPrice.module.css";
import { IQuestion, ISelectedQuestion } from "../types/IQuestion";
import { useSelector } from "react-redux";
import { RootState } from "../types/RootState";

export function QuestionPrice(props: { roundId: number, category: string, question: IQuestion })
{
    const selectedQuestion: ISelectedQuestion | null = useSelector((state: RootState): ISelectedQuestion | null => state.gameReducer.selectedQuestion);

    const isSelected: boolean = selectedQuestion != null && selectedQuestion.questionId == props.question.id && selectedQuestion.category == props.category;

    const myName = localStorage.getItem("name");

    const selectQuestion = (): void =>
    {
        if (selectedQuestion != null || myName === "Святой" || myName === "TV")
            return;

        socket.emit("selected", props.roundId, props.category, props.question.id);
    };

    return <div className={`${styles.price} ${isSelected ? styles.selected : ""}`} onClick={selectQuestion}>{props.question.completed ? "" : props.question.price}</div>;
}