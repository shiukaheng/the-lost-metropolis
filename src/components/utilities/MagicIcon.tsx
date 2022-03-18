import { createElement, useContext, useState } from "react";
import { formatRGBCSS } from "../../utilities";
import { ThemeContext } from "../App";
import { twMerge } from "tailwind-merge"

export default function MagicIcon({IconComponent, clickable=false, onClick=()=>{}, disabled=false, fillCurrent=false, className="", ...props}:
{
    IconComponent: React.ComponentType<any>,
    clickable?: boolean,
    onClick?: (()=>void) | (()=>Promise<void>),
    disabled?: boolean,
    className?: string,
    [key: string]: any,
}) {
    const {theme} = useContext(ThemeContext);
    const [onClickInProgress, setOnClickInProgress] = useState(false)
    const classnameList = ["h-5 w-5"]
    if (clickable) {
        classnameList.push("cursor-pointer hover:opacity-50 transition-opacity duration-500");
    }
    if (onClickInProgress || disabled) {
        classnameList.push("opacity-50 cursor-not-allowed");
    }
    if (fillCurrent) {
        classnameList.push("fill-current")
    }
    return (
        createElement(IconComponent, {
            className: twMerge(...classnameList, className),
            onClick: async ()=> {
                // Check if onClick is async or not, if async, set onClickInProgress to true and await the result, then set onClickInProgress to false
                if (onClick.constructor.name === "AsyncFunction") {
                    setOnClickInProgress(true)
                    await onClick()
                    setOnClickInProgress(false)
                } else {
                    onClick()
                }
            },
            style: {
                color: formatRGBCSS(theme.foregroundColor),
                transition: `color ${theme.transitionDuration}s opacity 0.5s`
            },
            ...props
        })        
    );
}