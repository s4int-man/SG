import config from "../config.json";
import { ICategory, IGame } from "../types/IGame";
import { IQuestion, ISelectedQuestion } from "../types/IQuestion";

const preloaded = new Set<string>();

export function mediaUrl(path: string | undefined | null): string | null
{
    if (path == null || path === "")
        return null;

    if (path.startsWith("http://") || path.startsWith("https://"))
        return path;

    return config.server + path;
}

export function preloadImage(path: string | undefined | null): void
{
    const url = mediaUrl(path);
    if (url == null || preloaded.has(url))
        return;

    preloaded.add(url);

    const img = new Image();
    img.decoding = "async";
    img.src = url;
}

export function preloadQuestionMedia(question: IQuestion | null | undefined): void
{
    if (question == null)
        return;

    preloadImage(question.image);
    preloadImage(question.answerImage);
}

export function findQuestion(
    progress: IGame | null | undefined,
    selected: ISelectedQuestion | null | undefined
): IQuestion | null
{
    if (progress == null || selected == null)
        return null;

    const round = progress.rounds[selected.roundId] as ICategory[] | undefined;
    const category = round?.find(c => c.name === selected.category);
    return category?.questions.find(q => q.id === selected.questionId) ?? null;
}

export function preloadRoundMedia(progress: IGame | null | undefined, roundId: number): void
{
    const round = progress?.rounds?.[roundId];
    if (round == null)
        return;

    for (const category of round)
    {
        for (const question of category.questions)
        {
            if (question.completed)
                continue;

            preloadQuestionMedia(question);
        }
    }
}

/** Current + next round — warm cache before select. */
export function preloadNearbyRounds(progress: IGame | null | undefined, roundId: number): void
{
    if (progress == null)
        return;

    preloadRoundMedia(progress, roundId);
    preloadRoundMedia(progress, roundId + 1);
}
