import React, { useState } from "react";
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
    const leaderPlayer = useSelector((state: RootState) => state.gameReducer.leaderPlayer);
    const answerQueue = useSelector((state: RootState) => state.gameReducer.answerQueue);
    const passedPlayers = useSelector((state: RootState) => state.gameReducer.passedPlayers);
    const answerPlayer = useSelector((state: RootState) => state.gameReducer.answerPlayer);
    const answerQueueEnabled = useSelector((state: RootState) => state.gameReducer.answerQueueEnabled);
    const answerCooldownTimer = useSelector((state: RootState) => state.gameReducer.answerCooldownTimer);
    const catInBagSelected = useSelector((state: RootState) => state.gameReducer.catInBagSelected);

    const [ answerOpened, setAnswerOpened ] = useState(false);

    const myName = localStorage.getItem("name") || "";
    const inQueue = answerQueue.includes(myName);
    const hasPassed = passedPlayers.includes(myName);
    const iAmAnswering = answerPlayer != null && answerPlayer.name === myName;
    const someoneAnswering = answerPlayer != null && answerPlayer.name !== myName;
    const canJoinQueue = answerQueueEnabled || !someoneAnswering;
    const secondsToAnswer = answerCooldownTimer ?? 0;
    const buttonsLocked = secondsToAnswer > 0 && !props.catInBag;
    const showAnswerButton = !inQueue && canJoinQueue;
    const showPassButton = !iAmAnswering;

    const isImageAnswer = props.answerImage != null;

    const onAnswer = () =>
    {
        if (buttonsLocked || inQueue || hasPassed || iAmAnswering)
            return;

        socket.emit("answerPlayer", myName);
    };

    const onPass = () =>
    {
        if (hasPassed || iAmAnswering)
            return;

        socket.emit("passQuestion", myName);
    };

    const onOpenAnswer = React.useCallback(() =>
    {
        setAnswerOpened(true);
    }, []);

    React.useEffect(() =>
    {
        socket.on("openAnswer", onOpenAnswer);
        return () => void socket.off("openAnswer", onOpenAnswer);
    }, [ onOpenAnswer ]);

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
        onAnswer();

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
            {hasPassed && !answerOpened && (
                <div className={styles.passed_label}>Ты пасанул</div>
            )}
            {!answerOpened && !hasPassed && !props.catInBag && (showAnswerButton || showPassButton) && (
                <div className={styles.player_actions}>
                    {showAnswerButton && (
                        <button
                            type="button"
                            data-disabled={String(buttonsLocked)}
                            className={styles.answer_button}
                            onClick={onAnswer}
                        >
                            {buttonsLocked ? secondsToAnswer : "Ответить"}
                        </button>
                    )}
                    {showPassButton && (
                        <button
                            type="button"
                            className={styles.pass_button}
                            onClick={onPass}
                        >
                            Пас
                        </button>
                    )}
                </div>
            )}
        </div>
    </React.Fragment>;
}
