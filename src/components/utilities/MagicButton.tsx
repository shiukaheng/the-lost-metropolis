import { SettingsContext, ThemeContext } from "../App"
import { Fragment, useContext, useLayoutEffect, useRef, useState } from "react"
import { formatRGBCSS, useMounted } from "../../utilities"
import { twMerge } from 'tailwind-merge'
import { MultiLangString } from "../../../api/types/MultiLangString"

// Dynamically color div css attributes based on theme, but note that its not compatible with external transitions due to use of element css which overrides classes
function MagicButton({ languageSpecificChildren=null, style={}, solid=false, children=undefined, className="", mergeTransitions=true, autoColor=true, disabled=false, onClick=(e)=>{}, ...props }: {
    languageSpecificChildren?: MultiLangString | null,
    style?: React.CSSProperties,
    solid?: boolean,
    children?: React.ReactNode,
    className?: string,
    mergeTransitions?: boolean,
    autoColor?: boolean,
    disabled?: boolean,
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void,
    [key: string]: any
}) {
    const {settings} = useContext(SettingsContext)
    const {theme} = useContext(ThemeContext)
    const testDiv = useRef(null)
    const [existingTransition, setExistingTransition] = useState("")
    const foregroundColorCSSProps = solid ? ["backgroundColor", "borderColor"] : ["color", "borderColor"]
    const backgroundColorCSSProps = solid ? ["color"] : []
    const additionalTransition = foregroundColorCSSProps.concat(backgroundColorCSSProps).map((val) => (val.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()+` ${theme.transitionDuration}s`)).join(", ")
    const [pending, setPending] = useState(false)

    const buttonClassnames = `whitespace-nowrap select-none px-4 rounded-3xl ${(disabled || pending) ? "opacity-50" : "md:hover:opacity-50 cursor-pointer"} font-serif font-bold md:text-xl h-9 md:h-10 transition-opacity duration-500`
    const solidButtonClassnames = ""
    const nonSolidButtonClassnames = "border bg-transparent"

    const mountedRef = useMounted()

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
            <button onClick={disabled ? undefined : async (e)=>{
                // If the onClick function is synchronous, just call it; if asynchronous, set pending to true and call it; when it resolves, set pending to false
                if (onClick.constructor.name === "Function") {
                    onClick(e)
                } else if (onClick.constructor.name === "AsyncFunction") {
                    setPending(true)
                    await onClick(e)
                    if (mountedRef.current === true) {
                        setPending(false)
                    }
                }
            }} {...props} className={mergedClassNames} style={
                autoColor ? {
                    ...(Object.assign({}, ...backgroundColorCSSProps.map((val) => ({[val]: formatRGBCSS(theme.backgroundColor)})))),
                    ...(Object.assign({}, ...foregroundColorCSSProps.map((val) => ({[val]: formatRGBCSS(theme.foregroundColor)})))),
                    transition: mergeTransitions ? existingTransition+", "+additionalTransition : additionalTransition,
                    ...style
                } : {...style}
            }>
                {languageSpecificChildren ? languageSpecificChildren[settings.lang] : children}
            </button>
            {mergeTransitions ? <div ref={testDiv} className={mergedClassNames} style={{display: "none"}}/> : null}
        </Fragment>
        
    );
}

export default MagicButton;