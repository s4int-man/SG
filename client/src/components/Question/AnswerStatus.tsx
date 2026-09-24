import { useSelector } from "react-redux";
import styles from "../../styles/Question.module.css";
import { RootState } from "../../types/RootState";

export function AnswerStatus(props: { myName?: string; showPassed?: boolean })
{
    const answerPlayer = useSelector((state: RootState) => state.gameReducer.answerPlayer);
    const answerQueue = useSelector((state: RootState) => state.gameReducer.answerQueue);
    const passedPlayers = useSelector((state: RootState) => state.gameReducer.passedPlayers);
    const answerTimer = useSelector((state: RootState) => state.gameReducer.answerTimer);
    const answerQueueEnabled = useSelector((state: RootState) => state.gameReducer.answerQueueEnabled);
    const myName = props.myName ?? "";

    const current = answerPlayer?.name ?? answerQueue[0];
    const waiting = answerQueueEnabled && answerQueue.length > 1 ? answerQueue.slice(1) : [];
    const myIndex = myName && answerQueueEnabled ? answerQueue.indexOf(myName) : -1;
    const showPassed = props.showPassed === true && passedPlayers.length > 0;
    const secondsLeft = answerTimer;

    if (answerQueue.length === 0 && answerPlayer == null && !showPassed)
        return null;

    return <div className={styles.answer_status}>
        {current != null && (
            <div className={styles.player_answer}>
                {myName !== "" && current === myName ? "Ты отвечаешь!" : `Отвечает: ${current}`}
            </div>
        )}
        {secondsLeft != null && current != null && (
            <div className={`${styles.answer_timer} ${secondsLeft <= 5 ? styles.answer_timer_urgent : ""}`}>
                {secondsLeft}с
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
        {showPassed && (
            <div className={styles.passed_list}>
                Пас: {passedPlayers.join(", ")}
            </div>
        )}
    </div>;
}
