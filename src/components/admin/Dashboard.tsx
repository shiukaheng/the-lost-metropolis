// Render table from content_array with labels content.name content.date_created

import tw from 'tailwind-styled-components';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { SettingsContext } from "../App";
import MagicDiv from '../utilities/MagicDiv';
import GenericPage from '../utilities/GenericPage';
import LoadingScreen from '../utilities/LoadingScreen';
import PostList from '../utilities/PostList';
import { ContentContext } from '../providers/ContentProvider';
import { AuthContext } from '../admin/AuthProvider';
import MagicIcon from '../utilities/MagicIcon';
import { EyeIcon, EyeOffIcon } from '@heroicons/react/outline';
import { useMultilang } from '../../utilities';

const StyledRow = tw.tr`border-b border-t border-current md:hover:opacity-50 transition-opacity duration-500 cursor-pointer table-row`
const StyledCell = tw.td`text-left font-serif md:text-lg font-semibold pt-2 pb-6 table-cell`

function Dashboard() {
    const navigate = useNavigate();
    const posts = useContext(ContentContext)
    const {settings} = useContext(SettingsContext)
    const {currentUser} = useContext(AuthContext)
    const roleDisplay = {
        "owner": useMultilang({"en": "owner", "zh": "擁有者"}),
        "editor": useMultilang({"en": "editor", "zh": "編輯者"}),
        "viewer": useMultilang({"en": "viewer", "zh": "閱讀者"}),
        "public": ""
    }
    const columnMakers = currentUser ?
    [
        (post, index) => index,
        (post, index) => (post.title[settings.lang]),
        (post, index) => new Date(post.createdAt).toLocaleDateString("en-UK"),
        (post, index) => roleDisplay[post.role],
        (post, index) => post.public ? <MagicIcon IconComponent={EyeIcon}/> : <MagicIcon IconComponent={EyeOffIcon}/>,
    ] :
    [
        (post, index) => index,
        (post, index) => (post.title[settings.lang]),
        (post, index) => new Date(post.createdAt).toLocaleDateString("en-UK"),
    ]
    return ( 
        <GenericPage className="flex flex-col gap-4 md:gap-8">
            {/* <DashboardHeader/> */}
            <LoadingScreen ready={posts!==null}>
                <PostList createButton posts={posts} onPostClick={(post)=>{navigate(`/edit/${post.id}`)}}
                columnMakers={columnMakers}/>
            </LoadingScreen>
        </GenericPage>
    );
}

export default Dashboard;
