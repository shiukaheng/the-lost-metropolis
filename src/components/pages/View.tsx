import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import MagicButton from '../utilities/MagicButton';
import MagicDiv from '../utilities/MagicDiv';
import { Viewer, ViewerProps } from '../viewer/Viewer';
import {Fade} from 'react-reveal';
import DOMControls from '../utilities/controls/DOMControls';
import { RootState, useLoader } from "@react-three/fiber";
import { Fragment, useEffect, useRef } from 'react';
import { ThreeExtractor } from '../utilities/ThreeExtractor';
import { useSupportedXRModes } from '../utilities/useRequestXR';
import { ReactComponent as VR } from './View/VR.svg';
import { ReactComponent as AR } from './View/AR.svg';
import MagicIcon from '../utilities/MagicIcon';
import { XRRequesterRefExtractor, useProjectorInfo } from '../viewer/ViewportCanvas';
import { useMediaQuery } from 'react-responsive';
import { ControlTips } from './View/ControlTips';
import { PerspectiveCamera } from 'three';

function XRButtons({supportedXRModes, xrRequesterGetterRef}) {
    const supportAR = supportedXRModes && supportedXRModes.includes("immersive-ar")
    const supportVR = supportedXRModes && supportedXRModes.includes("immersive-vr")
    return (
        <Fragment>
            <MagicButton solid className='pointer-events-auto' onClick={(e)=>{
                e.stopPropagation()
                requestXR(xrRequesterGetterRef, "immersive-ar")
            }}>
                Click here to start VR experience
            </MagicButton>
        </Fragment>
    )
}

function View({children, ...props}: ViewerProps) {
    const threeStateRef = useRef<null | RootState>(null) 
    const xrRequesterGetterRef = useRef<null | XRRequesterGetter>(null)
    const supportedXRModes = useSupportedXRModes()
    const md = useMediaQuery({ query: '(min-width: 768px)' })
    // console.log(defaultTheme)
    return (
        <div className='absolute w-full h-full'>
            <Viewer className="absolute w-full h-full">
                <DOMControls/>
                <ThreeExtractor threeRef={threeStateRef}/>
                <XRRequesterRefExtractor requesterRefGetterRef={xrRequesterGetterRef}/>
                {children}
            </Viewer>
            <Fade>
                <div className="absolute w-full h-full p-8 md:p-20 pointer-events-none flex flex-col gap-4">
                    <ControlTips className='mt-auto max-w-[520px]'/>
                </div>
            </Fade>
        </div>
    );
}

export function VRView({children, ...props}: ViewerProps) {
    const threeStateRef = useRef<null | RootState>(null) 
    const xrRequesterGetterRef = useRef<null | XRRequesterGetter>(null)
    const supportedXRModes = useSupportedXRModes()
    const md = useMediaQuery({ query: '(min-width: 768px)' })
    // console.log(defaultTheme)
    return (
        <div className='absolute w-full h-full'>
            <Viewer className="absolute w-full h-full">
                <DOMControls/>
                <ThreeExtractor threeRef={threeStateRef}/>
                <XRRequesterRefExtractor requesterRefGetterRef={xrRequesterGetterRef}/>
                {children}
            </Viewer>
            <Fade>
                <div className="absolute w-full h-full p-8 pointer-events-none">
                    <XRButtons xrRequesterGetterRef={xrRequesterGetterRef} supportedXRModes={["immersive-ar"]}/>
                </div>
            </Fade>
        </div>
    );
}

function useAnimationFrame(callback) {
    const callbackRef = useRef(callback);
  
    useEffect(() => {
      callbackRef.current = callback;
    }, [callback]);
  
    useEffect(() => {
      let animationFrameId; // Declare a variable to store the ID of the animation frame
  
      function loop() {
        callbackRef.current();
        animationFrameId = requestAnimationFrame(loop); // Store the ID of the frame request
      }
  
      requestAnimationFrame(loop);
  
      return () => cancelAnimationFrame(animationFrameId); // Cancel the frame using the stored ID
    }, []);
}

declare global {
    interface Window {
        projectorID: string | undefined;
    }
}

export function ProjectorView({children, ...props}: ViewerProps) {
    const xrRequesterGetterRef = useRef<null | XRRequesterGetter>(null)
    const [isProjector, projectorID] = useProjectorInfo()
    const threeStateRef = useRef<null | RootState>(null)
    useEffect(()=>{
        window.projectorID = projectorID
    }, [projectorID])
    return (
        <div className='absolute w-full h-full'>
            <Viewer className="absolute w-full h-full" {...props}>
                <ThreeExtractor threeRef={threeStateRef}/>
                <XRRequesterRefExtractor requesterRefGetterRef={xrRequesterGetterRef}/>
                {children}
            </Viewer>
        </div>
    );
}


function requestXR(xrRequesterGetterRef, mode) {
    if (xrRequesterGetterRef.current) {
        xrRequesterGetterRef.current().current(mode)
    }
}

export default View;