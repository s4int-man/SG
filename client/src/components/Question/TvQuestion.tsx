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
import { VideoAnswer } from "./VideoAnswer";
import { AudioAnswer } from "./AudioAnswer";

export function TvQuestion(props: IQuestion)
{
    const answerPlayer: IPlayer | null = useSelector((state: RootState): IPlayer | null => state.gameReducer.answerPlayer);
    const audio: HTMLAudioElement | null = useAudio(serverUrl + props.audio);

    const [ answerOpened, setAnswerOpened ] = React.useState(false);

    const isImageAnswer = props.answerImage != null;
    const isVideoAnswer = props.answerVideo != null;
    const isAudioAnswer = props.answerAudio != null;

    const play = React.useCallback(() => audio?.play(), [ audio ]);
    const stop = React.useCallback(() => audio?.pause(), [ audio ]);

    const openAnswer = React.useCallback(() => {
        setAnswerOpened(true);

        stop();

        if (!isAudioAnswer)
            audio?.play();
    }, [ isAudioAnswer, audio, stop ]);

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
            {props.image && !answerOpened && <div className={styles.image} style={{ backgroundImage: "url(" + serverUrl + props.image + ")" }} />}
            {props.image && answerOpened && !isImageAnswer && !isVideoAnswer && <div className={styles.image} style={{ backgroundImage: "url(" + serverUrl + props.image + ")" }} />}
            {answerOpened && isImageAnswer && <ImageAnswer answer={props.answerImage!} />}
            {answerOpened && isVideoAnswer && <VideoAnswer answer={props.answerVideo!} />}
            {answerOpened && isAudioAnswer && !isVideoAnswer && <AudioAnswer answer={props.answerAudio!} />}
            {answerOpened && <TextAnswer answer={props.answer} />}
            {answerPlayer != null && <div className={styles.player_answer}>Отвечает: {answerPlayer.name}</div>}
        </div>
    </React.Fragment>;
}