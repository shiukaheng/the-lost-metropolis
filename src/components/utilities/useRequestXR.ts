import { useCallback, useEffect, useRef, useState } from "react";
import { WebGLRenderer, XRSessionMode } from "three";

/*
    Adapted from https://github.com/pmndrs/react-xr/blob/master/src/webxr/VRButton.js
*/

function makeOnSessionStart(renderer: WebGLRenderer, sessionRef: React.MutableRefObject<XRSession | null>, setInSession: React.Dispatch<React.SetStateAction<boolean>>) {
    return async function (session: XRSession) {
        console.log("session started", session)
        const onSessionEnd = () => {
            sessionRef.current?.removeEventListener("end", onSessionEnd);
            console.log("session ended", session)
            // Set text to "enter xr"
            sessionRef.current = null;
            setInSession(false);
        }
        session.addEventListener("end", onSessionEnd);
        await renderer.xr.setSession(session)
        // Set text to "exit xr"
        sessionRef.current = session
        setInSession(true)
    }
}

// Perhaps move this into ViewerManager? Components will benefit from knowing if they are in XR mode
export function useRequestXR(optionalFeatures=['local-floor'], sessionInit={}) {
    const sessionRef = useRef<XRSession | null>(null);
    const [inSession, setInSession] = useState(false)

    const requestSession = useCallback((renderer: WebGLRenderer, sessionType: XRSessionMode) => {
        if (sessionRef.current === null) {
            const newOptionalFeatures = optionalFeatures.flat().filter(Boolean);
            if (navigator.xr === undefined) {
                console.error("XR not supported");
                return;
            }
            navigator.xr.requestSession(sessionType, {...sessionInit, optionalFeatures: newOptionalFeatures}).then(
                makeOnSessionStart(renderer, sessionRef, setInSession)
            );
        } else {
            sessionRef.current.end();
        }
    }, [
        optionalFeatures,
        sessionInit
    ]);

    return {
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

/**
 * Hook to get the list of supported XR modes, starts with returning null, and then updates with the list of supported modes. Empty array means no supported modes.
 * @returns [null, XRSessionMode[]]
 */
export function useSupportedXRModes() {
    const [supportedModes, setSupportedModes] = useState<XRSessionMode[] | null>(null);
    useEffect(() => {
        detectSupportedModes().then(setSupportedModes);
    }, []);
    return supportedModes;
}