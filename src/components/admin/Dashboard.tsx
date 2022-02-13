import { useContext, useState } from "react"
import { useNavigate } from "react-router-dom"
import tw from "tailwind-styled-components"
import { SettingsContext } from "../App"
import EditorInput from "../editor/ui_elements/EditorInput"
import { ContentContext } from "../providers/ContentProvider"
import GenericPage from "../utilities/GenericPage"
import { Input } from "../utilities/Input"
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

// Todo: Handle loading state when API hasn't fetched content yet

const StyledRow = tw.tr`border-b border-t border-current md:hover:opacity-50 transition-opacity duration-500 cursor-pointer table-row text-ellipsis`
const StyledCell = tw.td`text-left font-serif md:text-lg font-semibold pt-2 pb-6 table-cell`

function PostList() {
    const [searchTerm, setSearchTerm] = useState("")
    const navigate = useNavigate()
    const {settings} = useContext(SettingsContext)
    const {editablePosts} = useContext(ContentContext)
    const placeholder = {
        "en": "search",
        "zh": "搜尋"
    }
    const posts = []
    return (
        <div className="flex flex-col gap-4">
            <div>
                <input type="text" value={searchTerm} placeholder={placeholder[settings.lang]} onChange={(e) => setSearchTerm(e.target.value)} className="w-full h-12 bg-transparent border rounded-3xl px-5 text-xl font-bold focus:outline-none"/>
            </div>
            <table className="w-full">
                <tbody>
                    {
                        editablePosts.filter(post => matchSearch(post, searchTerm)).map((post, index) => (
                            <StyledRow key={index} onClick={()=>{navigate(`/edit/${post.id}`)}}>
                                <StyledCell>{index}</StyledCell>
                                <StyledCell>{post.title[settings.lang]}</StyledCell>
                                <StyledCell>{post.description[settings.lang]}</StyledCell>
                                <StyledCell>{post.time_posted}</StyledCell>
                            </StyledRow>
                        ))
                    }
                </tbody>
            </table>
        </div>
    )
}

function matchSearch(post, searchTerm) {
    // Searches whether the post's title or description has search term as a substring, simultaneously search for all languages
    return (
        Object.entries(post.title).some(([lang, title]) => title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        Object.entries(post.description).some(([lang, description]) => description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
}

function Post() {

}

export default function Dashboard() {
    return (
        <GenericPage className="flex flex-col gap-4 md:gap-8">
            <DashboardHeader/>
            {/* <PostList/> */}
            <PostList/>
        </GenericPage>
    )
}