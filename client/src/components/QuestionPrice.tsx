import { useSelector } from "react-redux";
import config from "../config.json";
import { socket } from "../connection/Client";
import { QUESTION_SELECT_HIGHLIGHT_MS } from "../constants/timing";
import { useScreenOrientation } from "../hooks/useScreenOrientation";
import styles from "../styles/QuestionPrice.module.css";
import { IQuestion, ISelectedQuestion } from "../types/IQuestion";
import { RootState } from "../types/RootState";

const BLINK_CYCLE_MS = 1000;

export function QuestionPrice(props: { roundId: number, category: string, question: IQuestion })
{
    const selectedQuestion: ISelectedQuestion | null = useSelector((state: RootState): ISelectedQuestion | null => state.gameReducer.selectedQuestion);
    const leaderPlayer = useSelector((state: RootState) => state.gameReducer.leaderPlayer);

    const isSelected: boolean = selectedQuestion != null && selectedQuestion.questionId == props.question.id && selectedQuestion.category == props.category;
    const { isPortrait } = useScreenOrientation();

    const myName = localStorage.getItem("name");

    const selectQuestion = (): void =>
    {
        if (props.question.completed || selectedQuestion != null || (leaderPlayer != undefined && myName != leaderPlayer && myName != config.emcee))
            return;

        socket.emit("selected", props.roundId, props.category, props.question.id, myName);
    };

    const blinkStyle = isSelected ? {
        ["--blink-duration" as string]: `${BLINK_CYCLE_MS}ms`,
        ["--blink-count" as string]: String(Math.max(1, Math.round(QUESTION_SELECT_HIGHLIGHT_MS / BLINK_CYCLE_MS))),
    } : undefined;

    return <div
        className={`${styles.price} ${isSelected ? styles.selected : ""}`}
        style={{ cursor: props.question.completed ? "auto" : "pointer", ...blinkStyle }}
        onClick={selectQuestion}
    >
        <span className={`text ${props.question.completed ? styles.completed : ""}`}>
            {props.question.completed && !isPortrait ? "" : props.question.price}
        </span>
    </div>;
}
