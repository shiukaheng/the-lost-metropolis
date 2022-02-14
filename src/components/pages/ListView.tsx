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

const StyledRow = tw.tr`border-b border-t border-current md:hover:opacity-50 transition-opacity duration-500 cursor-pointer table-row`
const StyledCell = tw.td`text-left font-serif md:text-lg font-semibold pt-2 pb-6 table-cell`

function ListView() {
    const navigate = useNavigate();
    const {posts} = useContext(ContentContext)
    const {settings} = useContext(SettingsContext)
    return ( 
        <GenericPage className="flex flex-col gap-4 md:gap-8">
            {/* <DashboardHeader/> */}
            <LoadingScreen ready={posts!==null}>
                <PostList posts={posts} onPostClick={(post)=>{navigate(`/browse/${post.id}`)}}
                columnMakers={[
                    (post, index) => index,
                    (post, index) => (post.title[settings.lang]),
                    (post, index) => post.createdAt.toLocaleDateString("en-UK"),
                ]}/>
            </LoadingScreen>
        </GenericPage>
    );
}

export default ListView;
