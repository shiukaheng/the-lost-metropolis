import { useState } from "react"
import { useNavigate } from "react-router-dom"
import EditorInput from "../editor/ui_elements/EditorInput"
import GenericPage from "../utilities/GenericPage"
import MagicButton from "../utilities/MagicButton"
import MagicDiv from "../utilities/MagicDiv"

function DescriptionEditorPage() {

}

function ContentEditorPage() {

}

function CreatePost() {

}

function EditPost() {
    
}

function DashboardHeader() {
    const navigate = useNavigate()
    return (
        <div className="flex flex-row">
            <MagicDiv languageSpecificChildren={
                {"en": "content dashboard", "zh": "內容一覽"}
            } className="text-5xl font-black"/>
            <MagicButton languageSpecificChildren={
                {"en": "+ create post", "zh": "+ 新增文章"}
            } className="ml-auto"/>
        </div>
    )
}

// function PostListSearchBar({searchTerm, setSearchTerm}) {
//     return (
        
//     )
// }

// function PostList() {
//     const [searchTerm, setSearchTerm] = useState("")
//     const posts = []
//     return (
//         <
//     )

// }

function Post() {

}

export default function Dashboard() {
    return (
        <GenericPage className="flex flex-col gap-4 md:gap-8">
            <DashboardHeader/>
            {/* <PostList/> */}
            <div>This is where the post list will be</div>
        </GenericPage>
    )
}