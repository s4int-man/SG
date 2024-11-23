import { useSelector } from "react-redux";
import { IPlayer } from "../../types/IProgress";
import { IQuestion } from "../../types/IQuestion";
import { RootState } from "../../types/RootState";
import styles from "../../styles/Question.module.css";
import React from "react";
import { useAudio } from "../../hooks/useAudio";
import { serverUrl, socket } from "../../connection/Client";
import { ImageAnswer } from "./ImageAnswer";
import { TextAnswer } from "./TextAnswer";

export function TvQuestion(props: IQuestion)
{
    const answerPlayer: IPlayer | null = useSelector((state: RootState): IPlayer | null => state.gameReducer.answerPlayer);
    const audio: HTMLAudioElement | null = useAudio(serverUrl + props.audio);

    const [ answerOpened, setAnswerOpened ] = React.useState(false);

    const isImageAnswer = props.answer.includes("images");

    const openAnswer = React.useCallback(() => {
        setAnswerOpened(true);
        audio?.play();
    }, [ audio ]);

    const play = React.useCallback(() => audio?.play(), [ audio ]);
    const stop = React.useCallback(() => audio?.pause(), [ audio ]);

    React.useEffect(() =>
    {
        socket.on("audioPlay", play);
        socket.on("audioStop", stop);
        socket.on("openAnswer", openAnswer);

        return () => {
            socket.off("audioPlay", play);
            socket.off("audioStop", stop);
            socket.off("openAnswer", openAnswer);
            stop();
        } 
    }, [ play, stop, openAnswer ]);
    
    return <React.Fragment>
        <hr />
        <div className={styles.question}>
            <div className="text">
                {props.text}
            </div>
            {props.image && !answerOpened && <img className={styles.image} src={serverUrl + props.image} alt="" />}
            {props.image && answerOpened && !isImageAnswer && <img className={styles.image} src={serverUrl + props.image} alt="" />}
            {answerOpened && isImageAnswer && <ImageAnswer answer={props.answer} />}
            {answerOpened && !isImageAnswer && <TextAnswer answer={props.answer} />}
            {answerPlayer != null && <div className={styles.player_answer}>Отвечает: {answerPlayer.name}</div>}
        </div>
    </React.Fragment>;
}