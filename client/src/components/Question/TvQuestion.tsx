import React from "react";
import { useSelector } from "react-redux";
import config from "../../config.json";
import { socket } from "../../connection/Client";
import { useAudio } from "../../hooks/useAudio";
import styles from "../../styles/Question.module.css";
import { IQuestion } from "../../types/IQuestion";
import { RootState } from "../../types/RootState";
import { AnswerStatus } from "./AnswerStatus";
import { AudioAnswer } from "./AudioAnswer";
import { CatInBag } from "./CatInBag";
import { ImageAnswer } from "./ImageAnswer";
import { QuestionImage } from "./QuestionImage";
import { TextAnswer } from "./TextAnswer";
import { VideoAnswer } from "./VideoAnswer";

export function TvQuestion(props: IQuestion)
{
    const catInBagSelected = useSelector((state: RootState) => state.gameReducer.catInBagSelected);
    const audio: HTMLAudioElement | null = useAudio(props.audio != null ? config.server + props.audio : undefined);
    const videoRef = React.useRef<HTMLVideoElement>(null);

    const [ answerOpened, setAnswerOpened ] = React.useState(false);
    const [ catInBagPlayed, setCatInBagPlayed ] = React.useState(false);

    const isImageAnswer = props.answerImage != null;
    const isVideoAnswer = props.answerVideo != null;
    const isAudioAnswer = props.answerAudio != null;
    const hasQuestionVideo = props.video != null;
    const showQuestionVideo = hasQuestionVideo && !(answerOpened && (isImageAnswer || isVideoAnswer || isAudioAnswer));

    const play = React.useCallback(() =>
    {
        if (hasQuestionVideo)
            void videoRef.current?.play();
        else
            void audio?.play();
    }, [ audio, hasQuestionVideo ]);

    const stop = React.useCallback(() =>
    {
        videoRef.current?.pause();
        audio?.pause();
    }, [ audio ]);

    const openAnswer = React.useCallback(() =>
    {
        setAnswerOpened(true);

        stop();

        if (!isAudioAnswer && !isVideoAnswer)
            play();
    }, [ isAudioAnswer, isVideoAnswer, play, stop ]);

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
        };
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
        <div className={styles.question}>
            <div className="text">
                {props.text}
            </div>
            {props.image && !answerOpened && <QuestionImage src={props.image} />}
            {props.image && answerOpened && !isImageAnswer && !isVideoAnswer && <QuestionImage src={props.image} />}
            {showQuestionVideo && (
                <div className={styles.videoWrap}>
                    <video
                        ref={videoRef}
                        className={styles.video}
                        src={config.server + props.video}
                        playsInline
                        preload="auto"
                    />
                </div>
            )}
            {answerOpened && isImageAnswer && <ImageAnswer answer={props.answerImage!} />}
            {answerOpened && isVideoAnswer && <VideoAnswer answer={props.answerVideo!} />}
            {answerOpened && isAudioAnswer && !isVideoAnswer && <AudioAnswer answer={props.answerAudio!} />}
            {answerOpened && <TextAnswer answer={props.answer} />}
            <AnswerStatus />
        </div>
    </React.Fragment>;
}
