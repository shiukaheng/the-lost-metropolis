import { useFrame, useLoader } from "@react-three/fiber";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Audio, AudioLoader, Group, PositionalAudio } from "three";
import { useRefState, useThreeEventListener } from "../../utilities";
import { BooleanType, NumberType, URLType } from "../viewer/ArgumentTypes";
import { VaporComponent, VaporComponentProps } from "../viewer/ComponentDeclarations";
import { genericInputs } from "../viewer/genericInputs"
import { ViewerContext } from "../viewer/ViewerContext";

type AudioObjectProps = VaporComponentProps & {
    url: string;
    autoplay?: boolean;
    loop?: boolean;
    refDistance?: number;
    volume?: number;
    positional?: boolean;
    randomizeStart?: boolean;
    overlapLength: number;
}

function useAudioFile(url) {
    return useLoader(AudioLoader, url);
}

/**
 * Creates an audio object of specified class, pre-connected to the viewer's audio listener.
 */
function useSeamlessThreeAudio<T extends (Audio | PositionalAudio | null)>(url: string, positional: boolean): [T, T, React.MutableRefObject<number>, React.MutableRefObject<number>, ()=>void, ()=>void] {
    const audioFile = useAudioFile(url) as AudioBuffer;
    const [object1Ref, object1, setObject1] = useRefState<Audio|PositionalAudio|null>(null);
    const [object2Ref, object2, setObject2] = useRefState<Audio|PositionalAudio|null>(null);
    const {audioListener, eventDispatcher} = useContext(ViewerContext);
    const audio1StartTime = useRef(0);
    const audio2StartTime = useRef(0);
    useEffect(()=>{
        if (!audioListener) {
            console.warn("AudioListener not found. AudioObject will not play.");
            return;
        }
        const newAudioObject = positional ? new PositionalAudio(audioListener) : new Audio(audioListener);
        const newAudioObject2 = positional ? new PositionalAudio(audioListener) : new Audio(audioListener);
        // If sceneID is defined, hijack the AudioNode, and connect it to a mixer for the specified scene. Create the mixer if it doesn't exist.
        newAudioObject.setBuffer(audioFile);
        newAudioObject2.setBuffer(audioFile);
        setObject1(newAudioObject);
        setObject2(newAudioObject2);
        return ()=>{
            object1Ref.current?.disconnect();
            object2Ref.current?.disconnect();
        }
    }, [audioListener, positional]);
    const play1 = useCallback(()=>{
        // Play if not already playing
        if (object1Ref.current && !object1Ref.current.isPlaying) {
            object1Ref.current.play();
            audio1StartTime.current = object1Ref.current.context.currentTime;
        }
    }, []);
    const play2 = useCallback(()=>{
        // Play if not already playing
        if (object2Ref.current && !object2Ref.current.isPlaying) {
            object2Ref.current.play();
            audio2StartTime.current = object2Ref.current.context.currentTime;
        }
    }, []);
    useThreeEventListener("audio-start", play1, eventDispatcher);
    useEffect(()=>{
        // If audio context is already ready, then invoke play
        if (audioListener?.context.state === "running") {
            play1();
        }
    }, [object1])
    // return [object1, object2] as [T, T];
    return [
        object1 as T,
        object2 as T,
        audio1StartTime,
        audio2StartTime,
        play1,
        play2
    ]
}

export const SeamlessAudioObject: VaporComponent = ({url, refDistance, volume, positional, overlapLength, ...props}: AudioObjectProps) => {
    const [threeAudioObject1, threeAudioObject2, audio1Start, audio2Start, play1, play2] = useSeamlessThreeAudio(url, positional || false);
    const activeIndexRef = useRef(0);
    const groupRef = useRef<Group>(null);
    useEffect(()=>{
        if (threeAudioObject1 && threeAudioObject2) {
            threeAudioObject1.setVolume(1)
            threeAudioObject2.setVolume(1)
            threeAudioObject1.setLoop(false)
            threeAudioObject2.setLoop(false)
            if (threeAudioObject1 instanceof PositionalAudio) {
                threeAudioObject1.setRefDistance(refDistance ?? 1);
            }
            if (threeAudioObject2 instanceof PositionalAudio) {
                threeAudioObject2.setRefDistance(refDistance ?? 1);
            }
        }
    }, [threeAudioObject1, threeAudioObject2, refDistance, volume])
    useFrame((state, delta)=>{
        if (threeAudioObject1 && threeAudioObject2 && threeAudioObject1.buffer && threeAudioObject2.buffer) {
            if ((threeAudioObject1?.context.currentTime - audio1Start.current) > (threeAudioObject1.buffer.duration - overlapLength) && activeIndexRef.current === 0) {
                play2();
                activeIndexRef.current = 1;
                // console.log("Switching to 2")
            }
            if ((threeAudioObject2?.context.currentTime - audio2Start.current) > (threeAudioObject2.buffer.duration - overlapLength) && activeIndexRef.current === 1) {
                play1();
                activeIndexRef.current = 0;
                // console.log("Switching to 1")
            }
        }
        // Calculate volume for each audio object to crossfade
        if (threeAudioObject1 && threeAudioObject2 && threeAudioObject1.buffer && threeAudioObject2.buffer) {
            const audio1CurrentTime = threeAudioObject1.context.currentTime - audio1Start.current;
            const audio2CurrentTime = threeAudioObject2.context.currentTime - audio2Start.current;
            threeAudioObject1.setVolume(Math.max(Math.min(1, audio1CurrentTime / overlapLength, (threeAudioObject1.buffer.duration - audio1CurrentTime) / overlapLength), 0) * (volume ?? 1));
            threeAudioObject2.setVolume(Math.max(Math.min(1, audio2CurrentTime / overlapLength, (threeAudioObject2.buffer.duration - audio2CurrentTime) / overlapLength), 0) * (volume ?? 1));
        }
    })
    return (
        <group {...props} ref={groupRef}>
            {threeAudioObject1 ? <primitive object={threeAudioObject1}/> : null}
            {threeAudioObject2 ? <primitive object={threeAudioObject2}/> : null}
        </group>
    );
}

SeamlessAudioObject.displayName = "Seamless Audio Object";
SeamlessAudioObject.componentType = "SeamlessAudioObject";
SeamlessAudioObject.inputs = {
    ...genericInputs,
    url: {
        type: URLType,
        default: "",
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
    overlapLength: {
        type: NumberType,
        default: 1,
    }
};