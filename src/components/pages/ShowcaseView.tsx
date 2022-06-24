import ShowcaseContentCard from './ShowcaseView/ShowcaseCard';
import { useState, useContext, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import {ArrowLeftIcon, ArrowRightIcon} from '@heroicons/react/outline';
import SwipeableViews from 'react-swipeable-views';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { defaultTheme, ThemeContext } from '../App';
import { formatRGBCSS, mergeThemes, removeThemeTransition, useFilteredPosts, useIsLoggedIn, useMultiLang, usePostsFilter, useTheme } from '../../utilities';
import { ContentContext, hidePosts } from '../providers/ContentProvider';
import LoadingScreen from '../utilities/LoadingScreen';
import MagicDiv from '../utilities/MagicDiv';
import { themeSchema } from '../../../api/types/Theme';
import MagicIcon from '../utilities/MagicIcon';
import { AuthContext } from '../admin/AuthProvider';
import { Keypress } from '../utilities/keyboardControls/Keypress';

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
    const swipeLabel = useMultiLang({
        en: 'swipe',
        zh: '滑動'
    })
    const navigate = useNavigate();

    // Initializing activeID state (this is the thing that actually gets read by subcomponents)
    // If no posts, activeID will be null
    const [activeID, setActiveID] = useState<string | null>(null)

    // OK. This is the logic for the swipeable view. DON'T get confused. There are a lot of similar variables here.
    // activeID: This is the ID of the post being displayed. All the subcomponents will use this to determine what post to display.
    // activeIndex: This the the index of the post being displayed, and it is calculated from activeID via useMemo.
    // id: This is the ID of the post that is being navigated to. This will be the first to be updated when the user navigates to a new post.

    // TASK: We need to link these together.
    // To prevent loops and unnecessary complexity, the only thing we will actually manipulate is the "id" variable.
    // The other variables will be updated by the useEffect / useMemo hooks.

    // Redirecting to the default post if no post is specified. Replace so user doesn't get into a loop when they backtrack.
    useEffect(()=>{
        if (id === undefined) {
            navigate('/browse/' + displayPosts[0].id, { replace: true })
        }
    }, [id])

    // Active ID: Inferred from the URL
    useEffect(() => {
        if (id && allPosts.find(post => post.id === id)) {
            setActiveID(id)
        } else {
            setActiveID(null)
        }
    }, [id])

    // Inferring the activeIndex from the activeID:
    const activeIndex: number | null = useMemo(()=>{
        // console.log(allPosts, displayPosts)
        // const displayIndex = displayPosts.findIndex(post => post.id === activeID)
        // const allIndex = allPosts.findIndex(post => post.id === activeID)
        // console.log(activeID, displayIndex, allIndex)
        if (activeID === null) {
            return null
        }
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
    }, [activeID, allPosts, displayPosts])

    // Also, a convenience activeIndex setter, but actually uses navigate to navigate to the post.
    const setActiveIndex = useCallback((index: number) => {
        navigate(`/browse/${displayPosts[index].id}`)
    }, [setActiveID, displayPosts])

    // Dealing with unlisted posts:
    // When a post is unlisted the following happens:
    // the id will be of a value not in the displayPosts array
    // the activeID will follow
    // but the activeIndex will be null
    // So, to simplify rendering logic, we create a unlisted variable which is normally null, but if the activeID is not in the displayPosts array, it will be set to the post with the activeID.
    const unlisted = useMemo(()=>{
        if (activeID && activeIndex === null) {
            return allPosts.find(post => post.id === activeID)
        } else {
            return null
        }
    }, [activeID, activeIndex, allPosts])

    const nextPost = useCallback(
        (displayPosts && displayPosts.length > 0) ? () => {
            const proposedIndex = (activeIndex + 1) % displayPosts.length;
            setActiveIndex(proposedIndex);
        } : ()=>{}
    , [activeIndex, displayPosts, setActiveIndex])

    const previousPost = useCallback(
        (displayPosts && displayPosts.length > 0) ? () => {
            const proposedIndex = (activeIndex - 1 + displayPosts.length) % displayPosts.length;
            setActiveIndex(proposedIndex);
        } : ()=>{}
    , [activeIndex, displayPosts, setActiveIndex])

    return (
        <div className="w-full h-full relative">
            {/* Keyboard shortcuts */}
            <Keypress keyName="ArrowLeft" onDown={previousPost}/>
            <Keypress keyName="ArrowRight" onDown={nextPost}/>
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
                    <div className="flex-row gap-2 justify-between flex items-center px-8 pb-8 pt-4 md:px-0 md:pb-20 md:pr-20">
                        <MagicIcon IconComponent={ArrowLeftIcon} clickable fillCurrent className="h-5" onClick={previousPost}/>
                        <div className="flex flex-row gap-2" style={{ color: formatRGBCSS(theme.foregroundColor), transition: `color ${theme.transitionDuration}s` }}>
                            <div className='inline md:hidden'>
                                {swipeLabel}
                            </div>
                            <div className='inline md:hidden'>
                                ——
                            </div>
                            <div className="font-serif font-bold select-none">{activeIndex !== null ? activeIndex + 1 : "- "}/{displayPosts && displayPosts.length > 0 ? displayPosts.length : " -"}</div>
                        </div>
                        {/* <button className="border-black border px-4 rounded-3xl md:hover:opacity-50 transition-opacity duration-500 font-serif font-bold text-s md:text-xl h-8 md:h-9">show all</button> */}
                        <MagicIcon IconComponent={ArrowRightIcon} clickable fillCurrent className="h-5" onClick={nextPost}/>
                    </div>
                }
            </div>
            <div className="w-full h-full"></div>
        </div>
    );
}
