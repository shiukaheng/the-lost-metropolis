import { cloneElement, useContext, useEffect } from 'react';
import EditorViewport from "./EditorViewport";
import DebugPlane from '../3d/DebugPlane';
import { useState } from 'react';
import EditorComponentGraph from './ui_elements/EditorComponentGraph';
import EditorComponentProperties from './ui_elements/EditorComponentProperties';
import MagicDiv from '../utilities/MagicDiv';
import EditorTransformControls from './ui_elements/EditorTransformControls';
import EditorOptions from './ui_elements/EditorOptions';
import { deserializeChildren, exportChildren } from './ui_elements/EditorIO';
import { KeyPressCallback, useKeyPress } from '../../utilities';
import EditorSceneSettings from './ui_elements/EditorSceneSettings';
import { EditorContext } from './EditorContext';
import ViewerManager from '../viewer/Viewer';
import { ViewerContext } from '../viewer/ViewerContext';

function Editor({value, setValue}) {
    return (
        <ViewerManager>
            <EditorManager value={value} setValue={setValue}/>
        </ViewerManager>
    )
}

// Todo seperate Editor UI from EditorManager

function EditorManager({value, setValue}) {
    const {sceneChildren, setSceneChildren: _setSceneChildren, audioListener, defaultCameraProps, setDefaultCameraProps, potreePointBudget, setPotreePointBudget} = useContext(ViewerContext)
    // Setup state for editor
    const [selectedIDs, setSelectedIDs] = useState([])
    const [transformMode, setTransformMode] = useState("translate")
    const [transformSpace, setTransformSpace] = useState("world")
    const [overrideInteractions, setOverrideInteractions] = useState(true)
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
        const newSelectedIDs = selectedIDs.filter(id => newChildren.find(child => child.props.id === id))
        setSelectedIDs(newSelectedIDs)
        // Update the scene
        _setSceneChildren(newChildren)
    }

    const removeSceneChildren = (childrenToRemove) => {
        setSceneChildren(sceneChildren.filter(child => !childrenToRemove.includes(child)))
    }

    // Wrap children whose child.props.id is in selectedIDs with TransformControls
    const wrappedSceneChildren = sceneChildren.map(child => {
        return (
            <EditorTransformControls enabled={selectedIDs.includes(child.props.id)} key={child.props.id}>
                {child}
            </EditorTransformControls>
        )
    })

    const [editorExpanded, setEditorExpanded] = useState(true)

    // IO
    const serialize = () => {
        return {
            sceneChildren: exportChildren(sceneChildren),
            defaultCameraProps: defaultCameraProps,
            potreePointBudget,
        }
    }
    const deserialize = (obj) => {
        setSceneChildren(deserializeChildren(obj.sceneChildren));
        setDefaultCameraProps(obj.defaultCameraProps);
        setPotreePointBudget(obj.potreePointBudget);
    }
    // useEffect(()=>{
    //     if (value) {
    //         deserialize(value)
    //     }
    // }, [value, sceneChildren])

    useEffect(()=>{
        if (sceneChildren) {
            setValue(serialize())
        }
    }, [sceneChildren])

    return (
        <EditorContext.Provider value={
            {selectedIDs, setSelectedIDs, addSelectedIDs, removeSelectedIDs, transformMode, setTransformMode, transformSpace, setTransformSpace, overrideInteractions, setOverrideInteractions, shiftPressed, setSceneChildren, removeSceneChildren}
        }>
            <KeyPressCallback keyName={"Escape"} onDown={()=>{setSelectedIDs([])}}/>
            <MagicDiv backgroundColorCSSProps={["backgroundColor"]} className="absolute w-full h-full">
                <div className="absolute w-full h-full bg-black" onClick={()=>{audioListener.context.resume()}}>
                    <EditorViewport className="w-full h-full">
                        <DebugPlane rotation={[Math.PI/2, 0, 0]}/>
                        {wrappedSceneChildren}
                    </EditorViewport>
                </div>
            </MagicDiv>
            <MagicDiv className="absolute w-[500px] flex flex-col p-4 overflow-clip">
                <div className="editor-embedded-widget text-2xl font-bold flex flex-row">
                    <div>Editor</div>
                    <div className="ml-auto cursor-pointer text-xl select-none" onClick={()=>{setEditorExpanded(!editorExpanded)}}>{editorExpanded ? "-" : "+"}</div>    
                </div>
                {
                    editorExpanded ?
                    <div>
                        <EditorComponentGraph/>
                        <EditorComponentProperties/>
                        <EditorOptions/>
                        {/* <EditorIO/> */}
                        <EditorSceneSettings/>
                    </div>
                    : null
                }
            </MagicDiv>
        </EditorContext.Provider>
    );
}

export {Editor}