import EditorEmbeddedWidget from "./EditorEmbeddedWidget";
import EditorInputField from "./EditorInputField";
import { v4 as uuidv4 } from 'uuid';
import { cloneElement, useState } from "react";

export default function EditorComponentProperties({sceneChildren, updateSceneChildren, selectedIDs, supportedComponents}) {
    return (
        <EditorEmbeddedWidget title="Component properties">
            <div className="flex flex-col gap-2">
                {
                    selectedIDs.length === 1
                    ?
                    Object.entries(supportedComponents.find(item => item.value.component===sceneChildren.find(component => component.props.id === selectedIDs[0]).type).value.inputs).map(([key, value], i) => (
                        <div key={selectedIDs[0]+i.toString()}>
                            <EditorInputField propName={key} typeName={value.type.typeName} defaultValue={value.default} onValueChange={(newValue)=>{
                                updateSceneChildren(sceneChildren.map(child => {
                                    if (child.props.id === selectedIDs[0]) {
                                        return cloneElement(child, {
                                            [key]: newValue
                                        })
                                    }
                                    return child
                                }))
                            }}/>
                        </div>
                    ))
                    :
                    (
                        selectedIDs.length > 1
                        ?
                        <div>Multiple components selected</div>
                        :
                        <div>No component selected</div>
                    )
                }
            </div>
        </EditorEmbeddedWidget>
    )
}