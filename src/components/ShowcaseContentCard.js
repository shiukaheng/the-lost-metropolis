function ShowcaseContentCard({content}) {
    return ( 
        <div className={"flex flex-col page-margins md:pb-0"}>
            <div className="h-72 md:h-0"></div>
            <div className="flex flex-row mb-4 justify-between md:justify-start">
                <div className="text-2xl md:text-4xl font-serif font-bold mr-4">{content.title_english}</div>
                <button className="secondary-button">explore</button>
            </div>
            <div className="font-serif max-w-xl">
                {content.description_english}
            </div>
        </div>
    );
}

export default ShowcaseContentCard