import MagicDiv from "../../MagicDiv";
import { getComponentPropInfo, supportedComponents, getComponentPropInfoFromName, getComponentFromName} from "../../viewer/ComponentDeclarations";
import EditorEmbeddedWidget from "./EditorEmbeddedWidget";
import { createElement, useContext, useRef } from "react";
import FileSaver from "file-saver"
import { ViewerContext } from "../../viewer/ViewerContext";
import { v4 as uuidv4 } from 'uuid';

// Utilties and components for import / export

// Limitations:
// 1.) Can only serialize / deserialize props with types that are supported by the editor
// 2.) Does not support children, but can be extended to do so (recursive serialization / deserialization)

// Serialization: reading from sceneChildren and outputting to a JSON compatible object

function exportChild(child, componentClasses) {
    const {type, props} = child;
    const newProps = {...props};
    if (!(componentClasses.includes(type))) {
        throw "Component type not supported for export";
    }
    const propInfo = getComponentPropInfo(type)
    fixProps(newProps, propInfo);
    // Note: We export type variable as string
    return {
        type: type.name,
        props: newProps
    };
}

function fixProps(newProps, propInfo) {
    Object.entries(newProps).forEach(([key, value]) => {
        // Check whether prop exists in propInfo, if not, remove it and warn, except for id. The children prop should be removed silently.
        if (!(key in propInfo) && key !== "id") {
            if (key !== "children") {
                console.warn(`Prop ${key} not supported for export`);
            }
            delete newProps[key];
        } else {
            // Check each prop with respective typeCheck function, if not valid, replace with default value (except id, which we spare)
            if (key !== "id") {
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
    if (!("id" in newProps)) {
        console.warn(`ID prop missing, generating one to fill in`);
        newProps["id"] = uuidv4();
    }
}

function exportChildren(childrenArray) {
    const componentClasses = supportedComponents.map(component => component.value.component);
    return childrenArray.map(child => exportChild(child, componentClasses));
}

// Deserialization: Reading from JSON compatible object, matching them to components from supportedComponents, and instantiating them with createElement 

function deserializeChild(child, componentClasses) {
    const {type: typeName, props} = child;
    // Check whether type is supported
    if (!(componentClasses.includes(typeName))) {
        throw `Component type ${typeName} not supported for import`;
    }
    // Clone props to avoid modifying the original props object
    const newProps = {...props};
    // Do the same checks as in exportChild, paying notice that the type is a string
    const propInfo = getComponentPropInfoFromName(typeName);
    fixProps(newProps, propInfo);
    // Inject key prop which should be the same as the id
    newProps.key = newProps.id;
    // Get the component from the name
    const type = getComponentFromName(typeName);
    return createElement(type, newProps);
}

function deserializeChildren(childrenArray) {
    const componentClasses = supportedComponents.map(component => component.value.component.name);
    return childrenArray.map(child => deserializeChild(child, componentClasses));
}

function EditorIO() {
    const {sceneChildren, setSceneChildren, defaultCameraProps, setDefaultCameraProps} = useContext(ViewerContext)
    const inputFile = useRef(null) 
    const onButtonClick = () => {
        // `current` points to the mounted file input element
       inputFile.current.click();
    };
    const serialize = () => {
        return {
            sceneChildren: exportChildren(sceneChildren),
            defaultCameraProps: defaultCameraProps
        }
    }
    const deserialize = (obj) => {
        setSceneChildren(deserializeChildren(obj.sceneChildren));
        setDefaultCameraProps(obj.defaultCameraProps);
    }
    return (
        <EditorEmbeddedWidget title="Import / Export">
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
                    Import
                </MagicDiv>
                <MagicDiv mergeTransitions className="editor-secondary-button" onClick={()=>{
                    const blob = new Blob([JSON.stringify(serialize())], {type: "text/plain;charset=utf-8"});
                    FileSaver.saveAs(blob, "scene.json");
                }}>
                    Export
                </MagicDiv>
            </div>
        </EditorEmbeddedWidget>
    );
}

export default EditorIO;    