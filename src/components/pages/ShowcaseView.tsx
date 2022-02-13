import ShowcaseContentCard from './ShowcaseView/ShowcaseCard';
import { useState, useContext } from 'react';
import {ArrowLeftIcon, ArrowRightIcon} from '@heroicons/react/outline';
import SwipeableViews from 'react-swipeable-views';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../App';
import { formatRGBCSS } from '../../utilities';
import { ContentContext } from '../providers/ContentProvider';
import MagicDiv from '../utilities/MagicDiv';
import GenericPage from '../utilities/GenericPage';
import { animated, config, useTransition } from 'react-spring';

function ShowcaseView() {
    const {posts} = useContext(ContentContext);
    const {theme} = useContext(ThemeContext);
    const { id } = useParams();
    const navigate = useNavigate();

    // If id is not null, match the id to the content array and setActiveIndex to the index of the content array
    const [activeID, setActiveID] = useState((!!posts && !!id && posts.length > 0) ? id ? posts.findIndex(content => content.id === id) : posts[0]?.id || null : null);
    const activeIndex = (activeID === null) ? null : posts.findIndex(post => post.id === activeID);
    const setActiveIndex = (index) => {
        setActiveID(posts[index].id);
        navigate(`/browse/${posts[index].id}`);
    }

    const transitions = useTransition((posts === null || posts.length === 0), {
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
        delay: 200,
        config: config.gentle,
        exitBeforeEnter: true
    })

    const AnimatedGenericPage = animated(GenericPage)
    const AnimatedShowcasePanel = animated(ShowcasePanel)

    return (
        transitions(
            ({opacity}, item) => (
                item
                ?
                <AnimatedGenericPage style={{opacity}}>
                    <div>Oops.</div>
                </AnimatedGenericPage>
                :
                <AnimatedShowcasePanel style={{opacity}} activeIndex={activeIndex} setActiveIndex={setActiveIndex} posts={posts} theme={theme}/>
            )
        )
    )
}

export default ShowcaseView;

function ShowcasePanel({activeIndex, setActiveIndex, posts, theme, style}) {
    return <div className="flex flex-col h-full w-full justify-between" style={style}>
        <div className="h-full w-full relative overflow-hidden">
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
        </div>
        {/* Navigating between different scans.. Todo swipe left and right for mobile. Hidden left and right arrows. Can use same animation for desktop. */}
        <div className="flex-row gap-2 justify-between hidden md:flex items-center md:pb-20 md:pr-20">
            <ArrowLeftIcon className="h-5 cursor-pointer hover:opacity-50 transition-opacity duration-500" onClick={() => {
                var proposedIndex = (activeIndex - 1) % posts.length;
                if (proposedIndex < 0) {
                    proposedIndex = posts.length - 1;
                }
                // updateUrl(proposedIndex)
                setActiveIndex(proposedIndex);
            } } style={{
                color: formatRGBCSS(theme.foregroundColor),
                transition: `color ${theme.transitionDuration}s`
            }}></ArrowLeftIcon>
            <div className="flex flex-row gap-2" style={{ color: formatRGBCSS(theme.foregroundColor), transition: `color ${theme.transitionDuration}s` }}>
                <div className="font-serif font-bold select-none">{activeIndex + 1}/{posts.length}</div>
            </div>
            {/* <button className="border-black border px-4 rounded-full md:hover:opacity-50 transition-opacity duration-500 font-serif font-bold text-s md:text-xl h-8 md:h-9">show all</button> */}
            <ArrowRightIcon className="h-5 cursor-pointer hover:opacity-50 transition-opacity duration-500" onClick={() => {
                const proposedIndex = (activeIndex + 1) % posts.length;
                // updateUrl(proposedIndex)
                setActiveIndex(proposedIndex);
            } } style={{
                color: formatRGBCSS(theme.foregroundColor),
                transition: `color ${theme.transitionDuration}s`
            }}></ArrowRightIcon>
        </div>
    </div>;
}
