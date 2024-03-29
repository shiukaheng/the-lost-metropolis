import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { NonXRComponents, useMultiLang, usePost } from '../../utilities';
import MagicButton from '../utilities/MagicButton';
import MagicDiv from '../utilities/MagicDiv';
import { Viewer } from '../viewer/Viewer';
import {Fade} from 'react-reveal';
import DOMControls from '../utilities/controls/DOMControls';
import { RootState } from "@react-three/fiber";
import { Fragment, useContext, useRef } from 'react';
import { ThreeExtractor } from '../utilities/ThreeExtractor';
import { useSupportedXRModes } from '../utilities/useRequestXR';
import { ReactComponent as VR } from './View/VR.svg';
import { ReactComponent as AR } from './View/AR.svg';
import MagicIcon from '../utilities/MagicIcon';
import { XRRequesterRefExtractor } from '../viewer/ViewportCanvas';
import { useMediaQuery } from 'react-responsive';
import { ViewerContext } from '../viewer/ViewerContext';
import { XRControls } from '../utilities/controls/XRControls';
import { ControlTips } from './View/ControlTips';
import { defaultTheme, ThemeContext } from '../App';

function XRButtons({supportedXRModes, xrRequesterGetterRef}) {
    const supportAR = supportedXRModes && supportedXRModes.includes("immersive-ar")
    const supportVR = supportedXRModes && supportedXRModes.includes("immersive-vr")
    return (
        <Fragment>
            {supportAR &&
                <MagicButton solid className='pointer-events-auto' onClick={(e)=>{
                    e.stopPropagation()
                    requestXR(xrRequesterGetterRef, "immersive-ar")
                }}>
                    <MagicIcon fillCurrent invertColors IconComponent={AR}/>
                </MagicButton>
            }
            {supportVR &&
                <MagicButton solid className='pointer-events-auto' onClick={(e)=>{
                    e.stopPropagation()
                    requestXR(xrRequesterGetterRef, "immersive-vr")
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
    const xrRequesterGetterRef = useRef<null | XRRequesterGetter>(null)
    const supportedXRModes = useSupportedXRModes()
    const md = useMediaQuery({ query: '(min-width: 768px)' })
    if (post === null) {
        navigate("/")
        return null
    }
    // console.log(defaultTheme)
    return (
        // <ThemeContext.Provider value={{theme: defaultTheme, setTheme: (t)=>{}}}>
        <div className='absolute w-full h-full'>
            <Viewer post={post} className="absolute w-full h-full">
                <DOMControls force={post.configuration.flySpeed} friction={2}/>
                <ThreeExtractor threeRef={threeStateRef}/>
                <XRRequesterRefExtractor requesterRefGetterRef={xrRequesterGetterRef}/>
            </Viewer>
            <Fade>
                <div className="absolute w-full h-full p-8 md:p-20 pointer-events-none flex flex-col gap-4">
                    <div className="flex flex-row place-content-between gap-4">
                        <MagicDiv className='text-2xl md:text-4xl font-black'>{title}</MagicDiv>
                        <div className="ml-auto flex flex-row gap-4">
                            {md && <XRButtons xrRequesterGetterRef={xrRequesterGetterRef} supportedXRModes={supportedXRModes}/>}
                            <MagicButton className='pointer-events-auto' onClick={(e)=>{e.stopPropagation(); navigate(`/browse/${id}`);}} languageSpecificChildren={{"en": "back", "zh": "返回"}}/>
                        </div>
                    </div>
                    {!md && 
                        <div className="flex flex-row h-12 gap-4">
                            <XRButtons xrRequesterGetterRef={xrRequesterGetterRef} supportedXRModes={supportedXRModes}/>
                        </div>
                    }
                    <ControlTips className='mt-auto max-w-[520px]'/>
                </div>
            </Fade>
        </div>
        // </ThemeContext.Provider>
    );
}

function requestXR(xrRequesterGetterRef, mode) {
    if (xrRequesterGetterRef.current) {
        xrRequesterGetterRef.current().current(mode)
    }
}

export default View;