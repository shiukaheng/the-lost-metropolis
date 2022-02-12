import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import MagicDiv from '../utilities/MagicDiv';

function Experience({content_array=[], ...props}) {
    const { id } = useParams();
    const navigate = useNavigate();
    const content = content_array.find(content => content.id === id);
    return (
        <div className='w-full h-full'>
            <div className="absolute w-full h-full p-8 md:p-20">
                <MagicDiv className="flex flex-row mb-4 justify-between md:justify-start">
                    <MagicDiv className="text-3xl md:text-4xl font-bold" autoColor={false} languageSpecificChildren={content.title}/>
                    <MagicDiv mergeTransitions={true} className="secondary-button ml-auto" onClick={()=>{navigate(`/browse/${id}`)}} languageSpecificChildren={{en: "back", zh: "返回"}}/>
                </MagicDiv>
            </div>
            {/* <div className="absolute w-full h-full">Placeholder for experience</div> */}
        </div>
    );
}

export default Experience;