import React from "react";
import { useSelector } from "react-redux";
import config from "../../config.json";
import { socket } from "../../connection/Client";
import { useAudio } from "../../hooks/useAudio";
import styles from "../../styles/Question.module.css";
import { IPlayer } from "../../types/IProgress";
import { IQuestion } from "../../types/IQuestion";
import { RootState } from "../../types/RootState";
import { AudioAnswer } from "./AudioAnswer";
import { CatInBag } from "./CatInBag";
import { ImageAnswer } from "./ImageAnswer";
import { TextAnswer } from "./TextAnswer";
import { VideoAnswer } from "./VideoAnswer";

export function TvQuestion(props: IQuestion)
{
    const answerPlayer: IPlayer | null = useSelector((state: RootState): IPlayer | null => state.gameReducer.answerPlayer);
    const catInBagSelected = useSelector((state: RootState) => state.gameReducer.catInBagSelected);
    const audio: HTMLAudioElement | null = useAudio(config.server + props.audio);

    const [ answerOpened, setAnswerOpened ] = React.useState(false);
    const [ catInBagPlayed, setCatInBagPlayed ] = React.useState(false);

    const isImageAnswer = props.answerImage != null;
    const isVideoAnswer = props.answerVideo != null;
    const isAudioAnswer = props.answerAudio != null;

    console.log("video answer", isVideoAnswer);

    const play = React.useCallback(() => audio?.play(), [ audio ]);
    const stop = React.useCallback(() => audio?.pause(), [ audio ]);

    const openAnswer = React.useCallback(() =>
    {
        setAnswerOpened(true);

        stop();

        if (isAudioAnswer || isVideoAnswer)
            stop();

        if (!isAudioAnswer && !isVideoAnswer)
            audio?.play();
    }, [ isAudioAnswer, audio, isVideoAnswer, stop ]);

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

    const catAudio: HTMLAudioElement | null = useAudio(config.server + "/audio/catInBag.mp3");
    React.useEffect(() =>
    {
        if (props.catInBag && !catInBagSelected && !answerOpened && !catInBagPlayed && catAudio != null)
        {
            catAudio.play();
            catAudio.onended = () => setCatInBagPlayed(true);
        }
    }, [ catAudio, props.catInBag, catInBagSelected, answerOpened, catInBagPlayed ]);

    if (props.catInBag && !catInBagSelected && !answerOpened)
        return <CatInBag />;
    
    return <React.Fragment>
        <hr />
        <div className={styles.question}>
            <div className="text">
                {props.text}
            </div>
            {props.image && !answerOpened && <div className={styles.image} style={{ backgroundImage: "url(" + config.server + props.image + ")" }} />}
            {props.image && answerOpened && !isImageAnswer && !isVideoAnswer && <div className={styles.image} style={{ backgroundImage: "url(" + config.server + props.image + ")" }} />}
            {answerOpened && isImageAnswer && <ImageAnswer answer={props.answerImage!} />}
            {answerOpened && isVideoAnswer && <VideoAnswer answer={props.answerVideo!} />}
            {answerOpened && isAudioAnswer && !isVideoAnswer && <AudioAnswer answer={props.answerAudio!} />}
            {answerOpened && <TextAnswer answer={props.answer} />}
            {answerPlayer != null && <div className={styles.player_answer}>Отвечает: {answerPlayer.name}</div>}
        </div>
    </React.Fragment>;
}