import { serverUrl } from "../../connection/Client";
import styles from "../../styles/Question.module.css";

export function ImageAnswer(props: { answer: string })
{
    return <img className={styles.image} src={serverUrl + props.answer} alt="" />;
}