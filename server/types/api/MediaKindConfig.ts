/** Конфигурация вида медиа: куда класть, что принимать, какое расширение подставить. */
export interface MediaKindConfig {
    /** Каталог внутри public/, например "editor/images". */
    dir: string;
    /** Проверка Content-Type. */
    accept: RegExp;
    /** Расширение, если его не удалось взять из имени файла. */
    fallbackExt: string;
}
