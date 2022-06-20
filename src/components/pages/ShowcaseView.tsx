import ShowcaseContentCard from './ShowcaseView/ShowcaseCard';
import { useState, useContext, useEffect, useLayoutEffect } from 'react';
import {ArrowLeftIcon, ArrowRightIcon} from '@heroicons/react/outline';
import SwipeableViews from 'react-swipeable-views';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { defaultTheme, ThemeContext } from '../App';
import { formatRGBCSS, mergeThemes, removeThemeTransition, useTheme } from '../../utilities';
import { ContentContext, hidePosts } from '../providers/ContentProvider';
import LoadingScreen from '../utilities/LoadingScreen';
import MagicDiv from '../utilities/MagicDiv';
import { themeSchema } from '../../../api/types/Theme';
import MagicIcon from '../utilities/MagicIcon';

function ShowcaseView() {
    const posts = hidePosts(useContext(ContentContext));
    return (
        <LoadingScreen ready={posts!==null} loadingDivClassname="page-margins">
            <ShowcasePanel/>
        </LoadingScreen>
    );
}

export default ShowcaseView;

function ShowcasePanel() {
    const posts = useContext(ContentContext)
    const listedPosts = hidePosts(posts);
    const { theme } = useContext(ThemeContext);
    const { id } = useParams();
    const navigate = useNavigate();
    // const { setTheme, changesRef } = useContext(ThemeContext)
    // If no specified ID, show the first post. If no posts, set activeID and activeIndex to null
    const [activeID, setActiveID] = useState(id || (listedPosts && listedPosts.length > 0 ? listedPosts[0].id : null));
    // Make activeID to update again if changed later
    useEffect(()=>{
        setActiveID(id || (listedPosts && listedPosts.length > 0 ? listedPosts[0].id : null))
    }, [id])
    // If has activeID, find the index of the post with that ID, otherwise set to null
    const activeIndex: number | null = (listedPosts && listedPosts.length > 0) ? listedPosts.findIndex(post => post.id === activeID) : null;
    const setActiveIndex = (index) => {
        setActiveID(listedPosts[index].id);
        navigate(`/browse/${listedPosts[index].id}`);
    }
    // If the requested post is not in listedPost but is in posts this means its unlisted.
    // activeIndex will be null but activeID will be the ID of the requested post
    // We will create a seperate state for this unlisted post. Normally it will be null, but if it is not null, we will create a standalone view for it
    const [unlisted, setUnlisted] = useState(null);
    useEffect(()=>{
        if (activeIndex === null && activeID !== null) {
            const unlistedPost = posts.find(post => post.id === activeID);
            if (unlistedPost) {
                setUnlisted(unlistedPost);
                return
            }
        }
        setUnlisted(null);
    }, [activeIndex, activeID, posts])
    
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
                    {
                        unlisted ?
                        <div>
                            <ShowcaseContentCard post={unlisted}/>
                        </div>
                        :
                        ( activeIndex === null ?
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
                                {listedPosts.map((post, key) => (
                                    <div key={key} className="absolute w-full h-full overflow-y-auto">
                                        <ShowcaseContentCard post={post} />
                                    </div>
                                ))}
                            </SwipeableViews>
                        )
                    }
                </div>
                {/* Navigating between different scans.. Todo swipe left and right for mobile. Hidden left and right arrows. Can use same animation for desktop. */}
                {
                    unlisted ?
                    null :
                    <div className="flex-row gap-2 justify-between hidden md:flex items-center md:pb-20 md:pr-20">
                        <MagicIcon IconComponent={ArrowLeftIcon} clickable fillCurrent className="h-5" onClick={ (listedPosts && listedPosts.length > 0) ? () => {
                            var proposedIndex = (activeIndex - 1) % listedPosts.length;
                            if (proposedIndex < 0) {
                                proposedIndex = listedPosts.length - 1;
                            }
                            // updateUrl(proposedIndex)
                            setActiveIndex(proposedIndex);
                        } : ()=>{} }/>
                        <div className="flex flex-row gap-2" style={{ color: formatRGBCSS(theme.foregroundColor), transition: `color ${theme.transitionDuration}s` }}>
                            <div className="font-serif font-bold select-none">{activeIndex !== null ? activeIndex + 1 : "- "}/{listedPosts && listedPosts.length > 0 ? listedPosts.length : " -"}</div>
                        </div>
                        {/* <button className="border-black border px-4 rounded-3xl md:hover:opacity-50 transition-opacity duration-500 font-serif font-bold text-s md:text-xl h-8 md:h-9">show all</button> */}
                        <MagicIcon IconComponent={ArrowRightIcon} clickable fillCurrent className="h-5" onClick={ (listedPosts && listedPosts.length > 0) ? () => {
                            const proposedIndex = (activeIndex + 1) % listedPosts.length;
                            setActiveIndex(proposedIndex);
                        } : ()=>{} }/>
                    </div>
                }
            </div>
            <div className="w-full h-full"></div>
        </div>
    );
}
