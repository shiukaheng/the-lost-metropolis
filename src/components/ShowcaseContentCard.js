import MultilangDiv from "./MultilangDiv";
import { SettingsContext } from "../App";
import { useContext } from "react";

function ShowcaseContentCard({content}) {
    const Settings = useContext(SettingsContext);
    return ( 
        <div className={"flex flex-col page-margins md:pb-0"}>
            <div className="h-72 md:h-0"></div>
            <div className="flex flex-row mb-4 justify-between md:justify-start">
                <div className="text-2xl md:text-4xl font-serif font-bold mr-4">
                    {content.title[Settings.lang]}
                </div>
                <MultilangDiv className="secondary-button" languageSpecificChild={{
                    en: "explore",
                    zh: "探索"
                }}/>
            </div>
            <div className="font-serif max-w-xl">
                {content.description[Settings.lang]}
            </div>
        </div>
    );
}

export default ShowcaseContentCard