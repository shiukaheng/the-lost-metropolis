import { Post } from "../../../../api/types/Post";
import { Sponsor } from "../../../../api/types/Sponsor";

function Sponsors({buffer, setBuffer, post}: {
    buffer: Partial<Post>,
    setBuffer: (buffer: Partial<Post>) => void,
    post: Post,
}) {
    return (
        <div className="flex flex-col gap-4">
            {
                post.sponsors.map((sponsor: Sponsor, index) => SponsorComponent({index, buffer, setBuffer}))
            }
            <div>
                
            </div>
        </div>
    )
}

function SponsorComponent({index, buffer, setBuffer}) {
    // TODO: Create component given index of sponsor, buffer and setBuffer, can display, reorder, and delete a sponsor within a post.
    return ()
}