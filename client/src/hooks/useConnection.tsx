import React from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { socket } from "../connection/Client";
import { GameReducer } from "../store/GameReducer";
import { IGame } from "../types/IGame";
import { IPlayer } from "../types/IProgress";
import { IQuestion, ISelectedQuestion } from "../types/IQuestion";

export function useConnection()
{
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const pathRef = React.useRef(location.pathname);
    pathRef.current = location.pathname;

    const isEditor = () => pathRef.current.startsWith("/editor");

    const onConnect = React.useCallback((): void =>
    {
        console.log("Status: connected");
        if (!isEditor())
            navigate("/login");
    }, [ navigate ]);

    const onDisconnect = () => console.log("Status: disconnected");
    const onToGame = React.useCallback(() => {
        if (isEditor())
            return;
        navigate("/screens/game");
        dispatch(GameReducer.actions.setCurrentQuestion(null));
        dispatch(GameReducer.actions.setSelectedQuestion(null));
        dispatch(GameReducer.actions.setAnswerQueue([]));
        dispatch(GameReducer.actions.setAnswerPlayer(null));
        dispatch(GameReducer.actions.setPassedPlayers([]));
        dispatch(GameReducer.actions.setAnswerTimer(null));
    }, [ navigate, dispatch ]);
    const onToQuestion = React.useCallback(() => {
        if (!isEditor())
            navigate("/screens/question");
    }, [ navigate ]);
    const onPlayers = React.useCallback((players: IPlayer[]): void =>
    {
        console.log("players", players);

        dispatch(GameReducer.actions.setPlayers(players));
    }, [ dispatch ]);

    const onProgress = React.useCallback((progress: IGame): void =>
    {
        console.log("Progress", progress);

        dispatch(GameReducer.actions.setProgress(progress));
    }, [ dispatch ]);

    const onSelectedQuestion = React.useCallback((selectedQuestion: ISelectedQuestion | null) =>
    {
        console.log("Selected", selectedQuestion);
        dispatch(GameReducer.actions.setSelectedQuestion(selectedQuestion));
    }, [ dispatch ]);

    const onQuestion = React.useCallback((question: IQuestion) =>
    {
        console.log("Move to", question);
        dispatch(GameReducer.actions.setCurrentQuestion(question));
        if (!isEditor())
            navigate("/screens/question");
    }, [ navigate, dispatch ]);

    const onAnswerPlayer = React.useCallback((answerPlayer: string | null): void =>
    {
        dispatch(GameReducer.actions.setAnswerPlayer(answerPlayer));
    }, [ dispatch ]);

    const onAnswerQueue = React.useCallback((answerQueue: string[]): void =>
    {
        dispatch(GameReducer.actions.setAnswerQueue(answerQueue ?? []));
    }, [ dispatch ]);

    const onPassedPlayers = React.useCallback((passedPlayers: string[]): void =>
    {
        dispatch(GameReducer.actions.setPassedPlayers(passedPlayers ?? []));
    }, [ dispatch ]);

    const onAnswerTimeLimit = React.useCallback((seconds: number): void =>
    {
        dispatch(GameReducer.actions.setAnswerTimeLimit(Number(seconds) || 30));
    }, [ dispatch ]);

    const onAnswerTimer = React.useCallback((secondsLeft: number | null): void =>
    {
        dispatch(GameReducer.actions.setAnswerTimer(secondsLeft));
    }, [ dispatch ]);

    const onGameSettings = React.useCallback((next: { answerTimeLimitSec?: number; answerQueueEnabled?: boolean; answerCooldownSec?: number }): void =>
    {
        dispatch(GameReducer.actions.setGameSettings(next ?? {}));
        if (next?.answerTimeLimitSec != null)
            dispatch(GameReducer.actions.setAnswerTimeLimit(Number(next.answerTimeLimitSec) || 30));
    }, [ dispatch ]);

    const onCurrentRound = React.useCallback((currentRound: number): void =>
    {
        console.log("currentRound", currentRound);
        dispatch(GameReducer.actions.setCurrentRound(currentRound));
    }, [ dispatch ]);

    const onLeaderPlayer = React.useCallback((playerName: string | undefined) =>
    {
        dispatch(GameReducer.actions.setLeaderPlayer(playerName));
    }, [ dispatch ]);

    const onCatInBagSelected = React.useCallback((catInBagSelected: boolean) =>
    {
        dispatch(GameReducer.actions.setCatInBagSelected(catInBagSelected));
    }, [ dispatch ]);

    React.useEffect(() =>
    {
        socket.on("connect", onConnect);
        socket.on("disconnect",onDisconnect);
        socket.on("to_game", onToGame);
        socket.on("to_question", onToQuestion);
        socket.on("players", onPlayers);
        socket.on("progress", onProgress);
        socket.on("selected", onSelectedQuestion);
        socket.on("question", onQuestion);
        socket.on("answerPlayer", onAnswerPlayer);
        socket.on("answerQueue", onAnswerQueue);
        socket.on("passedPlayers", onPassedPlayers);
        socket.on("answerTimeLimit", onAnswerTimeLimit);
        socket.on("answerTimer", onAnswerTimer);
        socket.on("gameSettings", onGameSettings);
        socket.on("currentRound", onCurrentRound);
        socket.on("leaderPlayer", onLeaderPlayer);
        socket.on("catInBagSelected", onCatInBagSelected);

        return () =>
        {
            socket.off("connect", onConnect);
            socket.off("disconnect",onDisconnect);
            socket.off("to_game", onToGame);
            socket.off("to_question", onToQuestion);
            socket.off("players", onPlayers);
            socket.off("progress", onProgress);
            socket.off("selected", onSelectedQuestion);
            socket.off("question", onQuestion);
            socket.off("answerPlayer", onAnswerPlayer);
            socket.off("answerQueue", onAnswerQueue);
            socket.off("passedPlayers", onPassedPlayers);
            socket.off("answerTimeLimit", onAnswerTimeLimit);
            socket.off("answerTimer", onAnswerTimer);
            socket.off("gameSettings", onGameSettings);
            socket.off("currentRound", onCurrentRound);
            socket.off("leaderPlayer", onLeaderPlayer);
            socket.off("catInBagSelected", onCatInBagSelected);
        }
    }, [ onConnect, onToGame, onToQuestion, onPlayers, onProgress, onSelectedQuestion, onQuestion, onAnswerPlayer, onAnswerQueue, onPassedPlayers, onAnswerTimeLimit, onAnswerTimer, onGameSettings, onCurrentRound, onLeaderPlayer, onCatInBagSelected ]);
}
