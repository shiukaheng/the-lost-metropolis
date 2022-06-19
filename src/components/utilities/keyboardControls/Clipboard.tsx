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
                clipboard.current = onCopy();
            }} requiredKeys={["Control"]}/>
            <Keypress keyName="v" onDown={()=>{
                onPaste(clipboard.current);
            }} requiredKeys={["Control"]}/>
        </Fragment>
    )
}