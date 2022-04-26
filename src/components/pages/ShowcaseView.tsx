import ShowcaseContentCard from './ShowcaseView/ShowcaseCard';
import { useState, useContext, useEffect, useLayoutEffect } from 'react';
import {ArrowLeftIcon, ArrowRightIcon} from '@heroicons/react/outline';
import SwipeableViews from 'react-swipeable-views';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { defaultTheme, ThemeContext } from '../App';
import { formatRGBCSS, mergeThemes, removeThemeTransition, useTheme } from '../../utilities';
import { ContentContext } from '../providers/ContentProvider';
import LoadingScreen from '../utilities/LoadingScreen';
import MagicDiv from '../utilities/MagicDiv';
import { themeSchema } from '../../../api/types/Theme';

function ShowcaseView() {
    const posts = useContext(ContentContext);
    return (
        <LoadingScreen ready={posts!==null} loadingDivClassname="page-margins">
            <ShowcasePanel/>
        </LoadingScreen>
    );
}

export default ShowcaseView;

function ShowcasePanel() {
    const posts = useContext(ContentContext);
    const { theme } = useContext(ThemeContext);
    const { id } = useParams();
    const navigate = useNavigate();
    const { setTheme, changesRef } = useContext(ThemeContext)
    // If no specified ID, show the first post. If no posts, set activeID and activeIndex to null
    const [activeID, setActiveID] = useState(id || (posts && posts.length > 0 ? posts[0].id : null));
    // If has activeID, find the index of the post with that ID, otherwise set to null
    const activeIndex: number | null = (posts && posts.length > 0) ? posts.findIndex(post => post.id === activeID) : null;
    const setActiveIndex = (index) => {
        setActiveID(posts[index].id);
        navigate(`/browse/${posts[index].id}`);
    }

    // Hotfix for applying theme when no id is specified, when url based theme detection doesn't work
    useEffect(()=>{ // Needs to be put in useEffect because it sets state in the context
        const postTheme = posts?.find(post => post.id === activeID)?.data?.theme || defaultTheme;
        const fixedPostTheme = mergeThemes(defaultTheme, postTheme);
        if (id === undefined) {
            if (changesRef.current <= 2) {
                setTheme(removeThemeTransition(fixedPostTheme));
            } else {
                setTheme(fixedPostTheme);
            }
        }
    }, [])
    
    // useEffect(()=>{
    //     const theme = posts && posts.find(post => post.id === activeID)?.data.theme
    //     if (themeSchema.isValidSync(theme)) {
    //         setOverrideTheme(theme);
    //     }
    // }, [activeID])
    // useTheme(overrideTheme);
    // TODO: Fix the case of potentially null activeIndex
    return (
        <div className="w-full h-full relative">
            <div className="flex flex-col h-full w-full absolute justify-between">
                <div className="h-full w-full relative overflow-hidden">
                    { activeIndex === null ?
                        <div className="h-full w-full flex justify-center items-center md:pb-20 md:pr-20">
                            <MagicDiv className="text-5xl font-black">
                                No content available
                            </MagicDiv>
                        </div>
                        :
                        <SwipeableViews index={activeIndex} onChangeIndex={(index => { setActiveIndex(index); })} containerStyle={{
                            position: 'absolute',
                            height: '100%',
                            width: '100%'
                        }}>
                            {posts.map((post, key) => (
                                <div key={key} className="absolute w-full h-full overflow-y-auto">
                                    <ShowcaseContentCard post={post} />
                                </div>
                            ))}
                        </SwipeableViews>
                    }
                </div>
                {/* Navigating between different scans.. Todo swipe left and right for mobile. Hidden left and right arrows. Can use same animation for desktop. */}
                <div className="flex-row gap-2 justify-between hidden md:flex items-center md:pb-20 md:pr-20">
                    <ArrowLeftIcon className="h-5 cursor-pointer hover:opacity-50 transition-opacity duration-500" onClick={ (posts && posts.length > 0) ? () => {
                        var proposedIndex = (activeIndex - 1) % posts.length;
                        if (proposedIndex < 0) {
                            proposedIndex = posts.length - 1;
                        }
                        // updateUrl(proposedIndex)
                        setActiveIndex(proposedIndex);
                    } : ()=>{} } style={{
                        color: formatRGBCSS(theme.foregroundColor),
                        transition: `color ${theme.transitionDuration}s opacity 500ms` // Hacky..
                    }}></ArrowLeftIcon>
                    <div className="flex flex-row gap-2" style={{ color: formatRGBCSS(theme.foregroundColor), transition: `color ${theme.transitionDuration}s` }}>
                        <div className="font-serif font-bold select-none">{activeIndex !== null ? activeIndex + 1 : "- "}/{posts && posts.length > 0 ? posts.length : " -"}</div>
                    </div>
                    {/* <button className="border-black border px-4 rounded-3xl md:hover:opacity-50 transition-opacity duration-500 font-serif font-bold text-s md:text-xl h-8 md:h-9">show all</button> */}
                    <ArrowRightIcon className="h-5 cursor-pointer hover:opacity-50 transition-opacity duration-500" onClick={ (posts && posts.length > 0) ? () => {
                        const proposedIndex = (activeIndex + 1) % posts.length;
                        // updateUrl(proposedIndex)
                        setActiveIndex(proposedIndex);
                    } : ()=>{} } style={{
                        color: formatRGBCSS(theme.foregroundColor),
                        transition: `color ${theme.transitionDuration}s opacity 500ms`
                    }}></ArrowRightIcon>
                </div>
            </div>
            <div className="w-full h-full"></div>
        </div>
    );
}
