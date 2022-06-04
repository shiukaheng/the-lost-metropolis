import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SwitchTransition, CSSTransition } from "react-transition-group";
import { Switcher, useMultiLangObject } from "../../utilities";
import GenericPage from "./GenericPage";
import MagicButton from "./MagicButton";
import MagicDiv from "./MagicDiv";

export type Compatiblity = "compatible" | "apple-ios-safari-unsupported" | "generic-unsupported"

function xrSupported() {
    return (navigator.xr !== undefined)
}

function xrAvailable() {
    return xrSupported() && (navigator.xr.isSessionSupported("immersive-ar") || navigator.xr.isSessionSupported("immersive-vr"))
}

function isDesktop() {
    return window.matchMedia("(min-width: 600px)").matches
}

function supportsPointerLock() {
    return "pointerLockElement" in document || "mozPointerLockElement" in document || "webkitPointerLockElement" in document
}

function compatible() {
    return xrAvailable() // Mobile browser should support WebXR, or it's not browsable
    || (isDesktop() && supportsPointerLock()) // Desktop browser should support pointer lock, or it's not browsable
}

function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function detectCompatability(): Compatiblity {
    if (compatible()) {
        return "compatible"
    }
    if (isIOS() && !xrSupported()) {
        return "apple-ios-safari-unsupported"
    }
    return "generic-unsupported"
}

function memoizedDetectCompatibility(): Compatiblity {
    // Memoize within the same session using window. A bit hacky, but it works.
    if (window.compatibility === undefined) {
        window.compatibility = detectCompatability()
        console.log("Detected compatibility:", window.compatibility)
    }
    return window.compatibility
}

function AppleIOSUnsupported({children}) {
    const text = useMultiLangObject({
        "notice": {
            "en": "Sorry, iOS does not natively support AR experiences moment. Please download the WebXR Viewer app from the Apple App Store, or you cannot experience AR experiences.",
            "zh": "抱歉，iOS暫時不直接支援AR經驗。請從Apple App Store下載WebXR Viewer，或您將無法經驗AR。"
        },
        "download": {
            "en": "download",
            "zh": "下載"
        },
        "already-have-it": {
            "en": "i already have it",
            "zh": "我已經有了"
        },
        "ignore": {
            "en": "browse anyway",
            "zh": "繼續瀏覽"
        }
    })
    const [ignored, setIgnored] = useState(false)
    const downloadApp = useCallback(()=>{
        window.open("https://apps.apple.com/us/app/webxr-viewer/id1459098276")
    }, [])
    const openInApp = useCallback(()=>{
        // Get the current URL of the page, but replace the https / http protocol with "wxrv://"
        const url = window.location.href.replace(/^https:\/\/?/, "wxrv://")
        window.open(url)
    }, [])
    return (
        <SwitchTransition>
            <CSSTransition key={ignored ? "ignored" : "not-ignored"} classNames="page-transition" timeout={250}>
                <Switcher condition={ignored} trueChild={children} falseChild={
                    <div className="m-8">
                        <MagicDiv className="flex flex-col gap-4">
                            <h1 className="text-2xl">{text["notice"]}</h1>
                            <div className="flex flex-col gap-2">
                                <MagicButton solid onClick={downloadApp}>
                                    {text["download"]}
                                </MagicButton>
                                <MagicButton onClick={openInApp}>
                                    {text["already-have-it"]}
                                </MagicButton>
                                <MagicButton onClick={()=>{setIgnored(true)}}>
                                    {text["ignore"]}
                                </MagicButton>
                            </div>
                        </MagicDiv>
                    </div>
                }/>
            </CSSTransition>
        </SwitchTransition>
    )
}

function GenericUnsupported({children}) {
    const [ignored, setIgnored] = useState(false)
    const text = useMultiLangObject({
        "notice": {
            "en": "This mobile browser does not support AR experiences. You can visit our site on a desktop browser.",
            "zh": "抱歉，此瀏覽器不支援AR經驗。您可以在桌面瀏覽器中到訪我們的網站。"
        },
        "contact-us": {
            "en": "contact us",
            "zh": "聯絡我們"
        },
        "ignore": {
            "en": "browse anyway",
            "zh": "繼續瀏覽"
        }
    })
    const contactUs = useCallback(()=>{
        window.open("https://www.instagram.com/thelostmetropolishk/")
    }, [])
    const ignore = useCallback(()=>{
        setIgnored(true)
    }, [])
    return (
        <SwitchTransition>
            <CSSTransition key={ignored ? "ignored" : "not-ignored"} classNames="page-transition" timeout={250}>
                {
                    ignored ?
                    children :
                    <div className="m-8 md:m-16">
                        <MagicDiv className="flex flex-col gap-4">
                            <h1 className="text-2xl">{text["notice"]}</h1>
                            <div className="flex flex-col gap-2">
                                <MagicButton onClick={contactUs}>
                                    {text["contact-us"]}
                                </MagicButton>
                                <MagicButton onClick={ignore}>
                                    {text["ignore"]}
                                </MagicButton>
                            </div>
                        </MagicDiv>
                    </div>
                }
            </CSSTransition>
        </SwitchTransition>
    )
}

/**
 * Informs the user that the browser is not supported.
 */
export function CompatabilityWrapper({children}) {
    // At our websites core is WebXR, and if that's not supported by the browser we need to
    // notify users and ask them to download a compatible browser.
    // For now, the only problem is with iPhones in which the user needs to download "WebXR Viewer".
    switch(memoizedDetectCompatibility()) {
        case "compatible":
            return children
        case "apple-ios-safari-unsupported":
            return (
                <AppleIOSUnsupported>
                    {children}
                </AppleIOSUnsupported>
            )
        default:
            return (
                <GenericUnsupported>
                    {children}
                </GenericUnsupported>
            )
    }
}