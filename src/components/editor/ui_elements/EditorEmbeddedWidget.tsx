import React, { useState, ReactNode } from "react"
import { useStickyState } from "../../../utilities"

export default function EditorEmbeddedWidget({title="Title", children, stickyKey, defaultExpanded=true}) {
    const [expanded, setExpanded] = useStickyState(defaultExpanded, stickyKey)
    return (
        <div className="editor-embedded-widget">
            <div className="flex flex-row">
                <div className="text-current text-md font-bold">{title}</div>
                <div className="text-current text-xl font-bold ml-auto select-none cursor-pointer" onClick={()=>{setExpanded(!expanded)}}>{expanded ? "-" : "+"}</div>
            </div>
            <div className="flex flex-col gap-2">
                {expanded ? children : null}
            </div>
        </div>
    )
}