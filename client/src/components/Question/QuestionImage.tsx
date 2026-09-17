import React from "react";
import styles from "../../styles/Question.module.css";
import { mediaUrl, preloadImage } from "../../utils/preloadMedia";

export function QuestionImage(props: { src: string; alt?: string })
{
    const url = mediaUrl(props.src) ?? props.src;
    const [ loaded, setLoaded ] = React.useState(false);
    const imgRef = React.useRef<HTMLImageElement>(null);

    React.useEffect(() =>
    {
        setLoaded(false);
        preloadImage(props.src);
    }, [ props.src ]);

    React.useEffect(() =>
    {
        if (imgRef.current?.complete && imgRef.current.naturalWidth > 0)
            setLoaded(true);
    }, [ url ]);

    return <div className={`${styles.imageWrap} ${loaded ? styles.imageLoaded : styles.imageLoading}`}>
        <img
            ref={imgRef}
            className={styles.image}
            src={url}
            alt={props.alt ?? ""}
            onLoad={() => setLoaded(true)}
        />
    </div>;
}
