import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useMultiLang, usePost } from '../../utilities';
import MagicButton from '../utilities/MagicButton';
import MagicDiv from '../utilities/MagicDiv';
import { Viewer } from '../viewer/Viewer';
import {Fade} from 'react-reveal';
import GameControls from '../utilities/GameControls';
import { RootState } from "@react-three/fiber";
import { Fragment, useRef } from 'react';
import { ThreeExtractor } from '../utilities/ThreeExtractor';
import { useRequestXR, useSupportedXRModes } from '../utilities/useRequestXR';
import { WebGLRenderer } from 'three';
import { ReactComponent as VR } from './View/VR.svg';
import { ReactComponent as AR } from './View/AR.svg';
import MagicIcon from '../utilities/MagicIcon';

function XRButtons({threeStateRef}: {
    threeStateRef: React.MutableRefObject<null | RootState>
}) {
    const supportedXRModes = useSupportedXRModes()
    const supportAR = supportedXRModes && supportedXRModes.includes("immersive-ar")
    const supportVR = supportedXRModes && supportedXRModes.includes("immersive-vr")
    const {requestSession, inSession} = useRequestXR()
    return (
        <Fragment>
            {supportAR &&
                <MagicButton solid className='pointer-events-auto' onClick={(e)=>{
                    e.stopPropagation()
                    requestSession((threeStateRef.current?.gl as WebGLRenderer), "immersive-ar")
                }}>
                    <MagicIcon fillCurrent invertColors IconComponent={AR}/>
                </MagicButton>
            }
            {supportVR &&
                <MagicButton solid className='pointer-events-auto' onClick={(e)=>{
                    e.stopPropagation()
                    requestSession((threeStateRef.current?.gl as WebGLRenderer), "immersive-vr")
                }}>
                    <MagicIcon fillCurrent invertColors IconComponent={VR}/>
                </MagicButton>
            }
        </Fragment>
    )
}

function View({ ...props}) {
    const { id } = useParams();
    const [post, _] = usePost(id || null)
    const navigate = useNavigate();
    const title = useMultiLang(post?.title)
    const threeStateRef = useRef<null | RootState>(null) 
    if (post === null) {
        navigate("/")
        return null
    }
    return (
        <div className='absolute w-full h-full'>
            <Viewer post={post} className="absolute w-full h-full">
                <GameControls force={10} friction={2}/>
                <ThreeExtractor threeRef={threeStateRef}/>
            </Viewer>
            <Fade>
                <div className="absolute w-full h-full p-8 md:p-20 pointer-events-none">
                    <div className="flex flex-row place-content-between h-12 gap-4">
                        <MagicDiv className='text-3xl md:text-4xl font-black'>{title}</MagicDiv>
                        <div className="ml-auto flex flex-row gap-4">
                            <XRButtons threeStateRef={threeStateRef}/>
                            <MagicButton className='pointer-events-auto' onClick={(e)=>{e.stopPropagation(); navigate(`/browse/${id}`);}} languageSpecificChildren={{"en": "back", "zh": "返回"}}/>
                        </div>
                    </div>
                </div>
            </Fade>
        </div>
    );
}

export default View;