import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { socket } from "../../connection/Client";
import styles from "../../styles/Question.module.css";
import { IPlayer } from "../../types/IProgress";
import { IQuestion } from "../../types/IQuestion";
import { RootState } from "../../types/RootState";
import { AnswerStatus } from "./AnswerStatus";
import { CatInBagPlayer } from "./CatInBagPlayer";
import { ImageAnswer } from "./ImageAnswer";
import { QuestionImage } from "./QuestionImage";
import { TextAnswer } from "./TextAnswer";

export function AdminQuestion(props: IQuestion)
{
    const answerPlayer: IPlayer | null = useSelector((state: RootState): IPlayer | null => state.gameReducer.answerPlayer);
    const [ playClicked, setPlayClicked ] = useState(false);
    const [ answerOpened, setAnswerOpened ] = useState(false);
    const catInBagSelected = useSelector((state: RootState) => state.gameReducer.catInBagSelected);
    const openRequested = useRef(false);

    const isImageAnswer = props.answerImage != null;

    const requestOpenAnswer = () =>
    {
        if (answerOpened || openRequested.current)
            return;

        openRequested.current = true;
        socket.emit("openAnswer");
    };

    const onOpenAnswer = React.useCallback(() =>
    {
        setAnswerOpened(true);
    }, []);

    const right = () =>
    {
        socket.emit("right");
    };

    const wrong = () =>
    {
        socket.emit("wrong");
    };

    const audioPlay = () =>
    {
        socket.emit("audioPlay");
        setPlayClicked(true);
    };

    const closeQuestion = () =>
    {
        socket.emit("closeQuestion");
    };

    React.useEffect(() =>
    {
        openRequested.current = false;
        setAnswerOpened(false);
        setPlayClicked(false);
    }, [ props.id ]);

    React.useEffect(() =>
    {
        // Drop leftover HMR listeners that used to re-emit openAnswer.
        socket.removeAllListeners("openAnswer");
        socket.on("openAnswer", onOpenAnswer);
        return () =>
        {
            socket.off("openAnswer", onOpenAnswer);
        };
    }, [ onOpenAnswer ]);

    // Admin always can assign the cat-in-bag target (e.g. when Admin selected the question)
    if (props.catInBag && !catInBagSelected && !answerOpened)
        return <CatInBagPlayer />;

    return <React.Fragment>
        <div className={styles.question}>
            <div className="text">
                {props.text}
            </div>
            <AnswerStatus showPassed />
            {props.image && !isImageAnswer && <QuestionImage src={props.image} />}
            {isImageAnswer && <ImageAnswer answer={props.answerImage!} />}
            <TextAnswer answer={props.answer} />
        </div>
        <div className={styles.admin_buttons}>
            {
                answerPlayer != null && <React.Fragment>
                    <button className={styles.right_button} onClick={right}>Верно</button>
                    <button className={styles.wrong_button} onClick={wrong}>Неверно</button>
                </React.Fragment>
            }
            {props.audio != null && !playClicked && <button className={styles.button} onClick={audioPlay}>Воспроизвести</button>}
            {answerOpened && <button className={styles.close_button} onClick={closeQuestion}>Закрыть вопрос</button>}
            {answerPlayer == null && !answerOpened && <button className={styles.open_answer_button} onClick={requestOpenAnswer}>Открыть ответ</button>}
        </div>
    </React.Fragment>;
}
