import {useState, useEffect} from 'react';

const getOrientation = () => window.screen.orientation.type;

export const useScreenOrientation = () => {
    const [orientation, setOrientation] = useState(getOrientation());

    useEffect(() => {
        const handleOrientationChange = () => setOrientation(getOrientation());

        window.screen.orientation.addEventListener('change', handleOrientationChange);

        return () => window.screen.orientation.removeEventListener('change', handleOrientationChange);
    }, []);

    return { isPortrait: orientation.includes("portrait") };
};