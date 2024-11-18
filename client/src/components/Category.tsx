import { ICompletedQuestion } from "../types/IProgress";
import { IQuestion } from "../types/IQuestion";
import { QuestionPrice } from "./QuestionPrice";

export function Category(props: { roundId: number, name: string; questions: IQuestion[], completed: ICompletedQuestion[] })
{
    return <div className="category">
        <div className="category-name">{props.name}</div>
        {props.questions.map(question => <QuestionPrice key={question.id} roundId={props.roundId} category={props.name} question={question}
            completed={props.completed.find(completed => completed.category == props.name && completed.id == question.id) != null} />)}
    </div>;
}