import { useNavigate, useParams } from "react-router-dom";
import { useBufferedPost, useConfirm, useMultilang, usePost } from "../../utilities";
import GenericPage from "../utilities/GenericPage";
import { Input } from "../utilities/Input";
import MagicDiv from "../utilities/MagicDiv";
import { languages } from "../App"
import { useState,  useCallback } from "react";
import { twMerge } from "tailwind-merge"
import { deletePost } from "../../api";
import MagicButton from "../utilities/MagicButton";
import { Editor } from "../editor/Editor";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import MagicIcon from "../utilities/MagicIcon";
import { ArrowsExpandIcon } from "@heroicons/react/outline";
 
export function EditPost() {
    const navigate = useNavigate()
    const [editor3dMode, setEditor3dMode] = useState(false)
    return (
        <GenericPage className="flex flex-col gap-4 md:gap-8 w-full h-full">
            <div className="flex flex-row">
                <MagicDiv languageSpecificChildren={
                    {"en": "edit post", "zh": "編輯文章"}
                } className="text-5xl font-black"/>
                <MagicButton solid languageSpecificChildren={
                    editor3dMode ?
                    {"en": "2d editor", "zh": "2d 編輯器"}
                    :
                    {"en": "3d editor", "zh": "3d 編輯器"}
                } onClick={async ()=>{
                    setEditor3dMode(!editor3dMode)
                }} className="ml-auto"/>
                <MagicButton languageSpecificChildren={
                    {"en": "< back", "zh": "< 返回"}
                } onClick={async ()=>{
                    navigate("/dashboard")
                }} className="ml-4"/>
            </div>
            <EditingForm editor3dMode={editor3dMode}/>
        </GenericPage>
    )
}

function EmbeddedTab({highlight=false, onClick, children=null, className=""}) {
    return (
        <MagicDiv mergeTransitions className={twMerge("relative justify-between grow h-full flex cursor-pointer", className)} 
        backgroundColorCSSProps={highlight ? ["color"] : []}
        onClick={onClick}>
            <div className="m-auto font-bold text-xl">{children}</div>
            <MagicDiv mergeTransitions foregroundColorCSSProps={highlight ? ["backgroundColor"] : []} className="absolute w-full h-full opacity-30"/>
        </MagicDiv>
    )
}

function EmbeddedTabs({options=[], activeOption="", onUpdate=(option)=>{}, className=""}) {
    return (
        <div className={twMerge("flex flex-row h-12", className)}>
            {
                options.map((option, index)=>{
                    return (
                        <EmbeddedTab key={index} onClick={()=>{onUpdate(option)}} highlight={activeOption===option} className={`${index > 0 ? "border-l" : ""}`}>{option}</EmbeddedTab>
                    )
                })
            }
        </div>
    )
}

function EmbeddedButton({children, onClick=()=>{}, disabled=false, className="", overrideTheme={}}) {
    return (
        <div className={twMerge(`relative flex justify-center items-center h-12 w-full ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`, className)}
        // foregroundColorCSSProps={["backgroundColor"]}
        onClick={onClick}>
            
            <MagicDiv overrideTheme={overrideTheme} mergeTransitions foregroundColorCSSProps={["backgroundColor"]} className={`absolute w-full h-full transition-opacity duration-500 ${disabled ? "opacity-50" : "hover:opacity-70"}`}/>
            <MagicDiv overrideTheme={overrideTheme} mergeTransitions foregroundColorCSSProps={[]} backgroundColorCSSProps={["color"]} className={`absolute w-full h-full pointer-events-none m-auto font-bold text-xl flex ${disabled ? "opacity-50"  : ""}`}>
                <div className="m-auto">
                    {children}
                </div>
            </MagicDiv>
            {/* <div className={`m-auto font-bold text-xl ${disabled ? "opacity-50"  : ""}`}>{children}</div> */}
        </div>
    )
}

function EditorSceneOverlay({hidden, value, setValue}) {
    const handle = useFullScreenHandle();
    return (
        <div className={`absolute w-full h-full z-10 ${hidden ? "hidden" : ""}`}>
            <FullScreen handle={handle}>
                <Editor value={value} setValue={setValue}/>
            </FullScreen>
            <div className="absolute w-full h-full p-8 pointer-events-none">
                <MagicIcon IconComponent={ ArrowsExpandIcon } className="w-8 h-8 ml-auto pointer-events-auto" clickable onClick={handle.enter}/>
            </div>
        </div>
    )
}

function EditingForm({className="", editor3dMode=false}) {
    const { id } = useParams();
    const navigate = useNavigate()
    const [buffer, setBuffer, post, push, pull, changed, overwriteWarning] = useBufferedPost(id);
    const titleLabel = useMultilang({"en": "title", "zh": "標題"});
    const descriptionLabel = useMultilang({"en": "description", "zh": "描述"});
    const publishedLabel = useMultilang({"en": "published", "zh": "公開"});
    const saveLabel = useMultilang({"en": "update", "zh": "更新"});
    const [activeLanguage, setActiveLanguage] = useState(languages[0]);
    const deleteDefaultLabel = useMultilang({"en": "delete", "zh": "刪除"});
    const deleteConfirmationLabel = useMultilang({"en": "click to confirm", "zh": "點擊確認"});
    const deletePendingLabel = useMultilang({"en": "deleting...", "zh": "刪除中..."});
    const [deleteLabel, deleteTrigger] = useConfirm(deleteDefaultLabel, deleteConfirmationLabel, deletePendingLabel, async ()=>{
        console.log(id)
        await deletePost(id)
        navigate("/dashboard")
    })
    return (
        // Return table with inputs for title, description, and published
        <div className={twMerge("border rounded-3xl overflow-clip relative h-full flex flex-col", className)}>
            <EditorSceneOverlay value={buffer.data} setValue={(value) => setBuffer({...buffer, data: value})} hidden={!editor3dMode}/>
            <EmbeddedTabs options={languages} activeOption={activeLanguage} onUpdate={setActiveLanguage} className="border-b"/>
            <div className="px-8 py-8 flex flex-col gap-4">
                {/* <div className="flex flex-row">
                    <div className="w-10 md:w-20">{titleLabel}</div>
                    <div className="grow">
                        <Input typeName="string" value={buffer.title[activeLanguage]} setValue={(value) => setBuffer({...buffer, title: {...buffer.title, [activeLanguage]: value}})} />
                    </div>
                </div>
                <div className="flex flex-row">
                    <div className="w-10 md:w-20">{descriptionLabel}</div>
                    <div className="grow">
                        <Input typeName="multiline-string" value={buffer.description[activeLanguage]} setValue={(value) => setBuffer({...buffer, description: {...buffer.description, [activeLanguage]: value}})} />
                    </div>
                </div>
                <div className="flex flex-row">
                    <div className="w-10 md:w-20">{publishedLabel}</div>
                    <div className="grow">
                        <Input typeName="boolean" value={buffer.published} setValue={(value) => setBuffer({...buffer, published: value})} />
                    </div>
                </div> */}
                {/* Rewrite to use table instead */}
                <table className="w-full">
                    <tbody className="post-editor">
                        <tr>
                            <td>{titleLabel}</td>
                            <td>
                                <Input typeName="string" value={buffer.title[activeLanguage]} setValue={(value) => setBuffer({...buffer, title: {...buffer.title, [activeLanguage]: value}})} />
                            </td>
                        </tr>
                        <tr>
                            <td>{descriptionLabel}</td>
                            <td>
                                <Input typeName="multiline-string" value={buffer.description[activeLanguage]} setValue={(value) => setBuffer({...buffer, description: {...buffer.description, [activeLanguage]: value}})} />
                            </td>
                        </tr>
                        <tr>
                            <td>{publishedLabel}</td>
                            <td>
                                <Input typeName="boolean" value={buffer.published} setValue={(value) => setBuffer({...buffer, published: value})} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="flex flex-row border-t mt-auto">
                <EmbeddedButton className="basis-3/4" onClick={push} disabled={!changed}>{saveLabel}</EmbeddedButton>
                <EmbeddedButton className="basis-1/4 border-l" overrideTheme={{foregroundColor: [209, 54, 70]}} onClick={deleteTrigger}>{deleteLabel}</EmbeddedButton>
            </div>
        </div>
    )
}