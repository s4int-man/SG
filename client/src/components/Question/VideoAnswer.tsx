import { serverUrl } from "../../connection/Client";
import styles from "../../styles/Question.module.css";

export function VideoAnswer(props: { answer: string })
{
    return <video width={640} autoPlay className={styles.video} src={serverUrl + props.answer} />;
}