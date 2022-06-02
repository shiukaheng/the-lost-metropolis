import { cloneElement, useContext, useEffect, useLayoutEffect } from 'react';
import EditorViewport from "./EditorViewport";
import DebugPlane from '../3d/DebugPlane';
import { useState } from 'react';
import EditorComponentGraph from './ui_elements/EditorComponentGraph';
import EditorComponentProperties from './ui_elements/EditorComponentProperties';
import MagicDiv from '../utilities/MagicDiv';
import EditorTransformControls from './ui_elements/EditorTransformControls';
import EditorOptions from './ui_elements/EditorOptions';
import { deserializeChildren, exportChildren, PostScene, useStatefulDeserialize, useStatefulSerialize } from './ui_elements/EditorIO';
import { Condition, KeyPressCallback, useBufferedPost, useKeyPress, useLazyEffect, useMultiLang } from '../../utilities';
import EditorSceneSettings from './ui_elements/EditorSceneSettings';
import { defaultEditorContext, EditorContext, MovementMode } from './EditorContext';
import { ViewerManager } from '../viewer/Viewer';
import { ViewerContext } from '../viewer/ViewerContext';
import MagicButton from '../utilities/MagicButton';
import { useNavigate, useParams } from 'react-router-dom';
import EditorAssetManager from './ui_elements/EditorAssetManager';
import { Roled } from '../../../api/implementation_types/Role';
import { Post } from '../../../api/types/Post';
import { Asset } from '../../../api/types/Asset';
import { ClientAsset } from '../../api_client/types/ClientAsset';
import { targetAssetLiteralSchema } from '../../../api/types/AssetLiteral';
import { languageLiteral, LanguageLiteral } from '../../../api/types/LanguageLiteral';
import { useThree } from '@react-three/fiber';

function Editor() {
    return (
        <ViewerManager>
            <EditorManager/>
        </ViewerManager>
    )
}

// Todo seperate Editor UI from EditorManager

function EditorManager() {
    const {sceneChildren, setSceneChildren: _setSceneChildren, audioListener, defaultCameraProps, setDefaultCameraProps, defaultXRCameraProps, potreePointBudget, setPotreePointBudget} = useContext(ViewerContext)
    // Setup state for editor
    const [selectedIDs, setSelectedIDs] = useState<string[]>([])
    const [transformMode, setTransformMode] = useState("translate")
    const [transformSpace, setTransformSpace] = useState("world")
    const [overrideInteractions, setOverrideInteractions] = useState(true)
    const [activeLanguage, setActiveLanguage] = useState<LanguageLiteral>(languageLiteral[0])
    const shiftPressed = useKeyPress("Shift")
    // Create convenience functions for adding and removing selectedIDs
    const addSelectedIDs = (newIDs) => {
        setSelectedIDs(selectedIDs.concat(newIDs))
    }
    const removeSelectedIDs = (idsToRemove) => {
        setSelectedIDs(selectedIDs.filter(id => !idsToRemove.includes(id)))
    }

    // Overrides for setSceneChildren and removeSceneChildren to update selectedIDs

    const setSceneChildren = (newChildren) => {
        // Filter out selected IDs that don't exist in the new scene
        const newSelectedIDs = selectedIDs.filter(id => newChildren.find(child => child.props.objectID === id))
        setSelectedIDs(newSelectedIDs)
        // Update the scene
        _setSceneChildren(newChildren)
    }

    const removeSceneChildren = (childrenToRemove) => {
        setSceneChildren(sceneChildren.filter(child => !childrenToRemove.includes(child)))
    }

    // Wrap children whose child.props.objectID is in selectedIDs with TransformControls
    const wrappedSceneChildren = sceneChildren.map(child => {
        return (
            <EditorTransformControls enabled={selectedIDs.includes(child.props.objectID)} key={child.props.objectID}>
                {child}
            </EditorTransformControls>
        )
    })

    const [editorExpanded, setEditorExpanded] = useState(true)

    const serialize = useStatefulSerialize()
    const deserialize = useStatefulDeserialize()

    const { id } = useParams();
    const [buffer, setBuffer, post, push, pull, changed, overwriteWarning] = useBufferedPost(id, ["sceneChildren", "configuration"], undefined, (buffer) => {
        if (buffer.configuration !== undefined && buffer.sceneChildren !== undefined) {
            deserialize(buffer as PostScene) // Dirty hack for bad types! Todo: Fix!
        }
    }) as [PostScene, (newBuffer: PostScene)=>void, Roled<Post>, ()=>Promise<void>, ()=>void, boolean, boolean]; // Yet another dirty hack!
    // Syncing internal state with buffer
    // Fetch data from buffer during mount
    // console.log(buffer)
    useEffect(() => {
        if (buffer) {
            deserialize(buffer)
        } else {
            // console.log("No buffer data, not deserializing", buffer)
        }
    }, [])
    // Update the buffer when internal state changes, will have one redundant update on mount because of initial fetch, but what the heck
    useEffect(() => {
        const newBuffer = serialize()
        setBuffer(newBuffer)
    }, [sceneChildren, defaultCameraProps, potreePointBudget, defaultXRCameraProps])

    // Update internal state when buffer changes, which only happens if we change sceneChildren (handled), and pull
    const updateLabel = useMultiLang({"en": "update", "zh": "更新"})
    const overwriteLabel = useMultiLang({
        "en": "warning: the post has changed while you were editing. saving will overwrite the changes.",
        "zh": "注意: 您正在編輯的文章已經被修改，若按更新將覆蓋修改。"
    })
    const pullLabel = useMultiLang({"en": "update to latest version", "zh": "獲取最新版本"});
    const heading = useMultiLang({"en": "editor", "zh": "編輯器"})
    let clientAssets: ClientAsset[] = []
    if (id && post !== null) {
        for (const asset of post.assets) { // TODO: This is unnecesarily complex. Should probably unify Asset and ClientAsset under ths same format but mutated with a WithPostID generic type
            const type = asset.data.metadata.targetAssetType
            const ready = asset.data.metadata.status.ready
            if (targetAssetLiteralSchema.isValidSync(type) && type !== null && ready) {
                clientAssets.push({
                    postID: id,
                    assetID: asset.id,
                    type: type,
                    assetData: asset.data.data,
                    name: asset.data.metadata.name,
                    tags: asset.data.metadata.tags,
                })
            }
        }
    }

    // Movement mode
    const [movementMode, setMovementMode] = useState<MovementMode>("orbit")

    // Layer management
    const [viewingLayerVisible, setViewingLayerVisible] = useState(defaultEditorContext.viewingLayerVisible)
    const [editingLayerVisible, setEditingLayerVisible] = useState(defaultEditorContext.editingLayerVisible)
    const [teleportLayerVisible, setTeleportLayerVisible] = useState(defaultEditorContext.teleportLayerVisible)
    
    return (
        <EditorContext.Provider value={
            {
                selectedIDs, 
                setSelectedIDs, 
                addSelectedIDs, 
                removeSelectedIDs, 
                transformMode, 
                setTransformMode, 
                transformSpace, 
                setTransformSpace, 
                overrideInteractions, 
                setOverrideInteractions, 
                shiftPressed, 
                setSceneChildren, 
                removeSceneChildren, 
                clientAssets, 
                activeLanguage, 
                setActiveLanguage,
                movementMode,
                setMovementMode,
                // Layer management
                viewingLayerVisible,
                setViewingLayerVisible,
                editingLayerVisible,
                setEditingLayerVisible,
                teleportLayerVisible,
                setTeleportLayerVisible,
            }
        }>
            <KeyPressCallback keyName={"Escape"} onDown={()=>{setSelectedIDs([])}}/>
            <div className="flex flex-row absolute w-full h-full overflow-hidden">
                <MagicDiv backgroundColorCSSProps={["backgroundColor"]} className="w-[450px] h-full flex flex-col overflow-clip select-none shrink-0 border-r">
                    <div className="border-b border-current text-2xl font-bold p-8 pb-4">
                        <div className="flex flex-row gap-4">
                            <div className='text-3xl'>{heading}</div>
                            <Condition condition={post?.role === "owner" || post?.role === "editor"}>
                                {overwriteWarning ? <MagicButton solid onClick={pull}>{pullLabel}</MagicButton> : null}
                                <MagicButton disabled={!changed} onClick={push}>{updateLabel}</MagicButton>
                            </Condition>
                            <div className="ml-auto cursor-pointer text-xl select-none" onClick={()=>{setEditorExpanded(!editorExpanded)}}>{editorExpanded ? "-" : "+"}</div>    
                        </div>
                        {(overwriteWarning && buffer) ? <div className="font-bold text-yellow-400 text-sm pt-2">{overwriteLabel}</div> : null}
                    </div>
                    {
                        editorExpanded ?
                        <div className='overflow-auto p-8 pt-0'>
                            <EditorOptions/>
                            <EditorComponentGraph/>
                            {/* Post ID and assets are passed in as props because they are not part of Post */}
                            <EditorAssetManager postID={id} assets={post?.assets}/>
                            <EditorComponentProperties/>
                            <EditorSceneSettings/>
                        </div>
                        : null
                    }
                </MagicDiv>
                <MagicDiv backgroundColorCSSProps={["backgroundColor"]} className="relative w-full h-full overflow-clip">
                    <div className="bg-black w-full h-full" onClick={()=>{audioListener.context.resume()}}>
                        <EditorViewport className="w-full h-full">
                            <DebugPlane rotation={[Math.PI/2, 0, 0]}/>
                            <LayerHelper/>
                            {wrappedSceneChildren}
                        </EditorViewport>
                    </div>
                </MagicDiv>
                
            </div>
        </EditorContext.Provider>
    );
}

function LayerHelper() {
    const {camera} = useThree()
    const {viewingLayerVisible, editingLayerVisible, teleportLayerVisible} = useContext(EditorContext)
    useLayoutEffect(()=>{
        if (viewingLayerVisible) {
            camera.layers.enable(0)
        } else {
            camera.layers.disable(0)
        }
        if (editingLayerVisible) {
            camera.layers.enable(5)
        } else {
            camera.layers.disable(5)
        }
        if (teleportLayerVisible) {
            camera.layers.enable(3)
        } else {
            camera.layers.disable(3)
        }
    }, [viewingLayerVisible, editingLayerVisible, teleportLayerVisible, camera])
    return null
}

export {Editor}