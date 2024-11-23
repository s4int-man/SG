import styles from "../../styles/Question.module.css";

export function TextAnswer(props: { answer: string })
{
    return <div className={styles.answer}>
        ОТВЕТ: {props.answer}
    </div>
}