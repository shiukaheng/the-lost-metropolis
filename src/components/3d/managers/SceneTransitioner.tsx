import { useState, useEffect, useContext } from "react";
import { ScenesContext } from "./ScenesManager";  // Adjust the path as needed

type SceneTransitionerProps = {
    scenes: string[];
    interval: number;  // duration in seconds between scene transitions
}

/**
 * Component for periodically doing scene transitions. Switches between given scenes every n seconds.
 */
export const SceneTransitioner: React.FC<SceneTransitionerProps> = ({ scenes, interval }) => {
    const context = useContext(ScenesContext);
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

    useEffect(() => {
        const handleTransition = () => {
            setCurrentSceneIndex((prevIndex) => (prevIndex + 1) % scenes.length);
        };

        const intervalId = setInterval(handleTransition, interval * 1000);  // convert seconds to milliseconds

        return () => {
            clearInterval(intervalId);  // Clear the interval when the component is unmounted
        };
    }, [scenes, interval]);

    useEffect(() => {
        if (context && scenes[currentSceneIndex]) {
            context.visibleScenes = [scenes[currentSceneIndex]];
        }
    }, [context, scenes, currentSceneIndex]);

    return null;  // This component does not render any visuals itself. It only manages state.
}

