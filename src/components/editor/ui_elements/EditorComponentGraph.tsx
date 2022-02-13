import EditorEmbeddedWidget from "./EditorEmbeddedWidget";
import Select from 'react-select';
import MagicDiv from "../../utilities/MagicDiv";
import { createElement, useEffect, useRef, useState, useContext } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useKeyPress, KeyPressCallback, formatRGBCSS } from "../../../utilities";
import { ThemeContext } from "../../App"
import { EditorContext } from "../EditorContext";
import { ViewerContext } from "../../viewer/ViewerContext";
import { getLabelFromComponent, supportedComponents } from "../../viewer/ComponentDeclarations"

function getDefaultInputs(inputObject) {
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

function generateKey({...props}) {
    var uuid = uuidv4()
    return {
        key: uuid,
        id: uuid,
        ...props
    }
}

function SceneChildItem({child, onClick, selected}) {
    return (
        <div className={`px-2 cursor-pointer select-none rounded-full ${selected ? "bg-blue-600" : "bg-transparent"}`} onClick={onClick}>{`${child.props.name} - [${getLabelFromComponent(child.type)}]`}</div>
    )
}

// Component for selecting scene or deleting scene components, stays in sync with the editor viewport
export default function EditorComponentGraph() {
    const {sceneChildren} = useContext(ViewerContext)
    const {selectedIDs, setSelectedIDs, addSelectedIDs, removeSelectedIDs, shiftPressed, setSceneChildren} = useContext(EditorContext)
    const [addChildrenType, setAddChildrenType] = useState(null)

    const {theme} = useContext(ThemeContext)
    const customStyles = {
        option: (provided, state) => ({
            ...provided,
            fontSize: "15px",
            backgroundColor: formatRGBCSS(theme.backgroundColor),
            color: formatRGBCSS(theme.foregroundColor)
        }),
        control: (provided, state) => ({
            // none of react-select's styles are passed to <Control />
            ...provided,
            borderRadius: "999px",
            backgroundColor: formatRGBCSS(theme.backgroundColor),
            color: formatRGBCSS(theme.foregroundColor)
        }),
        singleValue: (provided, state) => {
            const opacity = state.isDisabled ? 0.5 : 1;
            const transition = 'opacity 300ms';
            const color = formatRGBCSS(theme.foregroundColor);
            return { ...provided, opacity, transition, color };
        },
        menu: (provided, state) => ({
            ...provided,
            borderRadius: "20px",
            overflow: "clip",
            backgroundColor: formatRGBCSS(theme.backgroundColor),
            color: formatRGBCSS(theme.foregroundColor),
            borderColor: formatRGBCSS(theme.foregroundColor),
            borderWidth: "1px",
        })
    }
    return (
        <EditorEmbeddedWidget title="Components">
            <KeyPressCallback keyName="Delete" onDown={()=>{
                setSceneChildren(sceneChildren.filter(child => !(selectedIDs.includes(child.props.id))))
            }}/>
            <div className="flex flex-row gap-2">
                <Select className="flex-grow" options={supportedComponents} styles={customStyles} onChange={(value, _)=>{setAddChildrenType(value.value)}}/>
                <MagicDiv mergeTransitions className={`editor-secondary-button ${(addChildrenType===null) ? "disabled" : ""}`} onClick={()=>{
                    setSceneChildren(sceneChildren.concat([createElement(addChildrenType.component, generateKey(getDefaultInputs(addChildrenType.inputs)), null)]))
                }}>add</MagicDiv>
            </div>
            <div className="gap-2">
                {
                    sceneChildren.map((child) => (
                        <SceneChildItem selected={selectedIDs.includes(child.props.id)} key={uuidv4()} child={child} onClick={
                            ()=>{
                                if (shiftPressed) {
                                    if (selectedIDs.includes(child.props.id)) {
                                        removeSelectedIDs(child.props.id)
                                    } else {
                                        addSelectedIDs(child.props.id)
                                    }
                                } else {
                                    setSelectedIDs([child.props.id])
                                }
                            }
                        }/>
                    ))
                }
            </div>
        </EditorEmbeddedWidget>
    )
}