import { useSelector } from "react-redux";
import styles from "../styles/QuestionMeta.module.css";
import { RootState } from "../types/RootState";
import { IQuestion } from "../types/IQuestion";

function findCategoryName(
    rounds: { name: string; questions: IQuestion[] }[][] | undefined,
    roundId: number,
    question: IQuestion,
    selectedCategory?: string
): string | undefined
{
    if (selectedCategory)
        return selectedCategory;

    const round = rounds?.[roundId];
    if (round == null)
        return undefined;

    for (const category of round)
    {
        if (category.questions.some(q => q.id === question.id && q.price === question.price && q.text === question.text))
            return category.name;
    }

    return undefined;
}

export function QuestionMeta()
{
    const question = useSelector((state: RootState) => state.gameReducer.currentQuestion);
    const selected = useSelector((state: RootState) => state.gameReducer.selectedQuestion);
    const progress = useSelector((state: RootState) => state.gameReducer.progress);
    const currentRound = useSelector((state: RootState) => state.gameReducer.currentRound);

    if (question == null)
        return null;

    const category = findCategoryName(
        progress.rounds,
        selected?.roundId ?? currentRound,
        question,
        selected?.category
    );

    return <div className={styles.meta}>
        {category != null && <span className={styles.category}>{category}</span>}
        {category != null && <span className={styles.sep} aria-hidden="true">·</span>}
        <span className={styles.price}>{question.price}</span>
    </div>;
}
