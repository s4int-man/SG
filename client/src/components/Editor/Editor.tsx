import React from "react";
import { ICategory } from "../../types/IGame";
import { IQuestion } from "../../types/IQuestion";
import { EditorQuestionRow } from "./EditorQuestionRow";
import { downloadJson, fetchProgress, isBrowserLocalhost, saveProgress, slugPackName, toCleanPack } from "./editorApi";
import styles from "../../styles/Editor.module.css";

type ProgressDoc = {
	name?: string;
	rounds: ICategory[][];
	leaderPlayer?: string;
	[key: string]: unknown;
};

function nextQuestionId(questions: IQuestion[]): number
{
	let max = 0;
	for (const q of questions)
	{
		if (typeof q.id === "number" && q.id > max)
			max = q.id;
	}
	return max + 1;
}

function createQuestion(questions: IQuestion[]): IQuestion
{
	const prices = questions.map(q => q.price).filter(p => typeof p === "number");
	const lastPrice = prices.length > 0 ? prices[prices.length - 1] : 0;
	return {
		id: nextQuestionId(questions),
		price: lastPrice > 0 ? lastPrice + 100 : 100,
		text: "",
		answer: "",
	};
}

export function Editor()
{
	const [progress, setProgress] = React.useState<ProgressDoc | null>(null);
	const [roundIndex, setRoundIndex] = React.useState(0);
	const [openCategory, setOpenCategory] = React.useState(0);
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
				setOpenCategory(0);
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

	const touch = () => setStatus(null);

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
		touch();
	};

	const updateCategoryName = (categoryIndex: number, name: string) =>
	{
		setProgress(prev =>
		{
			if (prev == null)
				return prev;
			const rounds = prev.rounds.map((r, ri) =>
			{
				if (ri !== safeIndex)
					return r;
				return r.map((cat, ci) => ci === categoryIndex ? { ...cat, name } : cat);
			});
			return { ...prev, rounds };
		});
		touch();
	};

	const addRound = () =>
	{
		setProgress(prev =>
		{
			if (prev == null)
				return prev;
			return {
				...prev,
				rounds: [...prev.rounds, [{ name: "Новая категория", questions: [] }]],
			};
		});
		const nextIndex = roundsCount;
		setRoundIndex(nextIndex);
		setOpenCategory(0);
		touch();
	};

	const addCategory = () =>
	{
		if (roundsCount === 0)
		{
			addRound();
			return;
		}
		setProgress(prev =>
		{
			if (prev == null)
				return prev;
			const rounds = prev.rounds.map((r, ri) =>
			{
				if (ri !== safeIndex)
					return r;
				return [...r, { name: "Новая категория", questions: [] }];
			});
			return { ...prev, rounds };
		});
		setOpenCategory(round.length);
		touch();
	};

	const addQuestion = (categoryIndex: number) =>
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
						questions: [...cat.questions, createQuestion(cat.questions)],
					};
				});
			});
			return { ...prev, rounds };
		});
		setOpenCategory(categoryIndex);
		touch();
	};

	const goRound = (index: number) =>
	{
		setRoundIndex(index);
		setOpenCategory(0);
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
			const fileBase = slugPackName(typeof progress.name === "string" ? progress.name : "pack");
			downloadJson(`${fileBase}.json`, clean);
			setStatus("Скачан чистый JSON (без completed / answerPlayer / leaderPlayer)");
		}
		catch (e)
		{
			setError(e instanceof Error ? e.message : String(e));
		}
	};

	const packName = typeof progress.name === "string" ? progress.name : "";

	return <div className={styles.page}>
		<header className={styles.header}>
			<h1 className={styles.title}>Editor</h1>
			<label className={styles.packNameField}>
				<span className={styles.label}>Название пака</span>
				<input
					className={styles.input}
					value={packName}
					placeholder="например birthday"
					onChange={e =>
					{
						const value = e.target.value;
						setProgress(prev => prev == null ? prev : { ...prev, name: value });
						touch();
					}}
				/>
			</label>
			<nav className={styles.nav}>
				<button
					type="button"
					className={styles.buttonSecondary}
					disabled={safeIndex <= 0}
					onClick={() => goRound(Math.max(0, safeIndex - 1))}
				>
					←
				</button>
				<span className={styles.roundLabel}>Раунд {roundsCount === 0 ? 0 : safeIndex + 1} / {roundsCount || 0}</span>
				<button
					type="button"
					className={styles.buttonSecondary}
					disabled={safeIndex >= roundsCount - 1 || roundsCount === 0}
					onClick={() => goRound(Math.min(roundsCount - 1, safeIndex + 1))}
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

			<div className={styles.actions}>
				<button type="button" className={styles.buttonSecondary} onClick={addRound}>
					+ Раунд
				</button>
				<button type="button" className={styles.buttonSecondary} onClick={addCategory} disabled={roundsCount === 0}>
					+ Категория
				</button>
			</div>

			{status != null && <p className={styles.status}>{status}</p>}
			{error != null && <p className={`${styles.status} ${styles.statusError}`}>{error}</p>}
		</header>

		{roundsCount === 0 ? (
			<p className={styles.status}>Нет раундов — нажми «+ Раунд»</p>
		) : (
			<div className={styles.categories} key={safeIndex}>
				{round.map((category, categoryIndex) =>
					<details
						key={`${safeIndex}-cat-${categoryIndex}`}
						className={styles.category}
						open={openCategory === categoryIndex}
						onToggle={e =>
						{
							const el = e.currentTarget;
							if (el.open)
								setOpenCategory(categoryIndex);
							else if (openCategory === categoryIndex)
								setOpenCategory(-1);
						}}
					>
						<summary className={styles.categorySummary}>
							<span className={styles.chevron} aria-hidden />
							<input
								className={styles.categoryNameInput}
								value={category.name}
								onClick={e => e.stopPropagation()}
								onMouseDown={e => e.stopPropagation()}
								onChange={e => updateCategoryName(categoryIndex, e.target.value)}
								aria-label="Название категории"
							/>
							<span className={styles.categoryCount}>{category.questions.length}</span>
						</summary>
						<div className={styles.categoryBody}>
							{category.questions.map((question, questionIndex) =>
								<EditorQuestionRow
									key={`${categoryIndex}-${question.id}-${questionIndex}`}
									question={question}
									packName={packName}
									roundIndex={safeIndex}
									categoryIndex={categoryIndex}
									onChange={next => updateQuestion(categoryIndex, questionIndex, next)}
								/>
							)}
							<button
								type="button"
								className={styles.addQuestionBtn}
								onClick={() => addQuestion(categoryIndex)}
							>
								+ Вопрос
							</button>
						</div>
					</details>
				)}
			</div>
		)}
	</div>;
}
