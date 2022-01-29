import EditorEmbeddedWidget from "./EditorEmbeddedWidget";
import EditorInputField from "./EditorInputField";
import { v4 as uuidv4 } from 'uuid';
import { cloneElement, useState } from "react";

// Find components in sceneChildren array that match the 
function updateChildren(sceneChildren, childrenToUpdate) {

}

export default function EditorComponentProperties({sceneChildren, updateSceneChildren, selectedSceneChildren, updateSelectedSceneChildren, supportedComponents}) {
    console.log(sceneChildren)
    return (
        <EditorEmbeddedWidget title="Component properties">
            <div className="flex flex-col gap-2">
                {
                    selectedSceneChildren.length === 1
                    ?
                    Object.entries(supportedComponents.find(item => item.value.component===selectedSceneChildren[0].type).value.inputs).map(([key, value]) => (
                        <div key={uuidv4()}>
                            <EditorInputField propName={key} typeName={value.type.typeName} defaultValue={value.default} onValueChange={(newValue)=>{
                                updateSceneChildren(selectedSceneChildren.map(child => {
                                    // Clone child but modify its props, keeping children
                                    var newComp = cloneElement(child, {
                                        ...child.props,
                                        [key]: newValue
                                    })
                                    return newComp
                                }))
                            }}/>
                        </div>
                    ))
                    :
                    null
                }
            </div>
        </EditorEmbeddedWidget>
    )
}