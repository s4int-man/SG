import React from "react";
import { IQuestion } from "../../types/IQuestion";
import { editorMediaUrl, uploadMedia } from "./editorApi";
import styles from "../../styles/Editor.module.css";

type Props = {
	question: IQuestion;
	packName: string;
	roundIndex: number;
	categoryIndex: number;
	onChange: (next: IQuestion) => void;
};

type MediaKind = "image" | "audio" | "video";
type MediaField = "image" | "audio" | "answerImage" | "answerAudio" | "answerVideo";

const MEDIA_SLOTS: { field: MediaField; kind: MediaKind; label: string; accept: string }[] = [
	{ field: "image", kind: "image", label: "Изображение вопроса", accept: "image/*" },
	{ field: "audio", kind: "audio", label: "Аудио вопроса", accept: "audio/*" },
	{ field: "answerImage", kind: "image", label: "Изображение ответа", accept: "image/*" },
	{ field: "answerAudio", kind: "audio", label: "Аудио ответа", accept: "audio/*" },
	{ field: "answerVideo", kind: "video", label: "Видео ответа", accept: "video/*" },
];

function mediaFlags(q: IQuestion): string
{
	const flags: string[] = [];
	if (q.image) flags.push("изобр.");
	if (q.audio) flags.push("аудио");
	if (q.answerImage) flags.push("изобр. ответа");
	if (q.answerAudio) flags.push("аудио ответа");
	if (q.answerVideo) flags.push("видео ответа");
	if (q.catInBag) flags.push("Кот в мешке");
	return flags.length ? flags.join(" · ") : "";
}

function MediaSlot(props: {
	label: string;
	kind: MediaKind;
	field: MediaField;
	accept: string;
	path: string | undefined;
	packName: string;
	roundIndex: number;
	categoryIndex: number;
	questionId: number;
	onUploaded: (path: string) => void;
})
{
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const url = editorMediaUrl(props.path);

	const openPicker = () =>
	{
		if (uploading)
			return;
		if (props.packName.trim() === "")
		{
			setError("Сначала укажи название пака");
			return;
		}
		inputRef.current?.click();
	};

	const onFile = async (file: File | undefined) =>
	{
		if (file == null)
			return;
		if (props.packName.trim() === "")
		{
			setError("Сначала укажи название пака");
			return;
		}
		setUploading(true);
		setError(null);
		try
		{
			const path = await uploadMedia(props.kind, file, {
				packName: props.packName,
				round: props.roundIndex,
				categoryId: props.categoryIndex,
				questionId: props.questionId,
				type: props.field,
			});
			props.onUploaded(path);
		}
		catch (e)
		{
			setError(e instanceof Error ? e.message : String(e));
		}
		finally
		{
			setUploading(false);
			if (inputRef.current)
				inputRef.current.value = "";
		}
	};

	const onKeyDown = (e: React.KeyboardEvent) =>
	{
		if (e.key === "Enter" || e.key === " ")
		{
			e.preventDefault();
			openPicker();
		}
	};

	return <div className={styles.mediaBlock}>
		<span className={styles.label}>{props.label}</span>
		<input
			ref={inputRef}
			type="file"
			accept={props.accept}
			className={styles.fileInput}
			onChange={e => onFile(e.target.files?.[0])}
		/>

		{uploading && <div className={styles.mediaHit}><span className={styles.mediaEmpty}>Загрузка…</span></div>}

		{!uploading && url == null && (
			<div
				className={styles.mediaHit}
				role="button"
				tabIndex={0}
				onClick={openPicker}
				onKeyDown={onKeyDown}
			>
				<span className={styles.mediaEmpty}>Нажми, чтобы загрузить</span>
			</div>
		)}

		{!uploading && url != null && props.kind === "image" && (
			<div
				className={styles.mediaHit}
				role="button"
				tabIndex={0}
				onClick={openPicker}
				onKeyDown={onKeyDown}
				title="Заменить"
			>
				<img className={styles.thumb} src={url} alt={props.label} />
			</div>
		)}

		{!uploading && url != null && props.kind === "audio" && (
			<div className={styles.mediaPlayer}>
				<audio className={styles.audio} controls src={url} />
				<button type="button" className={styles.mediaReplace} onClick={openPicker}>Заменить</button>
			</div>
		)}

		{!uploading && url != null && props.kind === "video" && (
			<div className={styles.mediaPlayer}>
				<video className={styles.video} controls src={url} />
				<button type="button" className={styles.mediaReplace} onClick={openPicker}>Заменить</button>
			</div>
		)}

		{error != null && <span className={styles.mediaError}>{error}</span>}
	</div>;
}

export function EditorQuestionRow(props: Props)
{
	const q = props.question;

	const set = <K extends keyof IQuestion>(key: K, value: IQuestion[K]) =>
	{
		props.onChange({ ...q, [key]: value });
	};

	const flags = mediaFlags(q);

	return <details className={styles.question}>
		<summary className={styles.questionSummary}>
			<span className={styles.chevron} aria-hidden />
			<span className={styles.questionPrice}>{q.price}</span>
			<span className={styles.questionTitle}>{q.text || `(id ${q.id})`}</span>
			<span className={styles.questionAnswer}>{q.answer}</span>
			{flags !== "" && <span className={styles.questionFlags}>{flags}</span>}
		</summary>

		<div className={styles.questionBody}>
			<div className={styles.meta}>
				<span>id: {q.id}</span>
				{q.completed != null && <span>completed: {String(q.completed)}</span>}
				{q.answerPlayer != null && <span>answerPlayer: {q.answerPlayer}</span>}
			</div>

			<div className={styles.fields}>
				<label className={styles.field}>
					<span className={styles.label}>Цена</span>
					<input
						className={styles.input}
						type="number"
						value={q.price}
						onChange={e => set("price", Number(e.target.value) || 0)}
					/>
				</label>

				<label className={styles.fieldWide}>
					<span className={styles.label}>Текст</span>
					<textarea
						className={styles.textarea}
						value={q.text}
						onChange={e => set("text", e.target.value)}
					/>
				</label>

				<label className={styles.fieldWide}>
					<span className={styles.label}>Ответ</span>
					<textarea
						className={styles.textarea}
						value={q.answer}
						onChange={e => set("answer", e.target.value)}
					/>
				</label>

				<label className={`${styles.checkRow} ${q.catInBag ? styles.checkRowOn : ""}`}>
					<input
						className={styles.checkInput}
						type="checkbox"
						checked={q.catInBag === true}
						onChange={e => set("catInBag", e.target.checked ? true : undefined)}
					/>
					<span className={styles.checkTitle}>Кот в мешке</span>
				</label>
			</div>

			<div className={styles.media}>
				{MEDIA_SLOTS.map(slot =>
					<MediaSlot
						key={slot.field}
						label={slot.label}
						kind={slot.kind}
						field={slot.field}
						accept={slot.accept}
						path={q[slot.field]}
						packName={props.packName}
						roundIndex={props.roundIndex}
						categoryIndex={props.categoryIndex}
						questionId={q.id}
						onUploaded={path => set(slot.field, path)}
					/>
				)}
			</div>
		</div>
	</details>;
}
