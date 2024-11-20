import React from "react";
import { socket } from "../connection/Client";
import styles from "../styles/QuestionPrice.module.css";
import { IQuestion } from "../types/IQuestion";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../types/RootState";
import { GameReducer } from "../store/GameReducer";

export function QuestionPrice(props: { roundId: number, category: string, question: IQuestion })
{
    const [ selected, setSelected ] = React.useState(false);

    const selectedQuestion: IQuestion | null = useSelector((state: RootState) => state.gameReducer.currentQuestion);

    const dispatch = useDispatch();

    const selectQuestion = (): void =>
    {
        if (selectedQuestion != null)
            return;

        setSelected(true);
        dispatch(GameReducer.actions.setSelectedQuestion(props.question));
    };

    React.useEffect(() =>
    {
        if (!selected)
            return;

        setTimeout(() => socket.emit("question", props.roundId, props.category, props.question.id), 2000);
    }, [ props, selected ]);

    return <div className={`${styles.price} ${selected ? styles.selected : ""}`} onClick={selectQuestion}>{props.question.completed ? "" : props.question.price}</div>;
}