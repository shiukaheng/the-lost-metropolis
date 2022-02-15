import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { usePost } from '../../utilities';
import MagicButton from '../utilities/MagicButton';
import MagicDiv from '../utilities/MagicDiv';
import { Viewer, ViewerManager } from '../viewer/Viewer';
import Viewport from '../viewer/Viewport';
import {Fade} from 'react-reveal';
function View({ ...props}) {
    const { id } = useParams();
    const [post, _] = usePost(id)
    const navigate = useNavigate();
    return (
        <div className='absolute w-full h-full'>
            <Viewer post={post.data} className="absolute w-full h-full"/>
            <Fade>
                <div className="absolute w-full h-full md:p-8 pointer-events-none">
                    <div className="md:border rounded-3xl w-full h-full p-8">
                        <MagicDiv className="flex flex-row mb-4 justify-between md:justify-start">
                            <MagicDiv className="text-3xl md:text-5xl font-bold" autoColor={false} languageSpecificChildren={post.title}/>
                            <MagicButton className="h-9 md:h-12 ml-auto pointer-events-auto" onClick={(e)=>{e.stopPropagation(); navigate(`/browse/${id}`)}} languageSpecificChildren={{en: "back", zh: "返回"}}/>
                        </MagicDiv>
                    </div>
                </div>
            </Fade>
        </div>
    );
}

export default View;