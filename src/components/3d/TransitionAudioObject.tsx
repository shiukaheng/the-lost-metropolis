import { useLoader } from "@react-three/fiber";
import { AudioLoader, Audio } from "three";
import { NumberType, URLType } from "../viewer/ArgumentTypes";
import { VaporComponent, VaporComponentProps } from "../viewer/ComponentDeclarations";
import { genericInputs } from "../viewer/genericInputs";
import { useCallback, useContext, useEffect, useRef } from "react";
import { ViewerContext } from "../viewer/ViewerContext";

type TransitionAudioObjectProps = VaporComponentProps & {
    url: string;
    volume?: number;
}

function useAudioFile(url) {
    return useLoader(AudioLoader, url);
}

function useSpawnAudio(url: string, volume: number = 1) {
    const audioBuffer = useAudioFile(url) as AudioBuffer;
    const { audioListener } = useContext(ViewerContext);
    const activeAudios = useRef<Audio[]>([]);  // store all active audio instances

    const spawnAudio = useCallback(() => {
        if (!audioBuffer || !audioListener) return;

        const audio = new Audio(audioListener);
        audio.setBuffer(audioBuffer);

        const gainNode = audio.context.createGain();
        audio.gain = gainNode;
        gainNode.gain.setValueAtTime(volume, audio.context.currentTime);
        audio.setLoop(true);
        audio.play();

        activeAudios.current.push(audio); // store this audio in the activeAudios ref

        // audio.onended = () => {
        //     activeAudios.current = activeAudios.current.filter(a => a !== audio);
        // };

        return audio;
    }, [audioBuffer, audioListener, volume]);

    useEffect(() => {
        return () => {
            // Cleanup all active audio instances when the component is unmounted
            activeAudios.current.forEach(audio => {
                audio.stop();
            });
        };
    }, []);

    return spawnAudio;
}

function useWatchScenesChange(callback) {
    const { scenes } = useContext(ViewerContext);
    const previousScenesRef = useRef<string[]>([]);

    useEffect(()=>{
        if (scenes === null) return;
        const currentScenes = scenes.filter(scene => scene !== "");
        const previousScenes = previousScenesRef.current.filter(scene => scene !== "");

        const hasChanges = currentScenes.some(scene => !previousScenes.includes(scene))
            || previousScenes.some(scene => !currentScenes.includes(scene));

        if (hasChanges) {
            callback();
        }

        previousScenesRef.current = scenes.slice();
    }, [scenes, callback]);
}

export const TransitionAudioObject: VaporComponent = ({ url, volume, ...props }: TransitionAudioObjectProps) => {
    const spawnAudio = useSpawnAudio(url, volume);

    useWatchScenesChange(() => {
        spawnAudio(); // Spawn a new audio every time the scene changes
    });

    return null
}

TransitionAudioObject.displayName = "Transition audio object";
TransitionAudioObject.componentType = "TransitionAudioObject";
TransitionAudioObject.inputs = {
    ...genericInputs,
    url: {
        type: URLType,
        default: "",
    },
    volume: {
        type: NumberType,
        default: 1,
    }
};
