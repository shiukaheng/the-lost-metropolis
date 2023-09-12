import { useFrame } from "@react-three/fiber";
import { createContext, useContext, useEffect, useRef, useState } from "react";

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

export const useTransitionAlpha = (sceneID: string | null, transitionTime: number, callback: (alpha: number) => void) => {
    const scenesContext = useContext(ScenesContext);
    const lastVisibilityRef = useRef<boolean | null>(null);
    const alphaRef = useRef<number>(0);
    const transitionStateRef = useRef<TransitionState>("none");

    // Update transition state
    useEffect(() => {
        console.log("Updating transition state")
        if (sceneID === null) {
            console.log("Scene ID is null")
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
                console.log("Last visibility is null")
                transitionStateRef.current = "none";
                alphaRef.current = currentVisibility ? 0 : 1;
            } else {
                // Otherwise, lets first determine the current transition state
                if (lastVisibility === currentVisibility) {
                    // If the last visibility is the same as the current visibility, we are not transitioning, so we set the transition state to none
                    transitionStateRef.current = "none";
                    console.log("None")
                } else if (currentVisibility && !lastVisibility) {
                    // Visible to invisible: fade out
                    transitionStateRef.current = "fade-out";
                    console.log("Fade out")
                } else if (!currentVisibility && lastVisibility) {
                    // Invisible to visible: fade in
                    transitionStateRef.current = "fade-in";
                    console.log("Fade in")
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
        } else if (transitionStateRef.current === "fade-in") {
            if (alphaRef.current < 0) {
                alphaRef.current += delta / transitionTime;
                if (alphaRef.current > 0) {
                    alphaRef.current = 0;
                }
            } else if (alphaRef.current === 0) {
                alphaRef.current = 0;
            } else if (alphaRef.current > 0) {
                alphaRef.current += delta / transitionTime;
                if (alphaRef.current > 1) {
                    alphaRef.current = -1;
                }
            }
        } else if (transitionStateRef.current === "fade-out") {
            if (alphaRef.current <= 1) {
                alphaRef.current += delta / transitionTime;
                if (alphaRef.current > 1) {
                    alphaRef.current = 1;
                }
            } else if (alphaRef.current === 1) {
                alphaRef.current = 1;
            }
        }

        callback(alphaRef.current);
    })


    return
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
            // console.log("Setting current index to", (currentIndex + 1) % scenes.length);
            setCurrentIndex((currentIndex + 1) % scenes.length);
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