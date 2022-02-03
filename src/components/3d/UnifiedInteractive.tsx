import { Interactive, InteractionsContext } from "@react-three/xr";
import { useContext, ReactNode } from "react";
import { EditorContext } from "../editor/EditorContext";
import { wrapOnClick, wrapOnBlur, wrapOnHover } from "../editor/utilities";

export default function UnifiedInteractive({children=[], onClick=()=>{}, onHover=()=>{}, onBlur=()=>{}, parentID, ...props}) {
    const { addInteraction, removeInteraction } = useContext(InteractionsContext)
    const interactionsSuported = (addInteraction===null) && (removeInteraction===null)
    const editorContext = useContext(EditorContext)
    const wrappedOnClick = wrapOnClick(onClick, editorContext, parentID)
    const wrappedOnHover = wrapOnHover(onHover, editorContext, parentID)
    const wrappedOnBlur = wrapOnBlur(onBlur, editorContext, parentID)
    const wrappedChildren = (
        <group {...props} onClick={wrappedOnClick} onPointerEnter={wrappedOnHover} onPointerLeave={wrappedOnBlur}>
            {children}
        </group>
    )
    return (
        interactionsSuported ? (
        <Interactive onSelect={wrappedOnClick} onHover={wrappedOnHover} onBlur={wrappedOnBlur}>
            { wrappedChildren}
        </Interactive>
        ) : (
         wrappedChildren
        )
    )
}