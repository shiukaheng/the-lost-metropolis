import {v4 as uuidv4} from 'uuid';
import ShowcaseContentCard from './ShowcaseContentCard';
import { useState, useEffect } from 'react';
import {ArrowLeftIcon, ArrowRightIcon} from '@heroicons/react/outline';

const content_array = [
    {
        "id": uuidv4(),
        "title_english": "The State Theatre Reborn",
        "title_chinese": "皇都再世",
        "description_english": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Quasi, quisquam.",
        "description_chinese": ""
    },
    {
        "id": uuidv4(),
        "title_english": "The Salon",
        "title_chinese": "皇都再世 2",
        "description_english": " 2 Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Quasi, quisquam. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Quasi, quisquam. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Quasi, quisquam. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Quasi, quisquam. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Quasi, quisquam. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Quasi, quisquam.",
        "description_chinese": ""
    }
]

function ShowcaseContent() {
    const [activeIndex, setActiveIndex] = useState(0);

    // useEffect(() => {
    //     setTimeout(
    //         () =>
    //             setActiveIndex((i) => (i + 1) % content_array.length)
    //         , 10000
    //     );
    //     return () => {}
    // }, [activeIndex])

    return (
        <div className="w-full relative overflow-hidden flex flex-col flex-grow">
            {/* <div className="absolute w-full h-full flex flex-row justify-end place-items-end md:place-items-start">
                <button className="text-xl border border-black px-2 rounded-full h-9 w-9">List</button>
            </div> */}
            <ShowcaseContentCard content={content_array[activeIndex]}/>
            {/* Navigating between different scans.. Todo swipe left and right for mobile. Hidden left and right arrows. Can use same animation for desktop. */}
            <div className="flex flex-row gap-2 justify-between invisible md:visible">
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