import { useSelector } from "react-redux";
import config from "../config.json";
import { socket } from "../connection/Client";
import { useScreenOrientation } from "../hooks/useScreenOrientation";
import styles from "../styles/QuestionPrice.module.css";
import { IQuestion, ISelectedQuestion } from "../types/IQuestion";
import { RootState } from "../types/RootState";

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

    return <div className={`${styles.price} ${isSelected ? styles.selected : ""}`} style={{ cursor: props.question.completed ? "auto" : "pointer" }} onClick={selectQuestion}>
        <span className={`text ${props.question.completed ? styles.completed : ""}`}>{props.question.completed && !isPortrait ? "" : props.question.price}</span>
    </div>;
}