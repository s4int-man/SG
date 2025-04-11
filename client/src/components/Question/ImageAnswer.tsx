import { serverUrl } from "../../connection/Client";
import styles from "../../styles/Question.module.css";

export function ImageAnswer(props: { answer: string })
{
    return <div className={styles.image} style={{ backgroundImage: "url(" + serverUrl + props.answer + ")" }} />;
}