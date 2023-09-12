import { useFrame } from "@react-three/fiber";
import { createContext, useContext, useEffect, useRef } from "react";

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

export const useTransitionAlpha = (sceneID: string, transitionTime: number, callback: (alpha: number) => void) => {
    const scenesContext = useContext(ScenesContext);
    const alphaRef = useRef<number>(scenesContext && scenesContext.visibleScenes.includes(sceneID) ? 1 : 0);
    const directionRef = useRef<number>(0); // 1 for increasing, -1 for decreasing, 0 for no change
    const elapsedTimeRef = useRef<number>(0);

    useEffect(() => {
        if (scenesContext) {
            if (scenesContext.visibleScenes.includes(sceneID) && alphaRef.current !== 1) {
                directionRef.current = 1;
                elapsedTimeRef.current = 0;
            } else if (!scenesContext.visibleScenes.includes(sceneID) && alphaRef.current !== 0) {
                directionRef.current = -1;
                elapsedTimeRef.current = 0;
            } else {
                directionRef.current = 0;
            }
        }
    }, [sceneID, scenesContext]);

    useFrame(({ clock }) => {
        const deltaTime = clock.getDelta();

        if (directionRef.current !== 0 && scenesContext) {
            elapsedTimeRef.current += deltaTime;

            const change = (directionRef.current * deltaTime) / transitionTime;

            alphaRef.current = Math.min(1, Math.max(0, alphaRef.current + change));

            if (elapsedTimeRef.current >= transitionTime) {
                directionRef.current = 0;
                alphaRef.current = directionRef.current === 1 ? 1 : 0;
            }

            callback(alphaRef.current);
        }
    });
}
