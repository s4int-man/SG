import React from "react";
import { useState } from "react";

export const useAudio = (src?: string) =>
{
    const [ audio, setAudio ] = useState<HTMLAudioElement | null>(null);

    React.useEffect(() =>
    {
        if (src == null)
            return;

        const _audio = new Audio(src);
        _audio.load();
        _audio.addEventListener('canplaythrough', () => {
            setAudio(_audio);
        });
    }, [ src ]);

    return audio;
}