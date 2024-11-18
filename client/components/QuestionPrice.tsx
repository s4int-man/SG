"use client";
import { IQuestion } from "@/models/IQuestion";
import React from "react";
import styles from "@/styles/QuestionPrice.module.css";
import { socket } from "@/client";

export function QuestionPrice(props: { roundId: number, category: string, question: IQuestion, completed: boolean })
{
    const selectQuestion = (): void =>
    {
        socket.emit("question", props.roundId, props.category, props.question.id);
    };

    return <div className={styles.price} onClick={selectQuestion}>{props.completed ? "" : props.question.price}</div>;
}