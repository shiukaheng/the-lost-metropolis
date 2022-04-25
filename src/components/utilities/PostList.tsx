import tw from "tailwind-styled-components"
import { useState, useContext } from "react"
import { SettingsContext } from "../App"
import MagicButton from "./MagicButton"
import { useNavigate } from "react-router-dom"
import { Condition } from "../../utilities"
import { Post, postSchema } from "../../../api/types/Post"
import { Roled } from "../../../api/implementation_types/Role"
import { Instance } from "../../../api/utility_types"
import VaporAPI from "../../api_client/api"
import { auth } from "../../firebase-config.js"

const StyledRow = tw.tr`border-b border-t border-current md:hover:opacity-50 transition-opacity duration-500 cursor-pointer table-row text-ellipsis`
const StyledHeaderRow = tw.tr`border-b border-current table-row text-ellipsis`
const StyledCell = tw.td`text-left font-serif md:text-lg font-semibold pt-2 pb-6 table-cell`
const StyledHeaderCell = tw.td`text-left font-serif md:text-lg font-bold pt-2 pb-2 table-cell`

export type ColumnMaker = (post: Instance<Roled<Post>>, index: number) => JSX.Element

interface PostListProps {
    posts: Instance<Roled<Post>>[]
    onPostClick?: (post: Instance<Roled<Post>>) => void
    columnMakers?: ColumnMaker[]
    createButton?: boolean
    headers?: string[]
}

function PostList({posts, onPostClick=(post)=>{}, columnMakers=[], createButton=false, headers=[]}: PostListProps) {
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
                <input type="text" value={searchTerm} placeholder={placeholder[settings.lang]} onChange={(e) => setSearchTerm(e.target.value)} className="w-full h-12 bg-transparent border border-current text-current rounded-3xl px-5 text-xl font-bold focus:outline-none placeholder-current placeholder-opacity-50"/>
                <Condition condition={createButton}>
                    <MagicButton solid languageSpecificChildren={
                    {"en": "+ create post", "zh": "+ 新增文章"}
                    } onClick={async ()=>{
                        const id: string = await VaporAPI.createPost(postSchema.validateSync({
                            owner: auth.currentUser!.uid,
                        }))
                        console.log("created post", id)
                        navigate(`/edit/${id}`)
                    }} className="ml-auto h-12 md:h-12"/>
                </Condition>
            </div>
            <table className="w-full">
                <tbody>
                    {
                        headers ?
                        (<StyledHeaderRow>
                            {
                                headers.map(column => (
                                    <StyledHeaderCell key={column}>
                                        {column}
                                    </StyledHeaderCell>
                                ))
                            }
                        </StyledHeaderRow>) : null
                    }
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

function matchSearch(post: Instance<Roled<Post>>, searchTerm: string) {
    // Searches whether the post's title or description has search term as a substring, simultaneously search for all languages
    return (
        Object.entries(post.data.title).some(([lang, title]) => title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        Object.entries(post.data.description).some(([lang, description]) => description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
}

export default PostList