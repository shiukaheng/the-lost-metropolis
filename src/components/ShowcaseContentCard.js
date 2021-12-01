function ShowcaseContentCard({content}) {
    return ( 
        <div className="flex flex-col h-full mt-72 md:mt-0 flex-grow">
            <div className="flex flex-row mb-4 justify-between md:justify-start">
                <div className="text-2xl md:text-4xl font-serif font-bold mr-4">{content.title_english}</div>
                <button className="border-black border px-4 rounded-full hover:opacity-50 transition-opacity duration-500 font-serif font-bold text-s md:text-xl h-8 md:h-9">explore</button>
            </div>
            <div className="font-serif">
                {content.description_english}
            </div>
        </div>
    );
}

export default ShowcaseContentCard