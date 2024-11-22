import { useSelector } from "react-redux";
import { RootState } from "../types/RootState";
import { IQuestion } from "../types/IQuestion";
import { AdminQuestion } from "./Question/AdminQuestion";
import { TvQuestion } from "./Question/TvQuestion";
import { PlayerQuestion } from "./Question/PlayerQuestion";

export function Question()
{
    const currentQuestion: IQuestion | null = useSelector((state: RootState): IQuestion | null => state.gameReducer.currentQuestion);

    const name = localStorage.getItem("name") || "";

    if (currentQuestion == null)
        return null;

    if (name === "Святой")
        return <AdminQuestion {...currentQuestion} />;

    if (name === "TV")
        return <TvQuestion {...currentQuestion} />;

    return <PlayerQuestion {...currentQuestion} />;
}