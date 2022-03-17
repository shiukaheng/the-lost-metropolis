import { useNavigate, useParams } from "react-router-dom";
import { Condition, useBufferedPost, useConfirm, useMultilang, usePost } from "../../utilities";
import GenericPage from "../utilities/GenericPage";
import { Input } from "../utilities/Input";
import MagicDiv from "../utilities/MagicDiv";
import { languages } from "../App"
import { useState,  useCallback } from "react";
import MagicButton from "../utilities/MagicButton";
import { Editor } from "../editor/Editor";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import MagicIcon from "../utilities/MagicIcon";
import { ArrowsExpandIcon } from "@heroicons/react/outline";
import { EmbeddedButton, EmbeddedRow, EmbeddedTabs, RoundedContainer } from "../utilities/EmbeddedUI";
import VaporAPI from "../../api_client/api";
 
export function EditPost() {
    const {id} = useParams()
    const navigate = useNavigate()
    const [editor3dMode, setEditor3dMode] = useState(false)
    return (
        <GenericPage className="flex flex-col gap-4 md:gap-8 w-full h-full">
            <div className="flex flex-row">
                <MagicDiv languageSpecificChildren={
                    {"en": "edit post", "zh": "編輯文章"}
                } className="text-5xl font-black"/>
                <MagicButton languageSpecificChildren={
                    {"en": "< back", "zh": "< 返回"}
                } onClick={async ()=>{
                    navigate(`/dashboard`)
                }} className="ml-auto"/>
                <MagicButton solid languageSpecificChildren={
                    editor3dMode ?
                    {"en": "2d editor", "zh": "2d 編輯器"}
                    :
                    {"en": "3d editor", "zh": "3d 編輯器"}
                } onClick={async ()=>{
                    setEditor3dMode(!editor3dMode)
                }} className="ml-4"/>
            </div>
            <EditingForm editor3dMode={editor3dMode}/>
        </GenericPage>
    )
}

function EditorSceneOverlay({hidden, value, setValue}) {
    const handle = useFullScreenHandle();
    return (
        <div className={`absolute w-full h-full z-10 ${hidden ? "hidden" : ""}`}>
            <FullScreen handle={handle}>
                <Editor/>
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
    const [buffer, setBuffer, post, push, pull, changed, overwriteWarning] = useBufferedPost(id, ["title", "description", "public"]);
    const titleLabel = useMultilang({"en": "title", "zh": "標題"});
    const descriptionLabel = useMultilang({"en": "description", "zh": "描述"});
    const publicLabel = useMultilang({"en": "public", "zh": "公開"});
    const saveLabel = useMultilang({"en": "update", "zh": "更新"});
    const [activeLanguage, setActiveLanguage] = useState(languages[0]);
    const deleteDefaultLabel = useMultilang({"en": "delete", "zh": "刪除"});
    const deleteConfirmationLabel = useMultilang({"en": "click to confirm", "zh": "點擊確認"});
    const deletePendingLabel = useMultilang({"en": "deleting...", "zh": "刪除中..."});
    const overwriteLabel = useMultilang({
        "en": "warning: the post has changed while you were editing. saving will overwrite the changes.",
        "zh": "注意: 您正在編輯的文章已經被修改，若按更新將覆蓋修改。"
    })
    const pullLabel = useMultilang({"en": "update to latest version", "zh": "獲取最新版本"});
    const [deleteLabel, deleteTrigger] = useConfirm(deleteDefaultLabel, deleteConfirmationLabel, deletePendingLabel, async ()=>{
        // console.log(id)
        if (id === undefined) {
            throw new Error("ID undefined")
        }
        await VaporAPI.deletePost(id)
        navigate("/dashboard")
    })
    // console.log(buffer)
    return (
        // Return table with inputs for title, description, and public
        <RoundedContainer className="relative">
            <EditorSceneOverlay value={buffer.data} setValue={(value) => setBuffer({...buffer, data: value})} hidden={!editor3dMode}/>
            <EmbeddedTabs position="top" options={languages} activeOption={activeLanguage} onUpdate={setActiveLanguage} className="h-16"/>
            <div className="px-8 py-8 flex flex-col gap-4 grow">
                {overwriteWarning ? 
                <div className="flex flex-row">
                    <div className="font-bold text-yellow-400">{overwriteLabel}</div>
                    <MagicButton solid className="ml-auto" onClick={()=>{pull()}}>{pullLabel}</MagicButton>
                </div> : null}
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
                            <td>{publicLabel}</td>
                            <td>
                                <Input typeName="boolean" value={buffer.public} setValue={(value) => setBuffer({...buffer, public: value})} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <Condition condition={post?.role === "editor" || post?.role === "owner"}>
                <EmbeddedRow position="bottom" className="h-16">
                    <EmbeddedButton className="basis-3/4" onClick={push} disabled={!changed}>{saveLabel}</EmbeddedButton>
                    <EmbeddedButton className="basis-1/4 border-l" backgroundColor={[209, 54, 70]} onClick={deleteTrigger}>{deleteLabel}</EmbeddedButton>
                </EmbeddedRow>
            </Condition>
        </RoundedContainer>
    )
}