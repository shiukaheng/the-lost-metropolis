import tw from "tailwind-styled-components"
import { useState, useContext } from "react"
import MagicIcon from "./MagicIcon"
import { SettingsContext } from "../App"
import { EyeIcon, EyeOffIcon } from "@heroicons/react/outline"
import MagicButton from "./MagicButton"
import { useNavigate } from "react-router-dom"
import { createPost } from "../../api"
import { AuthContext } from "../admin/AuthProvider"
import { Condition } from "../../utilities"

const StyledRow = tw.tr`border-b border-t border-current md:hover:opacity-50 transition-opacity duration-500 cursor-pointer table-row text-ellipsis`
const StyledCell = tw.td`text-left font-serif md:text-lg font-semibold pt-2 pb-6 table-cell`

function PostList({posts, onPostClick=(post)=>{}, columnMakers=[], createButton=false}) {
    const [searchTerm, setSearchTerm] = useState("")
    const {settings} = useContext(SettingsContext)
    const placeholder = {
        "en": "search",
        "zh": "搜尋"
    }
    const navigate = useNavigate()
    const postList = (searchTerm.length > 0) ? posts.filter(post => matchSearch(post, searchTerm)) : posts
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-4">
                <input type="text" value={searchTerm} placeholder={placeholder[settings.lang]} onChange={(e) => setSearchTerm(e.target.value)} className="w-full h-12 bg-transparent border rounded-3xl px-5 text-xl font-bold focus:outline-none placeholder-white placeholder-opacity-50"/>
                <Condition condition={createButton}>
                    <MagicButton solid languageSpecificChildren={
                    {"en": "+ create post", "zh": "+ 新增文章"}
                    } onClick={async ()=>{
                        const id = await createPost()
                        navigate(`/edit/${id}`)
                    }} className="ml-auto h-12 md:h-12"/>
                </Condition>
            </div>
            <table className="w-full">
                <tbody>
                    {
                        postList.map((post, postIndex) => (
                            <StyledRow key={postIndex} onClick={()=>{onPostClick(post)}}>
                                {
                                    columnMakers.map((columnMaker, index) => (
                                        <StyledCell key={index}>
                                            {columnMaker(post, postIndex)}
                                        </StyledCell>
                                    ))
                                }
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

export default PostList