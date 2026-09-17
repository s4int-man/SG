import { QuestionImage } from "./QuestionImage";

export function ImageAnswer(props: { answer: string })
{
    return <QuestionImage src={props.answer} alt="Ответ" />;
}
