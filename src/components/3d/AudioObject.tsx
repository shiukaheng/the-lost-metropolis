import { useLoader } from "@react-three/fiber";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Audio, AudioLoader, Group, PositionalAudio } from "three";
import { useRefState, useThreeEventListener } from "../../utilities";
import { BooleanType, NumberType, URLType } from "../viewer/ArgumentTypes";
import { VaporComponent, VaporComponentProps } from "../viewer/ComponentDeclarations";
import { genericInputs } from "../viewer/genericInputs"
import { ViewerContext } from "../viewer/ViewerContext";
import { TestObject } from "./TestObject";

type AudioObjectProps = VaporComponentProps & {
    url: string;
    autoplay?: boolean;
    loop?: boolean;
    refDistance?: number;
    volume?: number;
    positional?: boolean;
    randomizeStart?: boolean;
}

function useAudioFile(url) {
    return useLoader(AudioLoader, url);
}

/**
 * Creates an audio object of specified class, pre-connected to the viewer's audio listener.
 */
function useThreeAudio(url: string, positional: boolean, randomizeStart: boolean=false): Audio | PositionalAudio | null {
    const audioFile = useAudioFile(url) as AudioBuffer;
    const [objectRef, object, setObject] = useRefState<Audio|PositionalAudio|null>(null);
    const {audioListener, eventDispatcher} = useContext(ViewerContext);
    useEffect(()=>{
        if (!audioListener) {
            console.warn("AudioListener not found. AudioObject will not play.");
            return;
        }
        const newAudioObject = positional ? new PositionalAudio(audioListener) : new Audio(audioListener);
        newAudioObject.setBuffer(audioFile);
        setObject(newAudioObject);
        return ()=>{
            // console.log(objectRef.current);
            objectRef.current?.disconnect();
        }
    }, [audioListener, positional]);
    const play = useCallback(()=>{
        // Play if not already playing
        if (objectRef.current && !objectRef.current.isPlaying) {
            // Randomize start time if specified using currentTime property
            if (randomizeStart) {
                objectRef.current.offset = Math.random() * audioFile.duration;
            }
            objectRef.current.play();
        }
    }, []);
    useThreeEventListener("audio-start", play, eventDispatcher);
    useEffect(()=>{
        // If audio context is already ready, then invoke play
        if (audioListener?.context.state === "running") {
            play();
        }
    }, [object])
    return object;
}

export const AudioObject: VaporComponent = ({url, autoplay, loop, refDistance, volume, positional, randomizeStart=false, ...props}: AudioObjectProps) => {
    const threeAudioObject = useThreeAudio(url, positional || false, randomizeStart);
    const groupRef = useRef<Group>(null);
    useEffect(()=>{
        if (threeAudioObject) {
            threeAudioObject.setVolume(volume || 1)
            threeAudioObject.setLoop(loop || false)
            threeAudioObject.autoplay = autoplay || false;
            if (threeAudioObject instanceof PositionalAudio) {
                threeAudioObject.setRefDistance(refDistance || 1);
            }
        }
        // console.log(groupRef.current?.children)
    }, [threeAudioObject, loop, refDistance, volume])
    return (
        <group {...props} ref={groupRef}>
            {threeAudioObject ? <primitive object={threeAudioObject}/> : null}
        </group>
    );
}

AudioObject.displayName = "Audio object";
AudioObject.componentType = "AudioObject";
AudioObject.inputs = {
    ...genericInputs,
    url: {
        type: URLType,
        default: "",
    },
    // autoplay: {
    //     type: BooleanType,
    //     default: true,
    // },
    loop: {
        type: BooleanType,
        default: true,
    },
    refDistance: {
        type: NumberType,
        default: 1,
    },
    volume: {
        type: NumberType,
        default: 1,
    },
    positional: {
        type: BooleanType,  
        default: false,
    },
    randomizeStart: {
        type: BooleanType,
        default: false,
    }
};