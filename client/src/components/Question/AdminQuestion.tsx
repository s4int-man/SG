import React, { useState } from "react";
import { useSelector } from "react-redux";
import { socket } from "../../connection/Client";
import styles from "../../styles/Question.module.css";
import { IPlayer } from "../../types/IProgress";
import { IQuestion } from "../../types/IQuestion";
import { RootState } from "../../types/RootState";
import { CatInBag } from "./CatInBag";
import { ImageAnswer } from "./ImageAnswer";
import { TextAnswer } from "./TextAnswer";

export function AdminQuestion(props: IQuestion)
{
    const answerPlayer: IPlayer | null = useSelector((state: RootState): IPlayer | null => state.gameReducer.answerPlayer);
    const [ playClicked, setPlayClicked ] = useState(false);
    const [ answerOpened, setAnswerOpened ] = useState(false);
    const catInBagSelected = useSelector((state: RootState) => state.gameReducer.catInBagSelected);

    const isImageAnswer = props.answerImage != null;

    const openAnswer = () =>
    {
        setAnswerOpened(true);
        socket.emit("openAnswer");
    }

    const right = () =>
    {
        socket.emit("right");
        openAnswer();
    }

    const wrong = () =>
    {
        socket.emit("wrong");
    }

    const audioPlay = () =>
    {
        socket.emit("audioPlay");
        setPlayClicked(true);
    }

    const closeQuestion = () =>
    {
        socket.emit("closeQuestion");
    }

    React.useEffect(() =>
    {
        socket.on("openAnswer", openAnswer);

        return () => void socket.off("openAnswer", openAnswer);
    });

    if (props.catInBag && !catInBagSelected && !answerOpened)
        return <CatInBag />;

    return <React.Fragment>
        <div className={styles.question}>
            <div className="text">
                {props.text}
            </div>
            {answerPlayer != null && <div className={styles.player_answer}>Отвечает: {answerPlayer.name}</div>}
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
            {answerPlayer == null && !answerOpened && <button className={styles.close_button} onClick={openAnswer}>Открыть ответ</button>}
        </div>
    </React.Fragment>;
}