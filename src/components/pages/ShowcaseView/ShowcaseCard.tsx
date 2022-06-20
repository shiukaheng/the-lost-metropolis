import MagicDiv from "../../utilities/MagicDiv";
import { Fragment } from "react";
import { useNavigate } from 'react-router-dom';
import MagicButton from "../../utilities/MagicButton";
import { Instance } from "../../../../api/utility_types";
import { Roled } from "../../../../api/implementation_types/Role";
import { Post } from "../../../../api/types/Post";
import { getSponsorImageURL, useMultiLang, useMultiLangObject } from "../../../utilities";
import { Sponsor } from "../../../../api/types/Sponsor";
import { twMerge } from "tailwind-merge";
import { ControlTips, ControlTipsInner } from "../View/ControlTips";

function ShowcaseContentCard({post}: {post: Instance<Roled<Post>>}) {
    const navigate = useNavigate();
    return ( 
        <div className={"w-full h-full flex flex-col page-margins md:pb-4"}>
            <div className="flex flex-row mb-4 gap-2 md:gap-4 justify-between md:justify-start pt-[72px] md:pt-0">
                <MagicDiv className="text-2xl md:text-4xl font-serif font-bold" languageSpecificChildren={post.data.title}/>
                <MagicButton className="h-8 md:h-10" onClick={()=>{navigate(`/view/${post.id}`)}} languageSpecificChildren={{en: "explore", zh: "探索"}}/>
            </div>
            <MagicDiv className="font-serif max-w-xl" languageSpecificChildren={post.data.description}/>
            <div className="grow"/>
            <div className="flex flex-col md:flex-row md:flex-wrap gap-2 md:gap-4">
                {
                    post.data.sponsors.map(sponsorInstance => <SponsorDisplay key={sponsorInstance.id} sponsorInstance={sponsorInstance} postInstance={post}/>)
                }
            </div>
            {/* Add sponsors here */}
        </div>
    );
}

function SponsorDisplay({sponsorInstance, postInstance}: {
    sponsorInstance: Instance<Sponsor>,
    postInstance: Instance<Post>
}) {
    const labels = useMultiLangObject({
        "name": sponsorInstance.data.name,
        "title": sponsorInstance.data.title,
        "description": sponsorInstance.data.description || {en: "", zh: ""}
    })
    const imageAssetURL = getSponsorImageURL(postInstance, sponsorInstance)
    const link = sponsorInstance.data.link
    // const description = useMultiLang(sponsorInstance.data.description)
    const classList: string[] = []
    if (link) {
        classList.push("cursor-pointer")
    }
    return (
        <div className="min-w-fit min-h-fit">
            <div className="pb-2 font-extrabold">{labels["title"]}</div>
            {
                imageAssetURL ?
                <img className={twMerge("h-12 min-w-fit", ...classList)} src={imageAssetURL} onClick={
                    ()=>{
                        if (link) {
                            window.open(link)
                        }
                    }
                }/> :
                <div className="text-xl">{labels["name"]}</div>
            }
        </div>
    )
}

export default ShowcaseContentCard