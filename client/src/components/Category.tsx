import { IQuestion } from "../types/IQuestion";
import { QuestionPrice } from "./QuestionPrice";
import styles from "../styles/Category.module.css";
import { useScreenOrientation } from "../hooks/useScreenOrientation";
import { useState } from "react";

export function Category(props: { roundId: number, name: string; questions: IQuestion[] })
{
    const [ categoryOpened, setCategoryOpened ] = useState<boolean>(false);
    const { isPortrait } = useScreenOrientation();

    const openQuestions = () =>
    {
        console.log("category", props.name);
        setCategoryOpened(state => !state);
    }

    return <div className={styles.category}>
        <div className={styles.category_name} onClick={isPortrait ? openQuestions : undefined}>{props.name}</div>
        {(!isPortrait || categoryOpened) && props.questions.map(question => <QuestionPrice key={question.id} roundId={props.roundId} category={props.name} question={question} />)}
    </div>;
}