import { useCallback, useRef, useState } from "react";
import { XRSession, XRSessionMode } from "three";

/*
    Adapted from https://github.com/pmndrs/react-xr/blob/master/src/webxr/VRButton.js
*/

export function useRequestXR(renderer: THREE.WebGLRenderer, optionalFeatures=['local-floor', 'bounded-floor', 'hand-tracking'], sessionInit={}) {
    const sessionRef = useRef<XRSession | null>(null);
    const [inSession, setInSession] = useState(false)

    const onSessionEnd = useCallback(() => {
        sessionRef.current?.removeEventListener("end", onSessionEnd);
        // Set text to enter vr
        sessionRef.current = null;
        setInSession(false);
    }, []);

    const onSessionStart = useCallback(async (session)=>{
        if (sessionRef.current) {
            sessionRef.current.addEventListener("end", onSessionEnd);
            await renderer.xr.setSession(session)
            // Set text to exit vr
            sessionRef.current = session;
            setInSession(true);
        }
    }, [
        renderer.xr,
        onSessionEnd
    ])

    const requestSession = useCallback((sessionType: XRSessionMode) => {
        if (sessionRef.current === null) {
            const newOptionalFeatures = optionalFeatures.flat().filter(Boolean);
            if (navigator.xr === undefined) {
                console.error("XR not supported");
                return;
            }
            navigator.xr.requestSession(sessionType, {...sessionInit, optionalFeatures: newOptionalFeatures}).then(onSessionStart);
        } else {
            sessionRef.current.end();
        }
    }, [
        optionalFeatures,
        sessionInit,
        onSessionStart
    ]);

    const [supportedModes, setSupportedModes] = useState<null | XRSessionMode[]>(null);
    detectSupportedModes().then(setSupportedModes);

    return {
        supportedModes,
        requestSession,
        sessionRef,
        inSession
    };
}

/**
 * Returns the list of supported XR modes
 * @returns Promise<XRSessionMode[]>
 */
async function detectSupportedModes() {
    if (navigator.xr === undefined) {
        return [];
    }
    const sessionTypes: XRSessionMode[] = ["immersive-vr", "immersive-ar", "inline"];
    const modeSupport = await Promise.all(sessionTypes.map(sessionType => {
        return (navigator.xr as XRSystem).isSessionSupported(sessionType);
    }));
    const supportedModes = sessionTypes.filter((_, i) => modeSupport[i]);
    return supportedModes;
}
