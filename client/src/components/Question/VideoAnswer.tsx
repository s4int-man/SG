import config from "../../config.json";
import styles from "../../styles/Question.module.css";

export function VideoAnswer(props: { answer: string })
{
    console.log("video answer", props.answer);
    return <video width={640} autoPlay className={styles.video} src={config.server + props.answer} />;
}