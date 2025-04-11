import React from "react";
import { serverUrl } from "../../connection/Client";
import { useAudio } from "../../hooks/useAudio";

export function AudioAnswer(props: { answer: string })
{
    const audio: HTMLAudioElement | null = useAudio(serverUrl + props.answer);

    const play = React.useCallback(() => audio?.play(), [ audio ]);
    const stop = React.useCallback(() => audio?.pause(), [ audio ]);
    
    React.useEffect(() =>
    {
        play();

        return () => {
            stop();
        } 
    }, [ play, stop ]);
    
    return <React.Fragment></React.Fragment>;
}