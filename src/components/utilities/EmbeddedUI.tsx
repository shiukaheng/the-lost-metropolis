import { Children, cloneElement, ReactChildren, ReactElement, useContext } from "react"
import { twMerge } from "tailwind-merge"
import { formatRGBCSS } from "../../utilities"
import { ThemeContext } from "../App"
import MagicDiv from "./MagicDiv"

export function EmbeddedPrimitive({position="top", embedded=false, children=null, className=""}) {
    const positionClassName = (
        embedded ? "" :
        position === "top" ?
        "border-b" :
        position === "bottom" ?
        "border-t" :
        position === "left" ?
        "border-r" :
        position === "right" ?
        "border-l" :
        ""
    )
    return (
        <MagicDiv className={twMerge("relative flex justify-center items-center h-full w-full", positionClassName, className)}>
            {children}
        </MagicDiv>
    )
}

// Position can be "top", "bottom", "left", "right", and "embedded"; E.g., if "top", border will be on the bottom and have margin-bottom set to auto; but embedded will have no border or margins
export function EmbeddedCell({position="top", embedded=false, children=null, className="", textContainerClassName="m-auto", backgroundProps={className:""}, foregroundProps={className:""}, onClick=(e)=>{}, ...props}) {
    const {theme} = useContext(ThemeContext)
    return (
        <EmbeddedPrimitive position={position} embedded={embedded} className={twMerge("text-xl font-black", className)} {...props}>
            {/* Background element */}
            <MagicDiv {...backgroundProps} onClick={onClick} mergeTransitions foregroundColorCSSProps={["backgroundColor"]}  className={twMerge("absolute w-full h-full opacity-20", backgroundProps.className)}/> 
            {/* Foreground element */}
            <MagicDiv {...foregroundProps} mergeTransitions foregroundColorCSSProps={["color"]} className={twMerge("absolute w-full h-full pointer-events-none m-auto flex", foregroundProps.className)}>
                <div className={textContainerClassName}>
                    {children}
                </div>
            </MagicDiv>
        </EmbeddedPrimitive>
    )
}

export function EmbeddedRow({position="top", embedded=false, children=null, className="", ...props}: {
    position?: "top" | "bottom",
    embedded?: boolean,
    children?: ReactElement[] | null,
    className?: string,
    [key: string]: any
}) {
    // If position is top or bottom, add border-l to all children except the first; If position is left or right, add border-t to all children except the first
    const wrappedChildren = Children.toArray(children).map((child, index) => {
        const borderClassName = (
            position === "top" || position === "bottom" ?
            index === 0 ?
            "border-0" :
            "border-l" :
            index === 0 ?
            "border-0" :
            "border-t"
        )
        return cloneElement(child, {className: twMerge(borderClassName, child.props.className), position: position, embedded: true})
    })
    return (
        <EmbeddedPrimitive position={position} embedded={embedded} className={className} {...props}>
            {wrappedChildren}
        </EmbeddedPrimitive>
    )
}

export function RoundedContainer({children=null, className="", direction="vertical"}: {
    children?: React.ReactNode;
    className?: string;
    direction?: "vertical" | "horizontal";
}) {
    return (
        <div className={twMerge("rounded-3xl w-full h-full overflow-clip flex border border-current place-content-between", (direction==="vertical" ? "flex-col" : direction==="horizontal" ? "flex-row" : ""), className)}>
            {children}
        </div>
    )
}

export function EmbeddedButton({position="top", embedded=false, children, onClick=(e)=>{}, disabled=false, className="", backgroundColor=null}) {
    return (
        <EmbeddedCell position={position} embedded={embedded} className={twMerge(disabled ? "cursor-not-allowed" : "cursor-pointer", "select-none", className)} onClick={onClick}
        backgroundProps={{
            mergeTransitions: true,
            foregroundColorCSSProps: backgroundColor ? [] : ["color"],
            style: backgroundColor ? {backgroundColor: formatRGBCSS(backgroundColor)} : {},
            className: `transition-opacity duration-500 opacity-40 ${disabled ? "opacity-30" : "hover:opacity-80"}`
        }}
        foregroundProps={{
            mergeTransitions: true,
            foregroundColorCSSProps: ["color"],
            className: `pointer-events-none text-xl transition-opacity duration-500 ${disabled ? "opacity-50"  : ""}`
        }}>
            {children}
        </EmbeddedCell>
    )
}

export function EmbeddedTab({position="top", embedded=false, highlight=false, onClick, children=null, className=""}) {
    return (
        <EmbeddedCell position={position} embedded={embedded} className={twMerge("cursor-pointer", className)} onClick={onClick}
        backgroundProps={{
            mergeTransitions: true,
            className: `transition-opacity duration-500 opacity-0 ${highlight ? "opacity-30" : "hover:opacity-10"}`,
        }}
        >
            {children}
        </EmbeddedCell>
    )
}

export function EmbeddedTabs({position="top", embedded=false, options=[], activeOption="", onUpdate=(option)=>{}, className=""}: {
    position?: "top" | "bottom" | "left" | "right";
    embedded?: boolean;
    options?: string[];
    activeOption?: string;
    onUpdate?: (option: string) => void;
    className?: string;
}) {
    return (
        <EmbeddedRow position={position} embedded={embedded} className={className}>
            {
                options.map((option: string, index: number)=>(
                    <EmbeddedTab key={index} onClick={()=>{onUpdate(option)}} highlight={activeOption===option}>{option}</EmbeddedTab>
                ))
            }
        </EmbeddedRow>
    )
}