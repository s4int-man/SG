"use client";
import { ICompletedQuestion } from "@/app/types/IProgress";
import { QuestionPrice } from "@/components/QuestionPrice";
import { IQuestion } from "@/models/IQuestion";

export function Category(props: { roundId: number, name: string; questions: IQuestion[], completed: ICompletedQuestion[] })
{
    return <div className="category">
        <div className="category-name">{props.name}</div>
        {props.questions.map(question => <QuestionPrice key={question.id} roundId={props.roundId} category={props.name} question={question}
            completed={props.completed.find(completed => completed.category == props.name && completed.id == question.id) != null} />)}
    </div>;
}