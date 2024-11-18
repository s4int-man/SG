import React from "react";
import { IQuestion } from "../types/IQuestion";

export function Answer(props: { question: IQuestion }): React.ReactElement
{
    const [ clicked, setClicked ] = React.useState(false);

    if (clicked)
        return <div className="answer">{props.question.answer}</div>

    return <button className="answer-button" onClick={(): void => setClicked(true)}>Ответ</button>
}