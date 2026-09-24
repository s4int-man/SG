const EDITOR_API_BASE = "http://127.0.0.1:4000";

export function editorMediaUrl(path: string | undefined): string | null
{
	if (path == null || path === "")
		return null;
	if (path.startsWith("http://") || path.startsWith("https://"))
		return path;
	return EDITOR_API_BASE + path;
}

export async function fetchProgress(): Promise<unknown>
{
	const res = await fetch(`${EDITOR_API_BASE}/api/progress`);
	if (!res.ok)
		throw new Error(res.status === 403 ? "Только localhost" : `Ошибка загрузки (${res.status})`);
	return res.json();
}

export async function saveProgress(body: unknown): Promise<void>
{
	const res = await fetch(`${EDITOR_API_BASE}/api/progress`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	if (!res.ok)
	{
		const text = await res.text();
		throw new Error(res.status === 403 ? "Только localhost" : text || `Ошибка сохранения (${res.status})`);
	}
}

export async function uploadMedia(kind: "image" | "audio" | "video", file: File): Promise<string>
{
	const qs = new URLSearchParams({ filename: file.name || `file` });
	const res = await fetch(`${EDITOR_API_BASE}/api/media/${kind}?${qs}`, {
		method: "POST",
		headers: {
			"Content-Type": file.type || "application/octet-stream",
		},
		body: file,
	});
	if (!res.ok)
	{
		const text = await res.text();
		throw new Error(res.status === 403 ? "Только localhost" : text || `Ошибка загрузки (${res.status})`);
	}
	const data = await res.json() as { path?: string };
	if (data.path == null || data.path === "")
		throw new Error("Сервер не вернул путь");
	return data.path;
}

export function isBrowserLocalhost(): boolean
{
	const host = window.location.hostname;
	return host === "localhost" || host === "127.0.0.1";
}

const PROGRESS_QUESTION_KEYS = new Set(["completed", "answerPlayer"]);

export function toCleanPack(doc: { rounds?: unknown }): { rounds: unknown }
{
	const rounds = Array.isArray(doc.rounds)
		? doc.rounds.map((round: unknown) =>
		{
			if (!Array.isArray(round))
				return [];
			return round.map((category: any) => ({
				name: category?.name ?? "",
				questions: Array.isArray(category?.questions)
					? category.questions.map((q: Record<string, unknown>) =>
					{
						const clean: Record<string, unknown> = {};
						for (const [key, value] of Object.entries(q ?? {}))
						{
							if (PROGRESS_QUESTION_KEYS.has(key) || value === undefined)
								continue;
							clean[key] = value;
						}
						return clean;
					})
					: [],
			}));
		})
		: [];

	return { rounds };
}

export function downloadJson(filename: string, data: unknown): void
{
	const blob = new Blob([JSON.stringify(data, null, "\t")], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
