import { IQuestion } from "../types/IQuestion";
import { QuestionPrice } from "./QuestionPrice";
import styles from "../styles/Category.module.css";

export function Category(props: { roundId: number, name: string; questions: IQuestion[] })
{
    return <div className={styles.category}>
        <div className={styles.category_name}>{props.name}</div>
        {props.questions.map(question => <QuestionPrice key={question.id} roundId={props.roundId} category={props.name} question={question} />)}
    </div>;
}