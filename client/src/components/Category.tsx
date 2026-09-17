import { IQuestion } from "../types/IQuestion";
import { QuestionPrice } from "./QuestionPrice";
import styles from "../styles/Category.module.css";
import { useScreenOrientation } from "../hooks/useScreenOrientation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../types/RootState";

export function Category(props: { roundId: number, name: string; questions: IQuestion[] })
{
    const [ categoryOpened, setCategoryOpened ] = useState<boolean>(false);
    const { isPortrait } = useScreenOrientation();
    const isExhausted = props.questions.every(question => question.completed);
    const selectedQuestion = useSelector((state: RootState) => state.gameReducer.selectedQuestion);
    const hasSelected = selectedQuestion != null && selectedQuestion.category === props.name;

    useEffect(() =>
    {
        if (isExhausted)
            setCategoryOpened(false);
    }, [ isExhausted ]);

    useEffect(() =>
    {
        if (isPortrait && hasSelected)
            setCategoryOpened(true);
    }, [ isPortrait, hasSelected ]);

    const openQuestions = () =>
    {
        if (isExhausted || hasSelected)
            return;

        setCategoryOpened(state => !state);
    }

    const prices = props.questions.map(question => (
        <QuestionPrice
            key={question.id}
            roundId={props.roundId}
            category={props.name}
            question={question}
        />
    ));

    return <div className={[
        styles.category,
        categoryOpened ? styles.categoryOpened : "",
        isExhausted ? styles.categoryExhausted : "",
    ].filter(Boolean).join(" ")}>
        <div
            className={styles.category_name}
            onClick={isPortrait ? openQuestions : undefined}
            aria-expanded={isPortrait && !isExhausted ? categoryOpened : undefined}
            aria-disabled={isPortrait && (isExhausted || hasSelected) ? true : undefined}
        >
            <span className={styles.category_label}>{props.name}</span>
            {isPortrait && !isExhausted && <span className={styles.chevron} aria-hidden="true" />}
        </div>
        {isPortrait ? (
            <div className={`${styles.questions} ${categoryOpened ? styles.questionsOpen : ""}`}>
                <div className={styles.questionsInner}>
                    {prices}
                </div>
            </div>
        ) : prices}
    </div>;
}
