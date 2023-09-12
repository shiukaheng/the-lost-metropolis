import { useFrame } from "@react-three/fiber";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { lerp } from "three/src/math/MathUtils";

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

export const useTransitionAlpha = (
    sceneID: string | null, 
    fadeInBefore: number, 
    fadeInDuration: number,
    fadeInAfter: number,
    fadeOutBefore: number,
    fadeOutDuration: number,
    fadeOutAfter: number,
    callback: (alpha: number) => void
    ) => {

    const scenesContext = useContext(ScenesContext);
    const lastVisibilityRef = useRef<boolean | null>(null);
    const alphaRef = useRef<number>(0);
    const transitionStateRef = useRef<TransitionState>("none");

    // Update transition state
    useEffect(() => {
        // console.log("Updating transition state")
        if (sceneID === null) {
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
                // console.log("Last visibility is null")
                transitionStateRef.current = "none";
                alphaRef.current = currentVisibility ? 0 : 1;
            } else {
                // Otherwise, lets first determine the current transition state
                if (lastVisibility === currentVisibility) {
                    // If the last visibility is the same as the current visibility, we are not transitioning, so we set the transition state to none
                    transitionStateRef.current = "none";
                    // console.log("None")
                } else if (currentVisibility && !lastVisibility) {
                    // Visible to invisible: fade out
                    transitionStateRef.current = "fade-out";
                    // console.log("Fade out")
                } else if (!currentVisibility && lastVisibility) {
                    // Invisible to visible: fade in
                    transitionStateRef.current = "fade-in";
                    // console.log("Fade in")
                }
            }
            // Finally, update last visibility
            lastVisibilityRef.current = currentVisibility;
        }
    }, [sceneID, scenesContext]);

    // Update alpha
    useFrame((state, delta) => {
        // Now we animate
        if (transitionStateRef.current === "none") {
            // Do nothing
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
            )
        } else if (alphaRef.current > 0) {
            finalAlpha = remapWithDelay(
                0,
                fadeOutBefore / (fadeOutDuration + fadeOutBefore + fadeOutAfter),
                (fadeOutBefore + fadeOutDuration) / (fadeOutDuration + fadeOutBefore + fadeOutAfter),
                1,
                alphaRef.current
            )
        }

        // Call the callback with the final alph a value
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