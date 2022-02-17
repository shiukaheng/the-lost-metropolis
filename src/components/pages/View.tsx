import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useMultilang, usePost } from '../../utilities';
import MagicButton from '../utilities/MagicButton';
import MagicDiv from '../utilities/MagicDiv';
import { Viewer, ViewerManager } from '../viewer/Viewer';
import Viewport from '../viewer/Viewport';
import {Fade} from 'react-reveal';
import { EmbeddedButton, EmbeddedCell, EmbeddedRow, RoundedContainer } from '../utilities/EmbeddedUI';
function View({ ...props}) {
    const { id } = useParams();
    const [post, _] = usePost(id)
    const navigate = useNavigate();
    const title = useMultilang(post.title)
    return (
        <div className='absolute w-full h-full'>
            <Viewer post={post.data} className="absolute w-full h-full"/>
            <Fade>
                <div className="absolute w-full h-full p-8 pointer-events-none">
                    <div className="flex flex-row place-content-between h-12">
                        <MagicDiv className='text-3xl md:text-4xl font-black'>{title}</MagicDiv>
                        <MagicButton className='ml-auto pointer-events-auto' onClick={()=>{navigate(`/browse/${id}`)}} languageSpecificChildren={{"en": "back", "zh": "返回"}}>
                        </MagicButton>
                    </div>
                </div>
            </Fade>
        </div>
    );
}

export default View;