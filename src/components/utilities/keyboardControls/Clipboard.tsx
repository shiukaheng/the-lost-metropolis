// Copy and paste (does it using a ref, but alternatively you can use the system clipboard, but then it must be JSONable):

import { Fragment, useRef } from "react"
import { Keypress } from "./Keypress"

type ClipboardContent = any

interface ClipboardProps {
    onCopy?: () => ClipboardContent
    onPaste?: (content: ClipboardContent) => void   
    // systemClipboard?: boolean
}

export function ClipboardHelper({onCopy=()=>{}, onPaste=()=>{}}: ClipboardProps) {
    const clipboard = useRef<ClipboardContent>()
    return (
        <Fragment>
            <Keypress keyName="c" onDown={()=>{
                // If activeElement is not body, skip. Hacks...
                if (document.activeElement !== document.body) {
                    return
                }
                clipboard.current = onCopy();
            }} requiredKeys={["Control"]}/>
            <Keypress keyName="v" onDown={()=>{
                if (document.activeElement !== document.body) {
                    return
                }
                onPaste(clipboard.current);
            }} requiredKeys={["Control"]}/>
        </Fragment>
    )
}