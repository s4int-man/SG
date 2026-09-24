import React from "react";
import { ICategory } from "../../types/IGame";
import { IQuestion } from "../../types/IQuestion";
import { EditorQuestionRow } from "./EditorQuestionRow";
import { downloadJson, fetchProgress, isBrowserLocalhost, saveProgress, toCleanPack } from "./editorApi";
import styles from "../../styles/Editor.module.css";

type ProgressDoc = {
	rounds: ICategory[][];
	leaderPlayer?: string;
	[key: string]: unknown;
};

export function Editor()
{
	const [progress, setProgress] = React.useState<ProgressDoc | null>(null);
	const [roundIndex, setRoundIndex] = React.useState(0);
	const [loading, setLoading] = React.useState(true);
	const [saving, setSaving] = React.useState(false);
	const [status, setStatus] = React.useState<string | null>(null);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() =>
	{
		if (!isBrowserLocalhost())
		{
			setLoading(false);
			return;
		}

		let cancelled = false;
		(async () =>
		{
			try
			{
				const data = await fetchProgress() as ProgressDoc;
				if (cancelled)
					return;
				if (!Array.isArray(data?.rounds))
					throw new Error("Неверный формат progress");
				setProgress(data);
				setRoundIndex(0);
				setError(null);
			}
			catch (e)
			{
				if (!cancelled)
					setError(e instanceof Error ? e.message : String(e));
			}
			finally
			{
				if (!cancelled)
					setLoading(false);
			}
		})();

		return () => { cancelled = true; };
	}, []);

	if (!isBrowserLocalhost())
		return <div className={styles.blocked}>Редактор доступен только с localhost</div>;

	if (loading)
		return <div className={styles.page}>Загрузка…</div>;

	if (error != null && progress == null)
		return <div className={styles.page}><p className={styles.statusError}>{error}</p></div>;

	if (progress == null)
		return <div className={styles.page}>Нет данных</div>;

	const roundsCount = progress.rounds.length;
	const safeIndex = Math.min(roundIndex, Math.max(0, roundsCount - 1));
	const round = progress.rounds[safeIndex] ?? [];

	const updateQuestion = (categoryIndex: number, questionIndex: number, next: IQuestion) =>
	{
		setProgress(prev =>
		{
			if (prev == null)
				return prev;
			const rounds = prev.rounds.map((r, ri) =>
			{
				if (ri !== safeIndex)
					return r;
				return r.map((cat, ci) =>
				{
					if (ci !== categoryIndex)
						return cat;
					return {
						...cat,
						questions: cat.questions.map((q, qi) => qi === questionIndex ? next : q),
					};
				});
			});
			return { ...prev, rounds };
		});
		setStatus(null);
	};

	const onSave = async () =>
	{
		setSaving(true);
		setStatus(null);
		setError(null);
		try
		{
			await saveProgress(progress);
			setStatus("Сохранено, игрокам отправлено");
		}
		catch (e)
		{
			setError(e instanceof Error ? e.message : String(e));
		}
		finally
		{
			setSaving(false);
		}
	};

	const onSaveClean = () =>
	{
		setStatus(null);
		setError(null);
		try
		{
			const clean = toCleanPack(progress);
			downloadJson(`game-clean-roundpack.json`, clean);
			setStatus("Скачан чистый JSON (без completed / answerPlayer / leaderPlayer)");
		}
		catch (e)
		{
			setError(e instanceof Error ? e.message : String(e));
		}
	};

	return <div className={styles.page}>
		<header className={styles.header}>
			<h1 className={styles.title}>Editor</h1>
			<nav className={styles.nav}>
				<button
					type="button"
					className={styles.buttonSecondary}
					disabled={safeIndex <= 0}
					onClick={() => setRoundIndex(i => Math.max(0, i - 1))}
				>
					←
				</button>
				<span className={styles.roundLabel}>Раунд {safeIndex + 1} / {roundsCount || 1}</span>
				<button
					type="button"
					className={styles.buttonSecondary}
					disabled={safeIndex >= roundsCount - 1}
					onClick={() => setRoundIndex(i => Math.min(roundsCount - 1, i + 1))}
				>
					→
				</button>
				<button type="button" className={styles.button} disabled={saving} onClick={onSave}>
					{saving ? "…" : "Сохранить"}
				</button>
				<button type="button" className={styles.buttonSecondary} disabled={saving} onClick={onSaveClean}>
					Сохранить чистый json
				</button>
			</nav>
			{status != null && <p className={styles.status}>{status}</p>}
			{error != null && <p className={`${styles.status} ${styles.statusError}`}>{error}</p>}
		</header>

		<div className={styles.categories} key={safeIndex}>
			{round.map((category, categoryIndex) =>
				<details
					key={`${safeIndex}-${category.name}-${categoryIndex}`}
					className={styles.category}
					open={categoryIndex === 0}
				>
					<summary className={styles.categorySummary}>
						<span className={styles.chevron} aria-hidden />
						<span className={styles.categoryName}>{category.name}</span>
						<span className={styles.categoryCount}>{category.questions.length}</span>
					</summary>
					<div className={styles.categoryBody}>
						{category.questions.map((question, questionIndex) =>
							<EditorQuestionRow
								key={question.id}
								question={question}
								onChange={next => updateQuestion(categoryIndex, questionIndex, next)}
							/>
						)}
					</div>
				</details>
			)}
		</div>
	</div>;
}
