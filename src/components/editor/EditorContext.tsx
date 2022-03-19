import { createContext } from "react"
import { ClientAsset } from "../../api_client/types/ClientAsset"

const defaultEditorContext = {
    selectedIDs: [] as string[],
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
    removeSceneChildren: (children:[]) => { },
    clientAssets: [] as ClientAsset[],
}

const EditorContext = createContext(defaultEditorContext)

export { EditorContext, defaultEditorContext }