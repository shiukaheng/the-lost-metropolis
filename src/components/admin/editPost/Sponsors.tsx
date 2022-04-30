import { useState } from "react";
import { boolean } from "yup";
import { Post } from "../../../../api/types/Post";
import { Sponsor } from "../../../../api/types/Sponsor";
import { Instance } from "../../../../api/utility_types";
import { Switcher, useMultilang } from "../../../utilities";
import MagicIcon from "../../utilities/MagicIcon";

export function Sponsors({buffer, setBuffer, post}: {
    buffer: Partial<Post>,
    setBuffer: (buffer: Partial<Post>) => void,
    post: Post,
}) {
    throw new Error("Not implemented");
    return (
        <div className="flex flex-col gap-4">
            {
                post.sponsors.map((sponsorInstance: Instance<Sponsor>) => <SponsorComponent key={sponsorInstance.id} sponsor={sponsorInstance.data} buffer={buffer} setBuffer={setBuffer} />)
            }
        </div>
    )
}

function SponsorComponent({sponsor, buffer, setBuffer, startWithEditMode=false}) {
    throw new Error("Not implemented!");
    const [editMode, setEditMode] = useState<boolean>(startWithEditMode);
    // TODO: Create component given sponsor, buffer and setBuffer, can display, reorder, edit, and delete a sponsor within a post.
    return (
        <Switcher condition={editMode}
        trueChild={
            <SponsorComponentEdit buffer={buffer} setBuffer={setBuffer} sponsor={sponsor} setEditMode={setEditMode}/>
        }
        falseChild={
            <SponsorComponentView buffer={buffer} setBuffer={setBuffer} sponsor={sponsor} setEditMode={setEditMode}/>
        }/>
    )
}

function SponsorComponentEdit({sponsor, buffer, setBuffer, setEditMode}) { // TODO: Finish!
    throw new Error("Not implemented!");
    return (
        // Do asset upload for image within this component, and if the sponsor gets deleted, delete the asset too. Tag image asset with sponsor-<id>.
    )
}

function SponsorComponentView({sponsor, buffer, setBuffer, setEditMode}) { // TODO: Finish!
    throw new Error("Not implemented!")
    const name = useMultilang(sponsor.name);
    return (
        // Horizontal div entry of sponsor.data.name, then a up button, a down button, and then a edit button that will toggle edit mode.
        <div className="flex flex-row gap-2">
            <div>{name}</div>
            <div className="grow"/>
            {/* <MagicIcon/>  */}
            {/* <MagicIcon/> */}
            {/* <MagicIcon onClick={() => setEditMode(true)}/> */}
        </div>
    )
}