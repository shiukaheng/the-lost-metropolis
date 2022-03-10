import MagicDiv from "../../utilities/MagicDiv";
import { components, getComponentFromID, VaporInputsType} from "../../viewer/ComponentDeclarations";
import EditorEmbeddedWidget from "./EditorEmbeddedWidget";
import { createElement, useContext, useRef } from "react";
import FileSaver from "file-saver"
import { ViewerContext } from "../../viewer/ViewerContext";
import { v4 as uuidv4 } from 'uuid';
import MagicButton from "../../utilities/MagicButton";
import { useMultilang } from "../../../utilities";

// Utilties and components for import / export

// Limitations:
// 1.) Can only serialize / deserialize props with types that are supported by the editor
// 2.) Does not support children, but can be extended to do so (recursive serialization / deserialization)

// Serialization: reading from sceneChildren and outputting to a JSON compatible object

export function exportChild(child) {
    const {type, props} = child;
    const newProps = {...props};
    if (!(components.includes(type))) {
        throw `Component type ${type} not supported for export`;
    }
    fixProps(newProps, type.inputs);
    // Note: We export type variable as string
    return {
        type: type.componentID,
        props: newProps
    };
}

export function fixProps(newProps, propInfo:VaporInputsType) {
    Object.entries(newProps).forEach(([key, value]) => {
        // Check whether prop exists in propInfo, if not, remove it and warn, except for id. The children prop should be removed silently.
        if (!(key in propInfo) && key !== "objectID") {
            if (key !== "children") {
                console.warn(`Prop ${key} not supported for export`);
            }
            delete newProps[key];
        } else {
            // Check each prop with respective typeCheck function, if not valid, replace with default value (except id, which we spare)
            if (key !== "objectID") {
                const typeCheck = propInfo[key].type.typeCheck;
                if (typeCheck) {
                    if (!typeCheck(value)) {
                        console.warn(`Prop ${key} has invalid value ${value}, replacing with default value`);
                        newProps[key] = propInfo[key].default;
                    }
                }
            }
        }
    });
    // Check whether any props specified in propInfo are missing, if so, add it from the default value and warn
    Object.entries(propInfo).forEach(([key, value]) => {
        if (!(key in newProps)) {
            console.warn(`Prop ${key} missing, adding default value`);
            newProps[key] = value.default;
        }
    });
    // Check whether id prop is missing, if so generate from uuidv4
    if (!("objectID" in newProps)) {
        console.warn(`componentID missing, generating one to fill in`);
        newProps["objectID"] = uuidv4();
    }
}

export function exportChildren(childrenArray) {
    return childrenArray.map(child => exportChild(child));
}

// Deserialization: Reading from JSON compatible object, matching them to components from supportedComponents, and instantiating them with createElement 

export function deserializeChild(child, componentIDs) {
    const {type: typeID, props} = child;
    // Check whether type is supported
    if (!(componentIDs.includes(typeID))) {
        throw new Error(`Component type ${typeID} not supported for import`);
    }
    // Clone props to avoid modifying the original props object
    const newProps = {...props};
    // Do the same checks as in exportChild, paying notice that the type is a string
    const component = getComponentFromID(typeID);
    const propInfo = component.inputs;
    fixProps(newProps, propInfo);
    // Inject key prop which should be the same as the id
    newProps.key = newProps.objectID;
    // Get the component from the name
    // console.log(type)
    return createElement(component, newProps);
}

export function deserializeChildren(childrenArray) {
    const componentIDs = components.map(c => c.componentID)
    return childrenArray.map(child => deserializeChild(child, componentIDs));
}

export const useStatefulSerialize = () => {
    const {sceneChildren, defaultCameraProps, potreePointBudget} = useContext(ViewerContext)
    return () => {
    return {
        sceneChildren: exportChildren(sceneChildren),
        defaultCameraProps: defaultCameraProps,
        potreePointBudget: potreePointBudget,
    }
}}

export const useStatefulDeserialize = () => { 
    const {setSceneChildren, setDefaultCameraProps, setPotreePointBudget} = useContext(ViewerContext)
    return (obj) => {
        setSceneChildren(deserializeChildren(obj.sceneChildren));
        setDefaultCameraProps(obj.defaultCameraProps);
        setPotreePointBudget(obj.potreePointBudget);
    }
}

export function EditorIO() {
    const inputFile = useRef(null) 
    const onButtonClick = () => {
        // `current` points to the mounted file input element
       inputFile.current.click();
    };
    const serialize = useStatefulSerialize();
    const deserialize = useStatefulDeserialize();
    const heading = useMultilang({"en": "import / export", "zh": "導入 / 導出"});
    const importLabel = useMultilang({"en": "import", "zh": "導入"});
    const exportLabel = useMultilang({"en": "export", "zh": "導出"});
    return (
        <EditorEmbeddedWidget title={heading}>
            <div className="flex flex-row gap-2">
                <input type='file' id='file' ref={inputFile} style={{display: 'none'}} onChange={(e)=>{
                    var reader = new FileReader();
                    reader.onload = (e2) => {
                        const json = JSON.parse(e2.target.result);
                        deserialize(json)
                    }
                    reader.readAsText(e.target.files[0]);
                }}/>
                <MagicDiv mergeTransitions className="editor-secondary-button" onClick={()=>{
                    onButtonClick();
                }}>
                    {importLabel}
                </MagicDiv>
                <MagicDiv mergeTransitions className="editor-secondary-button" onClick={()=>{
                    const blob = new Blob([JSON.stringify(serialize())], {type: "text/plain;charset=utf-8"});
                    FileSaver.saveAs(blob, "scene.json");
                }}>
                    {exportLabel}
                </MagicDiv>
            </div>
        </EditorEmbeddedWidget>
    );
} 