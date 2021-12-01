import ShowcaseContentCard from './ShowcaseContentCard';
import { useState } from 'react';
import {ArrowLeftIcon, ArrowRightIcon} from '@heroicons/react/outline';
import SwipeableViews from 'react-swipeable-views';

const content_array = [
    {
        "title_english": "The State Theatre Reborn",
        "title_chinese": "皇都再世",
        "description_english": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Quasi, quisquam.",
        "description_chinese": ""
    },
    {
        "title_english": "The Salon",
        "title_chinese": "皇都再世 2",
        "description_english": " 2 Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Quasi, quisquam. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Quasi, quisquam. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Quasi, quisquam. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Quasi, quisquam. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Quasi, quisquam. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Quasi, quisquam.",
        "description_chinese": ""
    }
]

function ShowcaseContent() {
    const [activeIndex, setActiveIndex] = useState(0);
    return (
        <div className="flex flex-col h-full w-full justify-between">
            <div className="h-full w-full relative overflow-hidden">
                <SwipeableViews index={activeIndex} onChangeIndex={setActiveIndex} containerStyle={{
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
            <div className="flex-row gap-2 justify-between hidden md:flex">
                <ArrowLeftIcon className="h-5 cursor-pointer hover:opacity-50 transition-opacity duration-500" onClick={()=>(
                    setActiveIndex((i) => (i + 1) % content_array.length))
                    }></ArrowLeftIcon>
                <ArrowRightIcon className="h-5 cursor-pointer hover:opacity-50 transition-opacity duration-500" onClick={()=>(
                    setActiveIndex((i) => {
                        var proposedIndex = (i - 1) % content_array.length
                        if (proposedIndex < 0) {
                            proposedIndex = content_array.length - 1
                        }
                        return proposedIndex
                    }))
                    }></ArrowRightIcon>
            </div>
        </div>
    );
}

export default ShowcaseContent;