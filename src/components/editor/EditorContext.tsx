import { createContext } from "react"
import { LanguageLiteral, languageLiteral } from "../../../api/types/LanguageLiteral"
import { ClientAsset } from "../../api_client/types/ClientAsset"

export type MovementMode = "pointerlock" | "orbit"

const defaultEditorContext = {
    // Selection
    selectedIDs: [] as string[],
    setSelectedIDs: (ids:[]) => { },
    addSelectedIDs: (ids:[]) => { },
    removeSelectedIDs: (ids:[]) => { },
    // Transformation modes
    transformMode: "translate",
    setTransformMode: (mode:string) => { },
    transformSpace: "world",
    setTransformSpace: (space:string) => { },
    // Interaction overrides
    overrideInteractions: false,
    setOverrideInteractions: (override:boolean) => { },
    shiftPressed: false,
    // Convenience functions for component management
    setSceneChildren: (children:[]) => { },
    removeSceneChildren: (children:[]) => { },
    // Client asset management
    clientAssets: [] as ClientAsset[],
    // Language to edit
    activeLanguage: languageLiteral[0] as LanguageLiteral,
    setActiveLanguage: (language:LanguageLiteral) => { },
    // Movement mode
    movementMode: "orbit" as MovementMode,
    setMovementMode: (mode:MovementMode) => { },
    // Layer management
    // Viewing layer
    viewingLayerVisible: true,
    setViewingLayerVisible: (visible:boolean) => { },
    // Editing layer
    editingLayerVisible: true,
    setEditingLayerVisible: (visible:boolean) => { },
    // Teleport layer
    teleportLayerVisible: true,
    setTeleportLayerVisible: (visible:boolean) => { },
}

const EditorContext = createContext(defaultEditorContext)

export { EditorContext, defaultEditorContext }