import config from "../../config.json";
import styles from "../../styles/Question.module.css";

export function QuestionImage(props: { src: string; alt?: string })
{
    const url = props.src.startsWith("http://") || props.src.startsWith("https://")
        ? props.src
        : config.server + props.src;

    return <div className={styles.imageWrap}>
        <img className={styles.image} src={url} alt={props.alt ?? ""} />
    </div>;
}
