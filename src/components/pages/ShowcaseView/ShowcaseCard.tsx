import MagicDiv from "../../utilities/MagicDiv";
import { Fragment } from "react";
import { useNavigate } from 'react-router-dom';
import MagicButton from "../../utilities/MagicButton";

function ShowcaseContentCard({post}) {
    const navigate = useNavigate();
    return ( 
        <div className={"w-full h-full flex flex-col page-margins"}>
            <div className="flex flex-row mb-4 gap-2 md:gap-4 justify-between md:justify-start pt-[72px] md:pt-0">
                <MagicDiv className="text-2xl md:text-4xl font-serif font-bold" languageSpecificChildren={post.title}/>
                <MagicButton className="h-8 md:h-10" onClick={()=>{navigate(`/view/${post.id}`)}} languageSpecificChildren={{en: "explore", zh: "探索"}}/>
            </div>
            <MagicDiv className="font-serif max-w-xl" languageSpecificChildren={post.description}/>
        </div>
    );
}

export default ShowcaseContentCard