import React, { useState } from "react";
import { useSelector } from "react-redux";
import config from "../../config.json";
import { socket } from "../../connection/Client";
import styles from "../../styles/Question.module.css";
import { IPlayer } from "../../types/IProgress";
import { IQuestion } from "../../types/IQuestion";
import { RootState } from "../../types/RootState";
import { CatInBag } from "./CatInBag";
import { CatInBagPlayer } from "./CatInBagPlayer";
import { CatInBagPlayerAnswered } from "./CatInBagPlayerAnswered";
import { ImageAnswer } from "./ImageAnswer";
import { TextAnswer } from "./TextAnswer";

export function PlayerQuestion(props: IQuestion)
{
    const [ answerOpened, setAnswerOpened ] = useState(false);
    const [ secondsToAnswer, setSecondsToAnswer ] = useState<number>(7);

    const leaderPlayer = useSelector((state: RootState) => state.gameReducer.leaderPlayer);
    const answerPlayer: IPlayer | null = useSelector((state: RootState): IPlayer | null => state.gameReducer.answerPlayer);
    const catInBagSelected = useSelector((state: RootState) => state.gameReducer.catInBagSelected);

    const myName = localStorage.getItem("name") || "";

    const isImageAnswer = props.answerImage != null;

    const onClick = () =>
    {
        if (secondsToAnswer > 0)
            return;

        socket.emit("answerPlayer", localStorage.getItem("name") || "");
    }

    const openAnswer = () =>
    {
        setAnswerOpened(true);
    }

    React.useEffect(() =>
    {
        socket.on("openAnswer", openAnswer);

        return () => void socket.off("openAnswer", openAnswer);
    });

    React.useEffect(() =>
    {
        if (secondsToAnswer == 0)
            return;

        setTimeout(() =>
        {
            setSecondsToAnswer(prev => prev - 1);
        }, 1000);
    }, [ secondsToAnswer ]);

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
        <hr />
        <div className={styles.question}>
            <div className="text">
                {props.text}
            </div>
            {props.image && !answerOpened && <div className={styles.image} style={{ backgroundImage: "url(" + config.server + props.image + ")" }} />}
            {props.image && answerOpened && !isImageAnswer && <div className={styles.image} style={{ backgroundImage: "url(" + config.server + props.image + ")" }} />}
            {answerOpened && isImageAnswer && <ImageAnswer answer={props.answerImage!} />}
            {answerOpened && <TextAnswer answer={props.answer} />}
            {answerPlayer != null && answerPlayer.name === myName && <div className={styles.player_answer}>Ты отвечаешь!</div>}
            {answerPlayer != null && answerPlayer.name !== myName && <div className={styles.player_answer}>Отвечает: {answerPlayer.name}</div>}
            {answerPlayer == null && !answerOpened && <button data-disabled={String(secondsToAnswer > 0)} className={styles.button} onClick={onClick}>{secondsToAnswer > 0 ? secondsToAnswer : "Ответить"}</button>}
        </div>
    </React.Fragment>;
}