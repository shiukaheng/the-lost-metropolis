import { useContext, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ContentContext } from "../providers/ContentProvider"
import GenericPage from "../utilities/GenericPage"
import LoadingScreen from "../utilities/LoadingScreen"
import MagicButton from "../utilities/MagicButton"
import MagicDiv from "../utilities/MagicDiv"
import { createEmptyPost } from "../../utilities"
import PostList from "../utilities/PostList"
import { SettingsContext } from "../App"
import MagicIcon from "../utilities/MagicIcon"
import { EyeIcon, EyeOffIcon } from "@heroicons/react/outline"

function DashboardHeader() {
    const navigate = useNavigate()
    return (
        <div className="flex flex-row">
            <MagicDiv languageSpecificChildren={
                {"en": "content dashboard", "zh": "內容一覽"}
            } className="text-5xl font-black"/>
            <MagicButton languageSpecificChildren={
                {"en": "+ create post", "zh": "+ 新增文章"}
            } onClick={async ()=>{
                const id = await createEmptyPost()
                navigate(`/edit/${id}`)
            }} className="ml-auto"/>
        </div>
    )
}

export default function Dashboard() {
    const {editablePosts} = useContext(ContentContext)
    const {settings} = useContext(SettingsContext)
    const navigate = useNavigate()
    return (
        <GenericPage className="flex flex-col gap-4 md:gap-8">
            <DashboardHeader/>
            <LoadingScreen ready={editablePosts!==null}>
                <PostList posts={editablePosts} onPostClick={(post)=>{navigate(`/edit/${post.id}`)}} columnMakers={[
                    (post, index) => index,
                    (post, index) => post.title[settings.lang],
                    (post, index) => post.createdAt.toLocaleDateString("en-UK"),
                    (post, index) => post.published ? <MagicIcon IconComponent={EyeIcon}/> : <MagicIcon IconComponent={EyeOffIcon}/>
                ]}/>
            </LoadingScreen>
        </GenericPage>
    )
}