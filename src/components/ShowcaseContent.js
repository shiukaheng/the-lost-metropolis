import ShowcaseContentCard from './ShowcaseContentCard';
import { useState } from 'react';
import {ArrowLeftIcon, ArrowRightIcon} from '@heroicons/react/outline';
import SwipeableViews from 'react-swipeable-views';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';

function ShowcaseContent({content_array}) {
    const { id } = useParams();
    const navigate = useNavigate();
    // If id is not null, match the id to the content array and setActiveIndex to the index of the content array
    const [activeIndex, setActiveIndex] = useState(id ? content_array.findIndex(content => content.id === id) : 0);
    function updateUrl() {
        navigate(`/browse/${content_array[activeIndex].id}`);
    }

    return (
        <div className="relative w-full h-full">
            <div className="absolute flex flex-col h-full w-full justify-between">
                <div className="h-full w-full relative overflow-hidden">
                    <SwipeableViews index={activeIndex} onChangeIndex={(index => {setActiveIndex(index); updateUrl()})} containerStyle={{
                        position: 'absolute',
                        height: '100%',
                        width: '100%'
                    }}>
                        {content_array.map((content, key) => (
                            <div key={key} className="absolute w-full h-full overflow-y-auto">
                                <ShowcaseContentCard content={content}/>
                            </div>
                        ))}
                    </SwipeableViews>
                </div>
                {/* Navigating between different scans.. Todo swipe left and right for mobile. Hidden left and right arrows. Can use same animation for desktop. */}
                <div className="flex-row gap-2 justify-between hidden md:flex items-center">
                    <ArrowLeftIcon className="h-5 cursor-pointer hover:opacity-50 transition-opacity duration-500" onClick={()=>{
                        setActiveIndex((i) => (i + 1) % content_array.length);
                        updateUrl();}
                        }></ArrowLeftIcon>
                    <div className="flex flex-row gap-2">
                        <div className="font-serif font-bold">{activeIndex + 1}/{content_array.length}</div>
                    </div>
                    {/* <button className="border-black border px-4 rounded-full md:hover:opacity-50 transition-opacity duration-500 font-serif font-bold text-s md:text-xl h-8 md:h-9">show all</button> */}
                    <ArrowRightIcon className="h-5 cursor-pointer hover:opacity-50 transition-opacity duration-500" onClick={()=>{
                        setActiveIndex((i) => {
                            var proposedIndex = (i - 1) % content_array.length
                            if (proposedIndex < 0) {
                                proposedIndex = content_array.length - 1
                            }
                            return proposedIndex
                        })
                        updateUrl();}
                        }></ArrowRightIcon>
                </div>
            </div> 
        </div>
    );
}

export default ShowcaseContent;