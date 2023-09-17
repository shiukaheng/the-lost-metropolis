// Copy and paste (does it using a ref, but alternatively you can use the system clipboard, but then it must be JSONable):

import { Fragment, useRef } from "react"
import { Keypress } from "./Keypress"

type ClipboardContent = any

interface ClipboardProps {
    onCopy?: () => ClipboardContent
    onPaste?: (content: ClipboardContent, inPlace: boolean) => void   
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
                onPaste(clipboard.current, false);
            }} requiredKeys={["Control"]}/>
            {/* Special case of '`' + 'v', for pasting in front of camera */}
            <Keypress keyName="v" onDown={()=>{
                if (document.activeElement !== document.body) {
                    return
                }
                onPaste(clipboard.current, true);
            }} requiredKeys={["`"]}/>
        </Fragment>
    )
}