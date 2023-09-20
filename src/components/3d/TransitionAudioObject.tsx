import { useLoader } from "@react-three/fiber";
import { AudioLoader, Audio } from "three";
import { NumberType, URLType } from "../viewer/ArgumentTypes";
import { VaporComponent, VaporComponentProps } from "../viewer/ComponentDeclarations";
import { genericInputs } from "../viewer/genericInputs";
import { useContext, useEffect, useRef } from "react";
import { ViewerContext } from "../viewer/ViewerContext";

type TransitionAudioObjectProps = VaporComponentProps & {
    url: string;
    volume?: number;
}

function useAudioFile(url) {
    return useLoader(AudioLoader, url);
}

function useSpawnAudio(url: string, volume: number = 1) {
    const audioRef = useRef<Audio | null>(null);
    const audioBuffer = useAudioFile(url) as AudioBuffer;
    const { audioListener } = useContext(ViewerContext);

    useEffect(() => {
        if (!audioBuffer || !audioListener) return;

        const audio = new Audio(audioListener);
        audio.setBuffer(audioBuffer);

        const gainNode = audio.context.createGain();
        audio.gain = gainNode;
        gainNode.gain.setValueAtTime(volume, audio.context.currentTime);
        audio.setLoop(true);
        audio.play();

        audioRef.current = audio;

        return () => {
            audio.stop();
            audioRef.current = null;
        };
    }, [audioBuffer, audioListener, volume]);

    return audioRef;
}

function useWatchScenesChange(callback) {
    const { scenes } = useContext(ViewerContext);
    const previousScenesRef = useRef<string[]>([]);  // Use a ref to store the previous state

    useEffect(()=>{
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
    const audioRef = useSpawnAudio(url, volume);

    useWatchScenesChange(() => {
        if (audioRef.current) {
            audioRef.current.stop();
            audioRef.current.play();
        }
    });

    return null;
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
