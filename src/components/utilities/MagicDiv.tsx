import { SettingsContext, ThemeContext } from "../App"
import { useContext, useLayoutEffect, useRef, useState } from "react"
import { formatRGBCSS } from "../../utilities"

// Dynamically color div css attributes based on theme, but note that its not compatible with external transitions due to use of element css which overrides classes
function MagicDiv({ debug=false, languageSpecificChildren=null, style=undefined, foregroundColorCSSProps=["color", "borderColor"], backgroundColorCSSProps=[], children=undefined, className="", mergeTransitions=false, autoColor=true, overrideTheme={}, ...props }) {
    const {settings} = useContext(SettingsContext)
    const {theme: defaultTheme} = useContext(ThemeContext)
    const theme = {...defaultTheme, ...overrideTheme}
    const div = useRef(null)
    const [existingTransition, setExistingTransition] = useState("")
    const additionalTransition = foregroundColorCSSProps.concat(backgroundColorCSSProps).map((val) => (val.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()+` ${theme.transitionDuration}s`)).join(", ")
    // Show current calculated transition css property of div
    useLayoutEffect(() => {
        if (div.current && mergeTransitions) {
            setExistingTransition(div.current && window.getComputedStyle(div.current).transition)
        }
    }, [foregroundColorCSSProps, backgroundColorCSSProps, theme.transitionDuration, mergeTransitions])
    
    if (debug) {
        console.log(theme, foregroundColorCSSProps, backgroundColorCSSProps)
    }

    // console.log(languageSpecificChildren)

    return (
        <div {...props} className={className} style={
            autoColor ? {
                ...(Object.assign({}, ...backgroundColorCSSProps.map((val) => ({[val]: formatRGBCSS(theme.backgroundColor)})))),
                ...(Object.assign({}, ...foregroundColorCSSProps.map((val) => ({[val]: formatRGBCSS(theme.foregroundColor)})))),
                transition: mergeTransitions ? existingTransition+", "+additionalTransition : additionalTransition,
                ...style
            } : {...style}
        }>
            {[languageSpecificChildren!==null ? languageSpecificChildren[settings.lang] : children].concat(mergeTransitions ? [<div ref={div} className={className} style={{display: "none"}} />].map((elem, index) => (Object.assign({}, elem, {key: index}))) : [])}
        </div>
    );
}

export default MagicDiv;