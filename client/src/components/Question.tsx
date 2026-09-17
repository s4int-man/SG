import { useSelector } from "react-redux";
import { RootState } from "../types/RootState";
import { IQuestion } from "../types/IQuestion";
import { AdminQuestion } from "./Question/AdminQuestion";
import { TvQuestion } from "./Question/TvQuestion";
import { PlayerQuestion } from "./Question/PlayerQuestion";
import { QuestionMeta } from "./QuestionMeta";
import config from "../config.json";

export function Question()
{
    const currentQuestion: IQuestion | null = useSelector((state: RootState): IQuestion | null => state.gameReducer.currentQuestion);

    const name = localStorage.getItem("name") || "";

    if (currentQuestion == null)
        return null;

    let body;
    if (name === config.emcee)
        body = <AdminQuestion {...currentQuestion} />;
    else if (name === config.tv)
        body = <TvQuestion {...currentQuestion} />;
    else
        body = <PlayerQuestion {...currentQuestion} />;

    return <>
        <QuestionMeta />
        {body}
    </>;
}
