import { useSelector } from "react-redux";
import { IPlayer } from "../../types/IProgress";
import { IQuestion } from "../../types/IQuestion";
import { RootState } from "../../types/RootState";
import { serverUrl, socket } from "../../connection/Client";
import styles from "../../styles/Question.module.css";
import React, { useState } from "react";
import { TextAnswer } from "./TextAnswer";
import { ImageAnswer } from "./ImageAnswer";

export function PlayerQuestion(props: IQuestion)
{
    const [ answerOpened, setAnswerOpened ] = useState(false);
    
    const answerPlayer: IPlayer | null = useSelector((state: RootState): IPlayer | null => state.gameReducer.answerPlayer);

    const myName = localStorage.getItem("name") || "";

    const isImageAnswer = props.answerImage != null;

    const onClick = () =>
    {
        socket.emit("answerPlayer", localStorage.getItem("name") || "");
    }

    const openAnswer = () => {
        setAnswerOpened(true);
    }

    React.useEffect(() =>
    {
        socket.on("openAnswer", openAnswer);

        return () => void socket.off("openAnswer", openAnswer);
    })

    return <React.Fragment>
        <hr />
        <div className={styles.question}>
            <div className="text">
                {props.text}
            </div>
            {props.image && !answerOpened && <div className={styles.image} style={{ backgroundImage: "url(" + serverUrl + props.image + ")" }} />}
            {props.image && answerOpened && !isImageAnswer && <div className={styles.image} style={{ backgroundImage: "url(" + serverUrl + props.image + ")" }} />}
            {answerOpened && isImageAnswer && <ImageAnswer answer={props.answerImage!} />}
            {answerOpened && <TextAnswer answer={props.answer} />}
            {answerPlayer != null && answerPlayer.name === myName && <div className={styles.player_answer}>Ты отвечаешь!</div>}
            {answerPlayer != null && answerPlayer.name !== myName && <div className={styles.player_answer}>Отвечает: {answerPlayer.name}</div>}
            {answerPlayer == null && !answerOpened && <button className={styles.button} onClick={onClick}>Ответить</button>}
        </div>
    </React.Fragment>;
}