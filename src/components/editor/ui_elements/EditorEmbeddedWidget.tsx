import React, { useState, ReactNode } from "react"

export default function EditorEmbeddedWidget({title="Title", children}) {
    const [expanded, setExpanded] = useState(true)
    return (
        <div className="editor-embedded-widget">
            <div className="flex flex-row">
                <div className="text-white text-md font-bold">{title}</div>
                <div className="text-white text-xl font-bold ml-auto" onClick={()=>{setExpanded(!expanded)}}>{expanded ? "-" : "+"}</div>
            </div>
            <div className="flex flex-col gap-2">
                {expanded ? children : null}
            </div>
        </div>
    )
}