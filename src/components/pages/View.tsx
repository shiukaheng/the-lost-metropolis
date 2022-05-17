import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useMultiLang, usePost } from '../../utilities';
import MagicButton from '../utilities/MagicButton';
import MagicDiv from '../utilities/MagicDiv';
import { Viewer } from '../viewer/Viewer';
import {Fade} from 'react-reveal';
import GameControls from '../utilities/GameControls';

function View({ ...props}) {
    const { id } = useParams();
    const [post, _] = usePost(id || null)
    const navigate = useNavigate();
    const title = useMultiLang(post?.title)
    if (post === null) {
        navigate("/")
        return null
    }
    return (
        <div className='absolute w-full h-full'>
            <Viewer post={post} className="absolute w-full h-full">
                <GameControls force={10} friction={0.06}/>
            </Viewer>
            <Fade>
                <div className="absolute w-full h-full p-8 md:p-20 pointer-events-none">
                    <div className="flex flex-row place-content-between h-12">
                        <MagicDiv className='text-3xl md:text-4xl font-black'>{title}</MagicDiv>
                        <MagicButton className='ml-auto pointer-events-auto' onClick={(e)=>{e.stopPropagation(); navigate(`/browse/${id}`);}} languageSpecificChildren={{"en": "back", "zh": "返回"}}>
                        </MagicButton>
                    </div>
                </div>
            </Fade>
        </div>
    );
}

export default View;