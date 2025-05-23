import config from "../../config.json";
import styles from "../../styles/Question.module.css";

export function ImageAnswer(props: { answer: string })
{
    return <div className={styles.image} style={{ backgroundImage: "url(" + config.server + props.answer + ")" }} />;
}