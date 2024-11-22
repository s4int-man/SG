import { useSelector } from "react-redux";
import { IQuestion } from "../../types/IQuestion";
import { RootState } from "../../types/RootState";
import { IPlayer } from "../../types/IProgress";
import { socket } from "../../connection/Client";
import React from "react";

export function AdminQuestion(props: IQuestion)
{
    const answerPlayer: IPlayer | null = useSelector((state: RootState): IPlayer | null => state.gameReducer.answerPlayer);

    const right = () =>
    {
        socket.emit("right");
    }

    const wrong = () =>
    {
        socket.emit("wrong");
    }

    return <div className="question">
        <div className="player">
            Отвечает: {answerPlayer != null ? answerPlayer.name : "никто"}
        </div>
        <div className="text">
            {props.text}
        </div>
        <div className="answer">
            {props.answer}
        </div>
        {
            answerPlayer != null && <React.Fragment>
                <button className="right" onClick={right}>Верно</button>
                <button className="wrong" onClick={wrong}>Неверно</button>
            </React.Fragment>
        }
    </div>;
}