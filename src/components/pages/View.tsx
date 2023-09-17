import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import MagicButton from '../utilities/MagicButton';
import MagicDiv from '../utilities/MagicDiv';
import { Viewer, ViewerProps } from '../viewer/Viewer';
import {Fade} from 'react-reveal';
import DOMControls from '../utilities/controls/DOMControls';
import { RootState, useLoader } from "@react-three/fiber";
import { Fragment, useRef } from 'react';
import { ThreeExtractor } from '../utilities/ThreeExtractor';
import { useSupportedXRModes } from '../utilities/useRequestXR';
import { ReactComponent as VR } from './View/VR.svg';
import { ReactComponent as AR } from './View/AR.svg';
import MagicIcon from '../utilities/MagicIcon';
import { XRRequesterRefExtractor } from '../viewer/ViewportCanvas';
import { useMediaQuery } from 'react-responsive';
import { ControlTips } from './View/ControlTips';

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


function View({children, ...props}: ViewerProps) {
    // const { id } = useParams();
    // const navigate = useNavigate();
    const threeStateRef = useRef<null | RootState>(null) 
    const xrRequesterGetterRef = useRef<null | XRRequesterGetter>(null)
    const supportedXRModes = useSupportedXRModes()
    const md = useMediaQuery({ query: '(min-width: 768px)' })
    // console.log(defaultTheme)
    return (
        // <ThemeContext.Provider value={{theme: defaultTheme, setTheme: (t)=>{}}}>
        <div className='absolute w-full h-full'>
            <Viewer className="absolute w-full h-full" {...props}>
                <DOMControls force={10} friction={2}/>
                <ThreeExtractor threeRef={threeStateRef}/>
                <XRRequesterRefExtractor requesterRefGetterRef={xrRequesterGetterRef}/>
                {children}
            </Viewer>
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