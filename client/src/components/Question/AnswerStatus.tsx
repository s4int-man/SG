import { useSelector } from "react-redux";
import styles from "../../styles/Question.module.css";
import { RootState } from "../../types/RootState";

export function AnswerStatus(props: { myName?: string })
{
    const answerPlayer = useSelector((state: RootState) => state.gameReducer.answerPlayer);
    const answerQueue = useSelector((state: RootState) => state.gameReducer.answerQueue);
    const myName = props.myName ?? "";

    if (answerQueue.length === 0 && answerPlayer == null)
        return null;

    const current = answerPlayer?.name ?? answerQueue[0];
    const waiting = answerQueue.length > 1 ? answerQueue.slice(1) : [];
    const myIndex = myName ? answerQueue.indexOf(myName) : -1;

    return <div className={styles.answer_status}>
        {current != null && (
            <div className={styles.player_answer}>
                {myName !== "" && current === myName ? "Ты отвечаешь!" : `Отвечает: ${current}`}
            </div>
        )}
        {myIndex > 0 && (
            <div className={styles.queue_me}>Ты в очереди: #{myIndex + 1}</div>
        )}
        {waiting.length > 0 && (
            <div className={styles.queue_list}>
                Далее: {waiting.join(", ")}
            </div>
        )}
    </div>;
}
