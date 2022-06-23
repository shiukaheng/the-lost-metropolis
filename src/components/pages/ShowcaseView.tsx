import ShowcaseContentCard from './ShowcaseView/ShowcaseCard';
import { useState, useContext, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import {ArrowLeftIcon, ArrowRightIcon} from '@heroicons/react/outline';
import SwipeableViews from 'react-swipeable-views';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { defaultTheme, ThemeContext } from '../App';
import { formatRGBCSS, mergeThemes, removeThemeTransition, useFilteredPosts, useIsLoggedIn, usePostsFilter, useTheme } from '../../utilities';
import { ContentContext, hidePosts } from '../providers/ContentProvider';
import LoadingScreen from '../utilities/LoadingScreen';
import MagicDiv from '../utilities/MagicDiv';
import { themeSchema } from '../../../api/types/Theme';
import MagicIcon from '../utilities/MagicIcon';
import { AuthContext } from '../admin/AuthProvider';

function ShowcaseView() {
    const posts = useFilteredPosts()
    return (
        <LoadingScreen ready={posts!==null} loadingDivClassname="page-margins">
            <ShowcasePanel/>
        </LoadingScreen>
    );
}

export default ShowcaseView;

function ShowcasePanel() {
    // Get prerequisite information
    const allPosts = useContext(ContentContext)
    const listedPosts = usePostsFilter(allPosts)
    const isLoggedIn = useIsLoggedIn();
    const displayPosts = useMemo(() => {
        if (isLoggedIn) {
            return allPosts
        } else {
            return listedPosts
        }
    }, [listedPosts, allPosts]) // We don't include isLoggedIn in the dependency, because allPosts / listedPosts will update anyway. Somehow, if isLoggedIn is included, isLoggedIn updates before allPosts / listedPosts, putting us in a weird state.
    const { theme } = useContext(ThemeContext);
    const { id } = useParams();
    const navigate = useNavigate();

    // Initializing activeID state (this is the thing that actually gets read by subcomponents)
    // If no posts, activeID will be null
    const [activeID, setActiveID] = useState(id || (displayPosts && displayPosts.length > 0 ? displayPosts[0].id : null)
    );
    // Making browser update if activeID changes.
    useEffect(()=>{
        if (id === undefined) {
            navigate(`/browse/${activeID}`, { replace: true });
        } else {
            if (id !== activeID) {
                navigate(`/browse/${activeID}`);
            }
        }
    }, [activeID])
    // Redirect user back to post if they press back
    useEffect(()=>{
        if ((activeID !== null) && (id === undefined)) {
            navigate(`/browse/${activeID}`, { replace: true });
        } else if (id === undefined && displayPosts && displayPosts.length > 0) {
            navigate(`/browse/${displayPosts[0].id}`, { replace: true });
        }
    }, [id])
    // Make activeID to update again if changed later
    useEffect(()=>{
        setActiveID(id || (displayPosts && displayPosts.length > 0 ? displayPosts[0].id : null))
    }, [id, displayPosts])

    // Calculating activeIndex from activeID
    const activeIndex: number | null = useMemo(()=>{
        const hasPostsToDisplay = displayPosts && displayPosts.length > 0;
        const newActiveIndex = hasPostsToDisplay ? displayPosts.findIndex(post => post.id === activeID) : null;
        if (hasPostsToDisplay) {
            if (newActiveIndex === -1) {
                // If the post is not found, check if it is unlisted
                const unlistedIndex = allPosts.findIndex(post => post.id === activeID);
                if (unlistedIndex !== -1) {
                    // If it is unlisted, set activeIndex to null
                    return null;
                } else {
                    // If it is not unlisted, set activeIndex to 0
                    return 0;
                }
            } else {
                return newActiveIndex;
            }
        } else {
            return null;
        }
    }, [activeID, displayPosts])

    // Create activeIndex setter by setting activeID
    const setActiveIndex = useCallback((index: number) => {
        setActiveID(displayPosts[index].id);
    }, [setActiveID, displayPosts])

    // If the requested post is not in listedPost but is in posts this means its unlisted.
    // activeIndex will be null but activeID will be the ID of the requested post
    // We will create a seperate state for this unlisted post. Normally it will be null, but if it is not null, we will create a standalone view for it
    const [unlisted, setUnlisted] = useState(null);
    useEffect(()=>{
        if (activeIndex === null && activeID !== null) {
            const unlistedPost = allPosts.find(post => post.id === activeID);
            if (unlistedPost) {
                setUnlisted(unlistedPost);
                return
            }
        }
        setUnlisted(null);
    }, [activeIndex, activeID, allPosts, setUnlisted])
    // TODO: Fix the case of potentially null activeIndex
    return (
        <div className="w-full h-full relative">
            <div className="flex flex-col h-full w-full absolute justify-between">
                <div className="h-full w-full relative overflow-hidden">
                    {
                        (!isLoggedIn && unlisted) ?
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
                                {displayPosts.map((post, key) => (
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
                        <MagicIcon IconComponent={ArrowLeftIcon} clickable fillCurrent className="h-5" onClick={ (displayPosts && displayPosts.length > 0) ? () => {
                            var proposedIndex = (activeIndex - 1) % displayPosts.length;
                            if (proposedIndex < 0) {
                                proposedIndex = displayPosts.length - 1;
                            }
                            // updateUrl(proposedIndex)
                            setActiveIndex(proposedIndex);
                        } : ()=>{} }/>
                        <div className="flex flex-row gap-2" style={{ color: formatRGBCSS(theme.foregroundColor), transition: `color ${theme.transitionDuration}s` }}>
                            <div className="font-serif font-bold select-none">{activeIndex !== null ? activeIndex + 1 : "- "}/{displayPosts && displayPosts.length > 0 ? displayPosts.length : " -"}</div>
                        </div>
                        {/* <button className="border-black border px-4 rounded-3xl md:hover:opacity-50 transition-opacity duration-500 font-serif font-bold text-s md:text-xl h-8 md:h-9">show all</button> */}
                        <MagicIcon IconComponent={ArrowRightIcon} clickable fillCurrent className="h-5" onClick={ (displayPosts && displayPosts.length > 0) ? () => {
                            const proposedIndex = (activeIndex + 1) % displayPosts.length;
                            setActiveIndex(proposedIndex);
                        } : ()=>{} }/>
                    </div>
                }
            </div>
            <div className="w-full h-full"></div>
        </div>
    );
}
