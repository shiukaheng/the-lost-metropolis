import { createElement, useContext } from "react";
import { formatRGBCSS } from "../../utilities";
import { ThemeContext } from "../App";
import { twMerge } from "tailwind-merge"

export default function MagicIcon({IconComponent, clickable=false, onClick=()=>{}, disabled=false, className="", ...props}) {
    const {theme} = useContext(ThemeContext);
    const classnameList = ["h-5 w-5"]
    if (clickable) {
        classnameList.push("cursor-pointer hover:opacity-50 transition-opacity duration-500");
    }
    if (disabled) {
        classnameList.push("opacity-50 cursor-not-allowed");
    }
    return (
        createElement(IconComponent, {
            className: twMerge(...classnameList, className),
            onClick: onClick,
            style: {
                color: formatRGBCSS(theme.foregroundColor),
                transition: `color ${theme.transitionDuration}s opacity 0.5s`
            },
            ...props
        })        
    );
}