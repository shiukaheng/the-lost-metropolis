import { SettingsContext } from "../App"
import { useContext } from "react"

function MultilangDiv({ languageSpecificChild, ...props }) {
    const Settings = useContext(SettingsContext)
    return (
        <div {...props}>
            {languageSpecificChild[Settings.lang]}
        </div>
    );
}

export default MultilangDiv;