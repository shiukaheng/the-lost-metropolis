import EditorEmbeddedWidget from "./EditorEmbeddedWidget";
import Select from 'react-select';
import MagicDiv from "../MagicDiv";
import { createElement, useEffect, useRef, useState, useContext } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useKeyPress, KeyPressCallback, formatRGBCSS } from "../../utilities";
import { ThemeContext } from "../App"

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
        <div className={`cursor-pointer select-none rounded-full ${selected ? "bg-blue-600" : "bg-transparent"}`} onClick={onClick}>{child.type.name}</div>
    )
}

// Component for selecting scene or deleting scene components, stays in sync with the editor viewport
export default function EditorComponentGraph({sceneChildren, updateSceneChildren, selectedSceneChildren, updateSelectedSceneChildren, supportedComponents}) {
    const [addChildrenType, setAddChildrenType] = useState(null)
    const shiftPress = useKeyPress("Shift")
    const theme = useContext(ThemeContext)
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
                updateSceneChildren(sceneChildren.filter(child => !(selectedSceneChildren.includes(child))))
            }}/>
            <div className="flex flex-row gap-2">
                <Select className="flex-grow" options={supportedComponents} styles={customStyles} onChange={(value, _)=>{setAddChildrenType(value.value)}}/>
                {/* <MagicDiv mergeTransitions className="secondary-button flex-grow">Add</MagicDiv> */}
                <MagicDiv mergeTransitions className={`secondary-button ${(addChildrenType===null) ? "disabled" : ""}`} onClick={()=>{
                    updateSceneChildren(sceneChildren.concat([createElement(addChildrenType.component, generateKey(getDefaultInputs(addChildrenType.inputs)), null)]))
                }}>Add</MagicDiv>
            </div>
            <div className="mt-2 gap-2">
                {
                    sceneChildren.map((child) => (
                        <SceneChildItem selected={selectedSceneChildren.includes(child)} key={uuidv4()} child={child} onClick={
                            ()=>{
                                if (shiftPress) {
                                    if (selectedSceneChildren.includes(child)) {
                                        updateSelectedSceneChildren(selectedSceneChildren.filter(elem => elem !== child))
                                    } else {
                                        updateSelectedSceneChildren(selectedSceneChildren.concat([child]))
                                    }
                                } else {
                                    updateSelectedSceneChildren([child])
                                }
                            }
                        }/>
                    ))
                }
            </div>
        </EditorEmbeddedWidget>
    )
}