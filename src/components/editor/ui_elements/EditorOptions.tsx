import { ReactComponent as Translate } from "../svgs/translate.svg"
import { ReactComponent as Rotate } from "../svgs/rotate.svg"
import { ReactComponent as Scale } from "../svgs/scale.svg"
import { ThemeContext } from "../../App"
import { formatRGBCSS, useMultiLang } from "../../../utilities";
import MagicDiv from "../../utilities/MagicDiv"
import { useContext, useState } from "react";
import EditorEmbeddedWidget from "./EditorEmbeddedWidget";
import { EditorContext } from "../EditorContext";
import EditorInput from "./EditorInput"
import { languageLiteral } from "../../../../api/types/LanguageLiteral";
import { ThemedSelect } from "../../utilities/ThemedSelect";

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

export default function EditorOptions() {
    const { transformMode, setTransformMode, transformSpace, setTransformSpace, setOverrideInteractions, overrideInteractions } = useContext(EditorContext)
    const heading = useMultiLang({"en": "editor options", "zh": "編輯器選項"})
    const transformationLabel = useMultiLang({"en": "transformation", "zh": "變換"})
    const bypassLabel = useMultiLang({"en": "bypass editor interactions", "zh": "跳過編輯器互動"})
    return (
        <EditorEmbeddedWidget title={heading} stickyKey="editorOptionsExpanded">
            <div className="flex flex-row gap-2">
                <div>{transformationLabel}</div>
                <TransformModeSetter {...{ transformMode, setTransformMode, transformSpace, setTransformSpace }}/>
            </div>
            <EditorInput propName={bypassLabel} typeName="boolean" value={!overrideInteractions} setValue={()=>{setOverrideInteractions((v)=>(!v))}}/>
        </EditorEmbeddedWidget>
    )
}