import { useFrame } from "@react-three/fiber";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { lerp } from "three/src/math/MathUtils";
import { ViewerContext } from "../../viewer/ViewerContext";
import { useWebSocketState } from "../../utilities/useWebSocketCallback";

export type ScenesContext = {
    visibleScenes: string[];
} | null

export const ScenesContext = createContext<ScenesContext>(null);

/**
 * Provides information to components regarding what scenes should be visible, so they can do transitions.
 */
export function ScenesManager({scenes=[], children}: {scenes: string[], children: React.ReactNode}) {
    return (
        <ScenesContext.Provider value={{visibleScenes: scenes}}>
            {children}
        </ScenesContext.Provider>
    )
}

export type TransitionState = "fade-in" | "fade-out" | "none";

function remapWithDelay(minValue: number, startTransition: number, endTransition: number, maxValue: number, value: number) {
    if (value < startTransition) {
        return minValue;
    } else {
        if (value > endTransition) {
            return maxValue;
        } else {
            return lerp(
                minValue,
                maxValue,
                (value - startTransition) / (endTransition - startTransition)
            )
        }
    }
}

export const useGetTransitionAlpha = (
    sceneID: string | null, 
    fadeInBefore: number, 
    fadeInDuration: number,
    fadeInAfter: number,
    fadeOutBefore: number,
    fadeOutDuration: number,
    fadeOutAfter: number
    ) => {

    const scenesContext = useContext(ScenesContext);
    const lastVisibilityRef = useRef<boolean | null>(null);
    const alphaRef = useRef<number>(0);
    const transitionStateRef = useRef<TransitionState>("none");

    const updateAlphaRef = useCallback((delta: number) => {
        if (transitionStateRef.current === "none") {
            // Go to a stable state if we are in the none phase
            if (alphaRef.current === -1) {
                // Do nothing
            } else if (alphaRef.current < 0) {
                alphaRef.current += delta / (fadeInDuration + fadeInBefore + fadeInAfter);
                if (alphaRef.current > 0) {
                    alphaRef.current = 0;
                }
            } else if (alphaRef.current === 0) {
                // Do nothing
            } else if (alphaRef.current > 0) {
                alphaRef.current += delta / (fadeOutDuration + fadeOutBefore + fadeOutAfter);
                if (alphaRef.current > 1) {
                    alphaRef.current = -1;
                }
            }
        } else if (transitionStateRef.current === "fade-in") { // Goal is to reach 0.
            if (alphaRef.current < 0) { // If we are in the fade-in phase, and alpha < 0. We need it to grow to 0 and stop.
                alphaRef.current += delta / (fadeInDuration + fadeInBefore + fadeInAfter);
                if (alphaRef.current > 0) {
                    alphaRef.current = 0;
                }
            } else if (alphaRef.current === 0) {
                alphaRef.current = 0;
            } else if (alphaRef.current > 0) { // After 0. Continue to grow and wrap around back to 0.
                alphaRef.current += delta / (fadeOutDuration + fadeOutBefore + fadeOutAfter);
                if (alphaRef.current > 1) {
                    alphaRef.current = -1;
                }
            }
        } else if (transitionStateRef.current === "fade-out") { // Goal is to reach -1.
            if (alphaRef.current === -1) {
                alphaRef.current = -1;
            } else if (alphaRef.current <= 1) { // If we are in the fade-out phase, and alpha <= 1. We need it to grow to 1 and stop.
                if (alphaRef.current < 0) {
                    alphaRef.current += delta / (fadeInDuration + fadeInBefore + fadeInAfter);
                } else {
                    alphaRef.current += delta / (fadeOutDuration + fadeOutBefore + fadeOutAfter);
                }
                if (alphaRef.current > 1) {
                    alphaRef.current = -1;
                }
            }
        }
    }, [fadeInBefore, fadeInDuration, fadeInAfter, fadeOutBefore, fadeOutDuration, fadeOutAfter]);

    // Update transition state
    useEffect(() => {
        // console.log("Updating transition state")
        if (sceneID === null || scenesContext?.visibleScenes === null || sceneID === "") {
            // console.log("Scene ID is null")
            // Set transition state to none
            transitionStateRef.current = "none";
            // Set alpha to 0
            alphaRef.current = 0;
        } else {
            // First, determine last visibility
            const lastVisibility = lastVisibilityRef.current;
            // Then, determine current visibility
            const currentVisibility = scenesContext?.visibleScenes.includes(sceneID) ?? false;
            // If the last visibility is null, we are in the first frame, so we set the transition state to none, and alpha to 1 if the current visibility is true, and 0 if the current visibility is false
            if (lastVisibility === null) {
                transitionStateRef.current = "none";
                alphaRef.current = currentVisibility ? 0 : 1;
                // console.log(`First frame, alpha is ${alphaRef.current} and transition state is ${transitionStateRef.current}`)
            } else {
                // Otherwise, lets first determine the current transition state
                if (lastVisibility === currentVisibility) {
                    // If the last visibility is the same as the current visibility, we are not transitioning, so we set the transition state to none
                    // transitionStateRef.current = "none"; // Actually we might as well just use visibility...
                    updateAlphaRef(1/60) // Hacks
                    // console.log("None")
                } else if (currentVisibility && !lastVisibility) {
                    transitionStateRef.current = "fade-in";
                    updateAlphaRef(1/60)
                    // console.log("Fade in")
                } else if (!currentVisibility && lastVisibility) {
                    transitionStateRef.current = "fade-out";
                    updateAlphaRef(1/60)
                    // console.log("Fade out")
                }
            }
            // Finally, update last visibility
            lastVisibilityRef.current = currentVisibility;
        }
    }, [sceneID, scenesContext]);

    const getFinalAlpha = useCallback((delta: number) => {
        updateAlphaRef(delta);
        // Now we remap alpha values to respect delays.
        // Essentially: -1 to 0 is fade-in, 0 to 1 is fade-out. At 0, the object is fully visible, at -1 and 1, the object is fully invisible..
        let finalAlpha = 0;
        if (alphaRef.current < 0) {
            finalAlpha = remapWithDelay(
                -1,
                -1 + fadeInBefore / (fadeInDuration + fadeInBefore + fadeInAfter),
                -1 + (fadeInBefore + fadeInDuration) / (fadeInDuration + fadeInBefore + fadeInAfter),
                0,
                alphaRef.current
            );
        } else if (alphaRef.current > 0) {
            finalAlpha = remapWithDelay(
                0,
                fadeOutBefore / (fadeOutDuration + fadeOutBefore + fadeOutAfter),
                (fadeOutBefore + fadeOutDuration) / (fadeOutDuration + fadeOutBefore + fadeOutAfter),
                1,
                alphaRef.current
            );
        }
        return finalAlpha;
    }, [fadeInBefore, fadeInDuration, fadeInAfter, fadeOutBefore, fadeOutDuration, fadeOutAfter]);

    // Update alpha
    return getFinalAlpha;
}

export function useTransitionAlpha(
    sceneID: string | null, 
    fadeInBefore: number, 
    fadeInDuration: number,
    fadeInAfter: number,
    fadeOutBefore: number,
    fadeOutDuration: number,
    fadeOutAfter: number,
    callback: (alpha: number) => void
    ) {

    const getFinalAlpha = useGetTransitionAlpha(sceneID, fadeInBefore, fadeInDuration, fadeInAfter, fadeOutBefore, fadeOutDuration, fadeOutAfter);

    // Update alpha
    useFrame((state, delta) => {
        const finalAlpha = getFinalAlpha(delta);
        callback(finalAlpha);
    });
}

type AnimatedScenesManagerProps = {
    scenes: string[];
    interval: number; // N seconds in milliseconds, e.g., 5000 for 5 seconds
    children: React.ReactNode;
};

export function AnimatedScenesManager({scenes, interval, children}: AnimatedScenesManagerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const intervalID = setInterval(() => {
            setCurrentIndex(x => (x + 1) % scenes.length);
        }, interval);

        return () => {
            clearInterval(intervalID);
        };
    }, [scenes, interval, currentIndex]);

    return (
        <ScenesContext.Provider value={{ visibleScenes: [scenes[currentIndex]] }}>
            {children}
        </ScenesContext.Provider>
    );
}

export function DebugScenesManager({children}: {children: React.ReactNode}) {
    const {scenes, setScenes, defaultScenes} = useContext(ViewerContext);
    useEffect(()=>{
        setScenes(defaultScenes);
    }, [])
    return (
        <ScenesManager scenes={scenes}>
            {children}
        </ScenesManager>
    )
}

type RemoteState = {
    scenes: {
        current_scene: string | null;
        idle: boolean;
        remaining_scene_time: number;
        elapsed_scene_time: number;
    },
    audio_reactive: {
        ding_envelope: number;
        ding_count: number;
    }
}

export function RemoteScenesManager({children}: {children: React.ReactNode}) {
    const [scene, status] = useWebSocketState<RemoteState>("/sync", {
        predicate: (p, n) => (p as any)?.scenes?.current_scene !== (n as any)?.scenes?.current_scene || (p as any)?.scenes?.idle !== (n as any)?.scenes?.idle
    })
    return (
        <ScenesManager scenes={[scene?.scenes?.current_scene ?? ""]}>
            {children}
        </ScenesManager>
    )
}