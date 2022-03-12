import EditorEmbeddedWidget from "./EditorEmbeddedWidget";
import Select from 'react-select';
import MagicDiv from "../../utilities/MagicDiv";
import { createElement, useState, useContext } from "react";
import { v4 as uuidv4 } from 'uuid';
import { KeyPressCallback, formatRGBCSS, useMultilang } from "../../../utilities";
import { ThemeContext } from "../../App"
import { EditorContext } from "../EditorContext";
import { ViewerContext } from "../../viewer/ViewerContext";
import { components, VaporComponent, VaporInputsType } from "../../viewer/ComponentDeclarations"

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
    const heading = useMultilang({"en": "components", "zh": "組件"})
    const componentOptions = components.map(component => ({
        label: component.displayName,
        value: component
    }))

    const {theme} = useContext(ThemeContext)
    const customStyles = {
        option: (provided, state) => ({
            ...provided,
            fontSize: "15px",
            // backgroundColor: formatRGBCSS(theme.backgroundColor),
            color: formatRGBCSS(theme.backgroundColor)
        }),
        control: (provided, state) => ({
            // none of react-select's styles are passed to <Control />
            ...provided,
            borderRadius: "999px",
            backgroundColor: formatRGBCSS(theme.foregroundColor),
            color: formatRGBCSS(theme.foregroundColor)
        }),
        singleValue: (provided, state) => {
            const opacity = state.isDisabled ? 0.5 : 1;
            const transition = 'opacity 300ms';
            const color = formatRGBCSS(theme.backgroundColor);
            return { ...provided, opacity, transition, color };
        },
        menu: (provided, state) => ({
            ...provided,
            borderRadius: "20px",
            overflow: "clip",
            backgroundColor: formatRGBCSS(theme.foregroundColor),
            color: formatRGBCSS(theme.backgroundColor),
            // borderColor: formatRGBCSS(theme.backgroundColor),
            borderWidth: "1px",
        })
    }
    return (
        <EditorEmbeddedWidget title={heading}>
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