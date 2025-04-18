import { useSelector } from "react-redux";
import { RootState } from "../types/RootState";
import { IQuestion } from "../types/IQuestion";
import { AdminQuestion } from "./Question/AdminQuestion";
import { TvQuestion } from "./Question/TvQuestion";
import { PlayerQuestion } from "./Question/PlayerQuestion";
import config from "../config.json";

export function Question()
{
    const currentQuestion: IQuestion | null = useSelector((state: RootState): IQuestion | null => state.gameReducer.currentQuestion);

    const name = localStorage.getItem("name") || "";

    if (currentQuestion == null)
        return null;

    if (name === config.emcee)
        return <AdminQuestion {...currentQuestion} />;

    if (name === config.tv)
        return <TvQuestion {...currentQuestion} />;

    return <PlayerQuestion {...currentQuestion} />;
}