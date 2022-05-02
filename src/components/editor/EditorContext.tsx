import { createContext } from "react"
import { LanguageLiteral, languageLiteral } from "../../../api/types/LanguageLiteral"
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
    activeLanguage: languageLiteral[0] as LanguageLiteral,
    setActiveLanguage: (language:LanguageLiteral) => { },
}

const EditorContext = createContext(defaultEditorContext)

export { EditorContext, defaultEditorContext }