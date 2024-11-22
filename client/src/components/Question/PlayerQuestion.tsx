import { useSelector } from "react-redux";
import { IPlayer } from "../../types/IProgress";
import { IQuestion } from "../../types/IQuestion";
import { RootState } from "../../types/RootState";
import { socket } from "../../connection/Client";

export function PlayerQuestion(props: IQuestion)
{
    const answerPlayer: IPlayer | null = useSelector((state: RootState): IPlayer | null => state.gameReducer.answerPlayer);

    const myName = localStorage.getItem("name") || "";
    const myPlayer = useSelector((state: RootState): IPlayer => state.gameReducer.players.find(p => p.name === myName)!);

    const onClick = () =>
    {
        socket.emit("answerPlayer", localStorage.getItem("name") || "");
    }

    return <div className="question">
        {answerPlayer != null && answerPlayer.name === myName && <div>Ты отвечаешь!</div>}
        {answerPlayer != null && answerPlayer.name !== myName && <div className="player">
            Отвечает: {answerPlayer.name}
        </div>}
        <div className="score">Твои очки: {myPlayer.score}. Вопрос на {props.price} очков</div>
        <div className="text">
            {props.text}
        </div>
        {answerPlayer == null && <button className="answer" onClick={onClick}>Ответить</button>}
    </div>;
}