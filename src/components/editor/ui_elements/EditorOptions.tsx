import { ReactComponent as Translate } from "../svgs/translate.svg"
import { ReactComponent as Rotate } from "../svgs/rotate.svg"
import { ReactComponent as Scale } from "../svgs/scale.svg"
import { ThemeContext } from "../../App"
import { formatRGBCSS, useMultiLang, useMultiLangObject } from "../../../utilities";
import MagicDiv from "../../utilities/MagicDiv"
import { useContext, useState } from "react";
import EditorEmbeddedWidget from "./EditorEmbeddedWidget";
import { EditorContext } from "../EditorContext";
import EditorInput from "./EditorInput"
import { languageLiteral } from "../../../../api/types/LanguageLiteral";
import { ThemedSelect } from "../../utilities/ThemedSelect";
import { Input } from "../../utilities/Input";

function TransformModeSetter({transformMode, setTransformMode, transformSpace, setTransformSpace}) {
    const {theme} = useContext(ThemeContext)
    const iconActiveStyle = {
        color: formatRGBCSS(theme.backgroundColor)
    }
    const iconInactiveStyle = {
        color: formatRGBCSS(theme.foregroundColor)
    }
    const iconContainerActiveStyle = {
        backgroundColor: formatRGBCSS(theme.foregroundColor),
        color: formatRGBCSS(theme.backgroundColor)
    }
    const iconContainerInactiveStyle = {
        // backgroundColor: formatRGBCSS(theme.backgroundColor),
        color: formatRGBCSS(theme.foregroundColor)
    }
    return(
        <div className="flex flex-row gap-2">
            <div className="rounded-3xl border flex flex-row h-6 overflow-clip w-[4.5rem]" style={{
                borderColor: formatRGBCSS(theme.foregroundColor)
            }}>
                <div className="cursor-pointer w-1/3 p-1" onClick={()=>{setTransformMode("translate")}} style={(transformMode==="translate") ? iconContainerActiveStyle : iconContainerInactiveStyle}>
                    <Translate className=" w-full h-full fill-current" style={(transformMode==="translate") ? iconActiveStyle : iconInactiveStyle}/>
                </div>
                <div className="cursor-pointer w-1/3 p-1" onClick={()=>{setTransformMode("rotate")}} style={(transformMode==="rotate") ? iconContainerActiveStyle : iconContainerInactiveStyle}>
                    <Rotate className="w-full h-full fill-current" style={(transformMode==="rotate") ? iconActiveStyle : iconInactiveStyle}/>
                </div>
                <div className="cursor-pointer w-1/3 p-1" onClick={()=>{setTransformMode("scale")}} style={(transformMode==="scale") ? iconContainerActiveStyle : iconContainerInactiveStyle}>
                    <Scale className="w-full h-full fill-current" style={(transformMode==="scale") ? iconActiveStyle : iconInactiveStyle}/>
                </div>
            </div>
            <MagicDiv className="rounded-3xl border flex flex-row h-6 overflow-clip w-[7rem]">
                <div className="cursor-pointer w-1/2 text-center text-sm px-1" onClick={()=>{setTransformSpace("world")}} style={(transformSpace==="world" ? iconContainerActiveStyle : iconContainerInactiveStyle)}>
                    World
                </div>
                <div className="cursor-pointer w-1/2 text-center text-sm px-1" onClick={()=>{setTransformSpace("local")}} style={(transformSpace==="local" ? iconContainerActiveStyle : iconContainerInactiveStyle)}>
                    Local
                </div>
            </MagicDiv>
        </div>
    )
}

function MovementModeSetter() {
    const {movementMode, setMovementMode} = useContext(EditorContext)
    // Dropdown options to allow user to select the movement mode
    const labels = useMultiLangObject({
        "orbit": {
            "en": "orbit",
            "zh": "常軌"
        }, 
        "pointerlock": {
            "en": "first person",
            "zh": "第一人"
        }
    })
    const options = [
        {
            value: "orbit",
            label: labels["orbit"]
        },
        {
            value: "pointerlock",
            label: labels["pointerlock"]
        }
    ]
    return (
        <ThemedSelect className="grow" options={options} onChange={(selected, _) => {
            setMovementMode(selected.value)
            }} 
            value={options.find(o => o.value===movementMode)}/>
    )
}


function LayerSetters() {
    const {viewingLayerVisible, setViewingLayerVisible, editingLayerVisible, setEditingLayerVisible, teleportLayerVisible, setTeleportLayerVisible} = useContext(EditorContext)
    const text = useMultiLangObject({
        "title": {
            "en": "editor layers",
            "zh": "編輯器圖層"
        },
        "viewing": {
            "en": "viewing",
            "zh": "檢視"
        },
        "editing": {
            "en": "editing",
            "zh": "編輯器"
        },
        "teleport": {
            "en": "teleport",
            "zh": "傳送"
        }
    })
    // Checkboxes to allow user to select which layers to show
    return (
        <table>
            <tbody>
                <tr>
                    <td className="">{text["viewing"]}</td>
                    <td className="">
                        <Input typeName="boolean" value={viewingLayerVisible} setValue={(value)=>{setViewingLayerVisible(value)}}/>
                    </td>
                </tr>
                <tr>
                    <td className="">{text["editing"]}</td>
                    <td className="">
                        <Input typeName="boolean" value={editingLayerVisible} setValue={(value)=>{setEditingLayerVisible(value)}}/>
                    </td>
                </tr>
                <tr>
                    <td className="">{text["teleport"]}</td>
                    <td className="">
                        <Input typeName="boolean" value={teleportLayerVisible} setValue={(value)=>{setTeleportLayerVisible(value)}}/>
                    </td>
                </tr>
            </tbody>
        </table>
    )
}

export default function EditorOptions() {
    const { transformMode, setTransformMode, transformSpace, setTransformSpace, setOverrideInteractions, overrideInteractions } = useContext(EditorContext)
    const heading = useMultiLang({"en": "editor options", "zh": "編輯器選項"})
    const transformationLabel = useMultiLang({"en": "transformation", "zh": "變換"})
    const movementLabel = useMultiLang({"en": "navigation", "zh": "移動模式"})
    const bypassLabel = useMultiLang({"en": "bypass editor interactions", "zh": "跳過編輯器互動"})
    const layersLabel = useMultiLang({"en": "editor layers", "zh": "編輯器圖層"})
    return (
        <EditorEmbeddedWidget title={heading} stickyKey="editorOptionsExpanded">
            <div className="flex flex-row gap-2">
                <div>{transformationLabel}</div>
                <TransformModeSetter {...{ transformMode, setTransformMode, transformSpace, setTransformSpace }}/>
            </div>
            <div className="flex flex-col gap-2">
                <div>{movementLabel}</div>
                <MovementModeSetter/>
            </div>
            <div className="flex flex-col gap-2">
                <div>{layersLabel}</div>
                <LayerSetters/>
            </div>
            <EditorInput propName={bypassLabel} typeName="boolean" value={!overrideInteractions} setValue={()=>{setOverrideInteractions((v)=>(!v))}}/>
        </EditorEmbeddedWidget>
    )
}