import { createContext } from "react"

const defaultEditorContext = {
    selectedIDs: [],
    setSelectedIDs: (ids:[]) => { },
    addSelectedIDs: (ids:[]) => { },
    removeSelectedIDs: (ids:[]) => { },
    transformMode: "translate",
    setTransformMode: (mode:string) => { },
    transformSpace: "world",
    setTransformSpace: (space:string) => { },
    overrideInteractions: false,
    setOverrideInteractions: (override:boolean) => { },
    shiftPressed: false,
    setSceneChildren: (children:[]) => { },
    removeSceneChildren: (children:[]) => { }
}

const EditorContext = createContext(defaultEditorContext)

export { EditorContext, defaultEditorContext }