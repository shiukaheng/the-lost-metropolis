import { SettingsContext, ThemeContext } from "../App"
import { Fragment, useContext, useLayoutEffect, useRef, useState } from "react"
import { formatRGBCSS } from "../../utilities"
import { twMerge } from 'tailwind-merge'

// Dynamically color div css attributes based on theme, but note that its not compatible with external transitions due to use of element css which overrides classes
function MagicButton({ languageSpecificChildren=null, style={}, solid=false, children=undefined, className="", mergeTransitions=true, autoColor=true, disabled=false, onClick=()=>{}, ...props }) {
    const {settings} = useContext(SettingsContext)
    const {theme} = useContext(ThemeContext)
    const testDiv = useRef(null)
    const [existingTransition, setExistingTransition] = useState("")
    const foregroundColorCSSProps = solid ? ["backgroundColor", "borderColor"] : ["color", "borderColor"]
    const backgroundColorCSSProps = solid ? ["color"] : []
    const additionalTransition = foregroundColorCSSProps.concat(backgroundColorCSSProps).map((val) => (val.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()+` ${theme.transitionDuration}s`)).join(", ")
    const [pending, setPending] = useState(false)

    const buttonClassnames = `select-none px-4 rounded-3xl ${(disabled || pending) ? "opacity-50" : "md:hover:opacity-50 cursor-pointer"} font-serif font-bold md:text-xl h-8 md:h-9 transition-opacity duration-500`
    const solidButtonClassnames = ""
    const nonSolidButtonClassnames = "border bg-transparent"

    // Show current calculated transition css property of div
    useLayoutEffect(() => {
        if (testDiv.current && mergeTransitions) {
            setExistingTransition(testDiv.current && window.getComputedStyle(testDiv.current).transition)
        }
    }, [solid, theme.transitionDuration, mergeTransitions])

    const mergedClassNames = twMerge(buttonClassnames, (solid ? solidButtonClassnames: nonSolidButtonClassnames), className)

    // console.log(languageSpecificChildren)

    return (
        <Fragment>
            <input onClick={disabled ? undefined : async ()=>{
                // If the onClick function is synchronous, just call it; if asynchronous, set pending to true and call it; when it resolves, set pending to false
                if (onClick.constructor.name === "Function") {
                    onClick()
                } else if (onClick.constructor.name === "AsyncFunction") {
                    setPending(true)
                    await onClick()
                    setPending(false)
                }
            }} {...props} type="button" className={mergedClassNames} value={languageSpecificChildren ? languageSpecificChildren[settings.lang] : children} style={
                autoColor ? {
                    ...(Object.assign({}, ...backgroundColorCSSProps.map((val) => ({[val]: formatRGBCSS(theme.backgroundColor)})))),
                    ...(Object.assign({}, ...foregroundColorCSSProps.map((val) => ({[val]: formatRGBCSS(theme.foregroundColor)})))),
                    transition: mergeTransitions ? existingTransition+", "+additionalTransition : additionalTransition,
                    ...style
                } : {...style}
            }/>
            {mergeTransitions ? <div ref={testDiv} className={mergedClassNames} style={{display: "none"}}/> : null}
        </Fragment>
        
    );
}

export default MagicButton;