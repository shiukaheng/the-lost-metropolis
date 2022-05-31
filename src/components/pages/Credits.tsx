import GenericPage from "../utilities/GenericPage";

export function Person({name="", photoUrl="", link}) {
    // Display person as a circular profile picture, with an optional link. Name will be displayed on hover.
    return (
        <div className="w-8 h-8 overflow-clip rounded-full">
            <a href={link} target="_blank" rel="noopener noreferrer">
                <img src={photoUrl} className="w-full h-full rounded-full" alt={name}/>
            </a>
        </div>
    )
}

export function Credits({}) {
    return (
        <GenericPage className="relative w-full h-full homepage">
            <div>
                this project is only possible thanks to individual contributions from the following people —
            </div>
            <div>
                {

                }
            </div>
        </GenericPage>
    )
}