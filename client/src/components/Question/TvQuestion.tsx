import { useSelector } from "react-redux";
import { IPlayer } from "../../types/IProgress";
import { IQuestion } from "../../types/IQuestion";
import { RootState } from "../../types/RootState";

export function TvQuestion(props: IQuestion)
{
    const player: IPlayer | null = useSelector((state: RootState): IPlayer | null => state.gameReducer.answerPlayer);
    
    return <div className="question">
        <div className="player">
            Отвечает: {player != null ? player.name : "никто"}
        </div>
        <div className="text">
            {props.text}
        </div>
    </div>;
}