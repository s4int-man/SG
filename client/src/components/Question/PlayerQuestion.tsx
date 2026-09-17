import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { socket } from "../../connection/Client";
import styles from "../../styles/Question.module.css";
import { IQuestion } from "../../types/IQuestion";
import { RootState } from "../../types/RootState";
import { AnswerStatus } from "./AnswerStatus";
import { CatInBag } from "./CatInBag";
import { CatInBagPlayer } from "./CatInBagPlayer";
import { CatInBagPlayerAnswered } from "./CatInBagPlayerAnswered";
import { ImageAnswer } from "./ImageAnswer";
import { QuestionImage } from "./QuestionImage";
import { TextAnswer } from "./TextAnswer";

export function PlayerQuestion(props: IQuestion)
{
    const [ answerOpened, setAnswerOpened ] = useState(false);
    const [ secondsToAnswer, setSecondsToAnswer ] = useState<number>(5);

    const leaderPlayer = useSelector((state: RootState) => state.gameReducer.leaderPlayer);
    const answerQueue = useSelector((state: RootState) => state.gameReducer.answerQueue);
    const catInBagSelected = useSelector((state: RootState) => state.gameReducer.catInBagSelected);

    const timeout = useRef<NodeJS.Timeout | null>(null);

    const myName = localStorage.getItem("name") || "";
    const inQueue = answerQueue.includes(myName);

    const isImageAnswer = props.answerImage != null;

    const onClick = () =>
    {
        if (secondsToAnswer > 0 && !props.catInBag)
        {
            if (timeout.current != null)
                clearTimeout(timeout.current);

            setSecondsToAnswer(prev => prev + 1);
            return;
        }

        if (inQueue)
            return;

        socket.emit("answerPlayer", myName);
    };

    const openAnswer = () =>
    {
        setAnswerOpened(true);
    };

    React.useEffect(() =>
    {
        socket.on("openAnswer", openAnswer);

        return () => void socket.off("openAnswer", openAnswer);
    });

    React.useEffect((): void =>
    {
        if (secondsToAnswer == 0 || props.catInBag)
        {
            if (timeout.current != null)
                clearTimeout(timeout.current);
            return;
        }

        timeout.current = setTimeout(() =>
        {
            setSecondsToAnswer(prev => prev - 1);
        }, 1000);
    }, [ props, secondsToAnswer ]);

    if (props.catInBag && !catInBagSelected && !answerOpened)
    {
        if (leaderPlayer == myName)
            return <CatInBagPlayer />;
        else
            return <CatInBag />;
    }

    if (props.catInBag && leaderPlayer !== myName && !answerOpened)
        return <CatInBagPlayerAnswered />;

    if (props.catInBag && !answerOpened)
        onClick();

    return <React.Fragment>
        <div className={styles.question}>
            <div className="text">
                {props.text}
            </div>
            {props.image && !answerOpened && <QuestionImage src={props.image} />}
            {props.image && answerOpened && !isImageAnswer && <QuestionImage src={props.image} />}
            {answerOpened && isImageAnswer && <ImageAnswer answer={props.answerImage!} />}
            {answerOpened && <TextAnswer answer={props.answer} />}
            <AnswerStatus myName={myName} />
            {!answerOpened && !inQueue && (
                <button
                    data-disabled={String(secondsToAnswer > 0)}
                    className={styles.answer_button}
                    onClick={onClick}
                >
                    {secondsToAnswer > 0 ? secondsToAnswer : "Ответить"}
                </button>
            )}
        </div>
    </React.Fragment>;
}
