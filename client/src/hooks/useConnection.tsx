import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { socket } from "../connection/Client";
import { GameReducer } from "../store/GameReducer";
import { IGame } from "../types/IGame";
import { IPlayer } from "../types/IProgress";
import { IQuestion, ISelectedQuestion } from "../types/IQuestion";

export function useConnection()
{
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const onConnect = React.useCallback((): void =>
    {
        console.log("Status: connected");
        navigate("/login");
    }, [ navigate ]);

    const onDisconnect = () => console.log("Status: disconnected");
    const onToGame = React.useCallback(() => navigate("/screens/game"), [ navigate ]);
    const onToQuestion = React.useCallback(() => navigate("/screens/question"), [ navigate ]);
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

    const onSelectedQuestion = React.useCallback((selectedQuestion: ISelectedQuestion) =>
    {
        console.log("Selected", selectedQuestion);
        dispatch(GameReducer.actions.setSelectedQuestion(selectedQuestion));
    }, [ dispatch ]);

    const onQuestion = React.useCallback((question: IQuestion) =>
    {
        console.log("Move to", question);
        dispatch(GameReducer.actions.setCurrentQuestion(question));
        navigate("/screens/question");
    }, [ navigate, dispatch ]);

    const onAnswerPlayer = React.useCallback((answerPlayer: string | null): void =>
    {
        dispatch(GameReducer.actions.setAnswerPlayer(answerPlayer));
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
            socket.off("currentRound", onCurrentRound);
            socket.off("leaderPlayer", onLeaderPlayer);
            socket.off("catInBagSelected", onCatInBagSelected);
        }
    }, [ onConnect, onToGame, onToQuestion, onPlayers, onProgress, onSelectedQuestion, onQuestion, onAnswerPlayer, onCurrentRound, onLeaderPlayer, onCatInBagSelected ]);
}