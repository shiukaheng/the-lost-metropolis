import MagicDiv from "../../utilities/MagicDiv";
import { Fragment } from "react";
import { useNavigate } from 'react-router-dom';
import MagicButton from "../../utilities/MagicButton";
import { Instance } from "../../../../api/utility_types";
import { Roled } from "../../../../api/implementation_types/Role";
import { Post } from "../../../../api/types/Post";

function ShowcaseContentCard({post}: {post: Instance<Roled<Post>>}) {
    const navigate = useNavigate();
    return ( 
        <div className={"w-full h-full flex flex-col page-margins md:pb-0"}>
            <div className="flex flex-row mb-4 gap-2 md:gap-4 justify-between md:justify-start pt-[72px] md:pt-0">
                <MagicDiv className="text-2xl md:text-4xl font-serif font-bold" languageSpecificChildren={post.data.title}/>
                <MagicButton className="h-8 md:h-10" onClick={()=>{navigate(`/view/${post.id}`)}} languageSpecificChildren={{en: "explore", zh: "探索"}}/>
            </div>
            <MagicDiv className="font-serif max-w-xl" languageSpecificChildren={post.data.description}/>
            <div className="grow"/>
            {/* Add sponsors here */}
        </div>
    );
}

export default ShowcaseContentCard