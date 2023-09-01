import { RootState, useThree } from "@react-three/fiber";
import { useEffect } from "react";

/**
 * Helper component to extract three state outside of Canvas
 */
export function ThreeExtractor({threeRef}: {
    threeRef: React.MutableRefObject<RootState | null>;
}) {
    const state = useThree()
    useEffect(() => {
        threeRef.current = state;
        (window as any).three = state
    }, [state])
    return null
}