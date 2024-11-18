import { socket } from "../connection/Client";
import styles from "../styles/QuestionPrice.module.css";
import { IQuestion } from "../types/IQuestion";

export function QuestionPrice(props: { roundId: number, category: string, question: IQuestion, completed: boolean })
{
    const selectQuestion = (): void =>
    {
        socket.emit("question", props.roundId, props.category, props.question.id);
    };

    return <div className={styles.price} onClick={selectQuestion}>{props.completed ? "" : props.question.price}</div>;
}