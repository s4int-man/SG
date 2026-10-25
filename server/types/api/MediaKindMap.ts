import type { MediaKind } from "./MediaKind";
import type { MediaKindConfig } from "./MediaKindConfig";

/** Реестр MEDIA_KINDS: ключ — MediaKind. */
export type MediaKindMap = Record<MediaKind, MediaKindConfig>;
