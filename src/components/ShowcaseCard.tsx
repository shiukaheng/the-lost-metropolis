import MagicDiv from "./MagicDiv";
import { Fragment } from "react";
import { useNavigate } from 'react-router-dom';

function ShowcaseContentCard({content}) {
    const navigate = useNavigate();
    return ( 
        <Fragment>
            <div className={"flex flex-col page-margins md:pb-0"}>
                <div className="flex flex-row mb-4 justify-between md:justify-start pt-[72px] md:pt-0">
                    <MagicDiv className="text-2xl md:text-4xl font-serif font-bold mr-4" languageSpecificChildren={content.title}/>
                    <MagicDiv mergeTransitions={true} className="secondary-button" onClick={()=>{navigate(`/experience/${content.id}`)}} languageSpecificChildren={{en: "explore", zh: "探索"}}/>
                </div>
                <MagicDiv className="font-serif max-w-xl" languageSpecificChildren={content.description}/>
            </div>
        </Fragment>
    );
}

export default ShowcaseContentCard