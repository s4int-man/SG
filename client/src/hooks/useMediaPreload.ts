import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../types/RootState";
import { findQuestion, preloadNearbyRounds, preloadQuestionMedia } from "../utils/preloadMedia";

export function useMediaPreload(): void
{
    const progress = useSelector((state: RootState) => state.gameReducer.progress);
    const currentRound = useSelector((state: RootState) => state.gameReducer.currentRound);
    const selected = useSelector((state: RootState) => state.gameReducer.selectedQuestion);
    const currentQuestion = useSelector((state: RootState) => state.gameReducer.currentQuestion);

    useEffect(() =>
    {
        preloadNearbyRounds(progress, currentRound);
    }, [ progress, currentRound ]);

    useEffect(() =>
    {
        preloadQuestionMedia(findQuestion(progress, selected));
    }, [ progress, selected ]);

    useEffect(() =>
    {
        preloadQuestionMedia(currentQuestion);
    }, [ currentQuestion ]);
}
