import { Interactive, InteractionsContext } from "@react-three/xr";
import { useContext } from "react";
import { EditorContext, wrapOnBlur, wrapOnClick, wrapOnHover } from "../editor/Editor";

export default function UnifiedInteractive({children=[], onClick=()=>{}, onHover=()=>{}, onBlur=()=>{}, parentID, ...props}) {
    const { addInteraction, removeInteraction } = useContext(InteractionsContext)
    const interactionsSuported = (addInteraction===null) && (removeInteraction===null)
    const editorContext = useContext(EditorContext)
    const wrappedOnClick = wrapOnClick(onClick, editorContext, parentID)
    const wrappedOnHover = wrapOnHover(onHover, editorContext, parentID)
    const wrappedOnBlur = wrapOnBlur(onBlur, editorContext, parentID)
    const wrappedChildren = (
        <group onClick={wrappedOnClick} onPointerEnter={wrappedOnHover} onPointerLeave={wrappedOnBlur} {...props}>
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