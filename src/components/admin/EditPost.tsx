import { useNavigate, useParams } from "react-router-dom";
import { Condition, Switcher, useBufferedPost, useChooseFile, useConfirm, useMultiLang, usePost, useTheme } from "../../utilities";
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
import { Theme } from "../../../api/types/Theme";
import { Post } from "../../../api/types/Post";
import { defaultTheme } from "react-select";
import { defaultTheme as vaporDefaultTheme } from "../App"
import { SingleFileAssetUploader } from "./editPost/SingleFileAssetUploader";

function applyTheme(buffer:Partial<Post>, newTheme:Partial<Theme>): Partial<Post> {
    return {
        ...buffer,
        theme: {
            ...buffer.theme,
            ...newTheme
        } as Theme
    }
}
 
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

function EditorSceneOverlay({hidden}) {
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
    const [buffer, setBuffer, post, push, pull, changed, overwriteWarning] = useBufferedPost(id, ["title", "description", "public", "theme"]);
    const titleLabel = useMultiLang({"en": "title", "zh": "標題"});
    const descriptionLabel = useMultiLang({"en": "description", "zh": "描述"});
    const publicLabel = useMultiLang({"en": "public", "zh": "公開"});
    const saveLabel = useMultiLang({"en": "update", "zh": "更新"});
    const [activeLanguage, setActiveLanguage] = useState(languages[0]);
    const deleteDefaultLabel = useMultiLang({"en": "delete", "zh": "刪除"});
    const deleteConfirmationLabel = useMultiLang({"en": "click to confirm", "zh": "點擊確認"});
    const deletePendingLabel = useMultiLang({"en": "deleting...", "zh": "刪除中..."});
    const overwriteLabel = useMultiLang({
        "en": "warning: the post has changed while you were editing. saving will overwrite the changes.",
        "zh": "注意: 您正在編輯的文章已經被修改，若按更新將覆蓋修改。"
    })
    const enableBgColorLabel = useMultiLang({
        "en": "enable background color",
        "zh": "啟用背景顏色"
    })
    const enableFgColorLabel = useMultiLang({
        "en": "enable foreground color",
        "zh": "啟用前景顏色"
    })
    const bgColorLabel = useMultiLang({
        "en": "background color",
        "zh": "背景顏色"
    })
    const fgColorLabel = useMultiLang({
        "en": "foreground color",
        "zh": "前景顏色"
    })
    const bgImageLabel = useMultiLang({
        "en": "background image",
        "zh": "背景圖片"
    })
    const sponsorsLabel = useMultiLang({
        "en": "sponsors",
        "zh": "贊助商"
    })
    const pullLabel = useMultiLang({"en": "update to latest version", "zh": "獲取最新版本"});
    const [deleteLabel, deleteTrigger] = useConfirm(deleteDefaultLabel, deleteConfirmationLabel, deletePendingLabel, async ()=>{
        // console.log(id)
        if (id === undefined) {
            throw new Error("ID undefined")
        }
        await VaporAPI.deletePost(id)
        navigate("/dashboard")
    })
    const backgroundImageAsset = post?.assets?.find(asset => (asset.data.metadata.tags.includes("background-image")))
    // useTheme(buffer.theme)
    return (
        // Return table with inputs for title, description, and public
        <Condition condition={id && buffer}>
            <RoundedContainer className="relative">
                <EditorSceneOverlay hidden={!editor3dMode}/>
                <EmbeddedTabs position="top" options={languages} activeOption={activeLanguage} onUpdate={setActiveLanguage} className="h-16"/>
                <div className="overflow-y-scroll flex flex-col grow">
                    <div className="px-8 py-8 flex flex-col gap-4">
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
                                <tr>
                                    <td>{bgColorLabel}</td>
                                    <td>
                                        <OptionalThemeColor buffer={buffer} setBuffer={setBuffer} themePropName={"backgroundColor"}/>
                                    </td>
                                </tr>
                                <tr>
                                    <td>{fgColorLabel}</td>
                                    <td>
                                        <OptionalThemeColor buffer={buffer} setBuffer={setBuffer} themePropName={"foregroundColor"}/>
                                    </td>
                                </tr>
                                <tr>
                                    <td>{bgImageLabel}</td>
                                    <td>
                                        <Switcher condition={backgroundImageAsset !== undefined}
                                        trueChild={
                                            <MagicButton languageSpecificChildren={{
                                                "en": "remove background image",
                                                "zh": "移除背景圖片"
                                            }} onClick={()=>{
                                                if (backgroundImageAsset !== undefined) {
                                                    VaporAPI.deleteAsset(id, backgroundImageAsset.id)
                                                }
                                            }}/>
                                        }
                                        falseChild={
                                            <SingleFileAssetUploader extensions={["jpg", "jpeg", "png", "webp"]} tags={["background-image"]} metadata={(file: File) => {
                                                return {
                                                    sourceAssetType: "Image",
                                                    targetAssetType: "Image",
                                                    name: file.name.split(".")[0],
                                                    assetData: {
                                                        fileName: file.name,
                                                    }
                                                }
                                            }} postID={id}/>
                                        }
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>{sponsorsLabel}</td>
                                    <td>
                                        
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <Condition condition={post?.role === "editor" || post?.role === "owner"}>
                    <EmbeddedRow position="bottom" className="h-16">
                        <EmbeddedButton className="basis-3/4" onClick={push} disabled={!changed}>{saveLabel}</EmbeddedButton>
                        <EmbeddedButton className="basis-1/4 border-l" backgroundColor={[209, 54, 70]} onClick={deleteTrigger}>{deleteLabel}</EmbeddedButton>
                    </EmbeddedRow>
                </Condition>
            </RoundedContainer>
        </Condition>
    )
}

function OptionalThemeColor({buffer, setBuffer, themePropName}) {
    if (!(buffer.theme)) {
        return null
    }
    return <div className="flex flex-row gap-2">
        <Input className="grow-0" typeName="boolean" value={buffer.theme[themePropName] !== null} setValue={(value) => {
            if (value) {
                setBuffer(applyTheme(buffer, { [themePropName]: vaporDefaultTheme[themePropName] }));
            } else {
                setBuffer(applyTheme(buffer, { [themePropName]: null }));
            }
        } } />
        {(buffer.theme[themePropName] !== null) && (
            <Input data={{linear: false}} className="grow-0" typeName="color" value={buffer.theme[themePropName].map(x => x/255)} setValue={(value) => setBuffer(applyTheme(buffer, { [themePropName]: value.map(x => Math.round(x*255)) }))} />
        )}
    </div>;
}
