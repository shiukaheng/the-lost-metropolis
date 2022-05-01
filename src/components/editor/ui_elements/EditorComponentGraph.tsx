import EditorEmbeddedWidget from "./EditorEmbeddedWidget";
import Select from 'react-select';
import MagicDiv from "../../utilities/MagicDiv";
import { createElement, useState, useContext } from "react";
import { v4 as uuidv4 } from 'uuid';
import { KeyPressCallback, formatRGBCSS, useMultiLang } from "../../../utilities";
import { Theme, ThemeContext } from "../../App"
import { EditorContext } from "../EditorContext";
import { ViewerContext } from "../../viewer/ViewerContext";
import { components, VaporComponent, VaporInputsType } from "../../viewer/ComponentDeclarations"
import { createSelectStyles } from "../utilities";

function getDefaultInputs(inputObject:VaporInputsType) {
    var defaultInputs = {}
    Object.entries(inputObject).map(([key, value])=>{
        if (value.type.typeCheck(value.default)) {
            defaultInputs[key] = value.default
        } else {
            throw "invalid default arguments"
        }
    })
    return defaultInputs
}

function generateProps(vaporComponent:VaporComponent) {
    const defaultInputs = getDefaultInputs(vaporComponent.inputs)
    const uuid = uuidv4()
    const props = {
        key: uuid,
        objectID: uuid,
        ...defaultInputs
    }
    return props
}

function SceneChildItem({child, onClick, selected}) {
    return (
        <div className={`px-2 cursor-pointer select-none rounded-3xl ${selected ? "bg-blue-600" : "bg-transparent"}`} onClick={onClick}>{`${child.props.name} - [${child.type.displayName}]`}</div>
    )
}

// Component for selecting scene or deleting scene components, stays in sync with the editor viewport
export default function EditorComponentGraph() {
    const {sceneChildren} = useContext(ViewerContext)
    const {selectedIDs, setSelectedIDs, addSelectedIDs, removeSelectedIDs, shiftPressed, setSceneChildren} = useContext(EditorContext)
    const [addChildrenType, setAddChildrenType] = useState<null|VaporComponent>(null)
    const heading = useMultiLang({"en": "components", "zh": "組件"})
    const componentOptions = components.map(component => ({
        label: component.displayName,
        value: component
    }))

    const {theme} = useContext(ThemeContext)
    const customStyles = createSelectStyles(theme)
    return (
        <EditorEmbeddedWidget title={heading} stickyKey="compGraphExpanded">
            <KeyPressCallback keyName="Delete" onDown={()=>{
                setSceneChildren(sceneChildren.filter(child => !(selectedIDs.includes(child.props.objectID))))
            }}/>
            <div className="flex flex-row gap-2">
                <Select className="flex-grow" options={componentOptions} styles={customStyles} onChange={(value, _)=>setAddChildrenType(() => value.value)}/>
                <MagicDiv mergeTransitions className={`editor-secondary-button ${(addChildrenType===null) ? "disabled" : ""}`} onClick={()=>{
                    const generatedProps = generateProps(addChildrenType)
                    setSceneChildren(
                        sceneChildren.concat(
                            [
                                createElement(addChildrenType, generatedProps, [])
                            ]
                        )
                    )
                }} languageSpecificChildren={{
                    "en": "add",
                    "zh": "新增"
                }}/>
            </div>
            <div className="gap-2">
                {
                    sceneChildren.map((child) => (
                        <SceneChildItem selected={selectedIDs.includes(child.props.objectID)} key={uuidv4()} child={child} onClick={
                            ()=>{
                                if (shiftPressed) {
                                    if (selectedIDs.includes(child.props.objectID)) {
                                        removeSelectedIDs(child.props.objectID)
                                    } else {
                                        addSelectedIDs(child.props.objectID)
                                    }
                                } else {
                                    setSelectedIDs([child.props.objectID])
                                }
                            }
                        }/>
                    ))
                }
            </div>
        </EditorEmbeddedWidget>
    )
}
