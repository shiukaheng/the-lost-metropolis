// Render table from content_array with labels content.name content.date_created

import tw from 'tailwind-styled-components';
import { useNavigate } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { SettingsContext } from "../App";
import GenericPage from '../utilities/GenericPage';
import LoadingScreen from '../utilities/LoadingScreen';
import PostList, { ColumnMaker } from '../utilities/PostList';
import { ContentContext } from '../providers/ContentProvider';
import { AuthContext } from '../admin/AuthProvider';
import MagicIcon from '../utilities/MagicIcon';
import { EyeIcon, EyeOffIcon, LockClosedIcon } from '@heroicons/react/outline';
import { useMultiLang } from '../../utilities';

function Dashboard() {
    const navigate = useNavigate();
    const posts = useContext(ContentContext)
    const {settings} = useContext(SettingsContext)
    const {currentUser} = useContext(AuthContext)
    const roleDisplay = {
        "owner": useMultiLang({"en": "owner", "zh": "擁有者"}),
        "editor": useMultiLang({"en": "editor", "zh": "編輯者"}),
        "viewer": useMultiLang({"en": "viewer", "zh": "閱讀者"}),
        "public": ""
    }
    const columnMakers: ColumnMaker[] = currentUser ?
    [
        (post, index) => index,
        (post, index) => (post.data.title[settings.lang]),
        (post, index) => new Date(post.data.createdAt).toLocaleDateString("en-UK"),
        (post, index) => roleDisplay[post.data.role],
        (post, index) => post.data.public ? (post.data.listed ? <MagicIcon IconComponent={EyeIcon}/> : <MagicIcon IconComponent={EyeOffIcon}/>) : <MagicIcon IconComponent={LockClosedIcon}/>,
    ] :
    [
        (post, index) => index,
        (post, index) => (post.data.title[settings.lang]),
        (post, index) => new Date(post.data.createdAt).toLocaleDateString("en-UK"),
    ]
    useEffect(()=>{
        if (currentUser === null) {
            console.log(currentUser)
            navigate("/login")
        }
    }, [currentUser])
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
