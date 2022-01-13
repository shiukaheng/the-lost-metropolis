import MagicDiv from "./MagicDiv";

function ShowcaseContentCard({content}) {
    return ( 
        <div className={"flex flex-col page-margins md:pb-0"}>
            <div className="h-72 md:h-0"></div>
            <div className="flex flex-row mb-4 justify-between md:justify-start">
                <MagicDiv className="text-2xl md:text-4xl font-serif font-bold mr-4" languageSpecificChildren={content.title}/>
                <MagicDiv mergeTransitions={true} className="secondary-button" onClick={()=>{window.open(content.link)}} languageSpecificChildren={{en: "explore", zh: "探索"}}/>
            </div>
            <MagicDiv className="font-serif max-w-xl" languageSpecificChildren={content.description}/>
        </div>
    );
}

export default ShowcaseContentCard