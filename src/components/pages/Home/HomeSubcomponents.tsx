import MagicDiv from '../../utilities/MagicDiv';
import { useRefState } from '../../../utilities';
import { Fade } from "react-reveal";
import { useScroll, ScrollControlsState, Plane } from "@react-three/drei";
import { Children, cloneElement, Fragment, useContext, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ViewerContext } from '../../viewer/ViewerContext';
import useMediaQuery from 'react-hook-media-query';
import MagicIcon from '../../utilities/MagicIcon';
import { ReactComponent as InstagramIcon } from "./svgs/instagram.svg";
import MagicButton from '../../utilities/MagicButton';
import { useNavigate } from 'react-router-dom';
import { MultiLangObject } from '../../../../api/types/MultiLangObject';
import { twMerge } from 'tailwind-merge';
import { Group, MathUtils, MeshBasicMaterial } from 'three';
import { SearchIcon } from '@heroicons/react/outline';
import { ContentContext } from '../../providers/ContentProvider';

function RevealDiv({ predicate, children }: { predicate: (data: ScrollControlsState) => boolean; children: React.ReactNode; }) {
    const data = useScroll();
    const [revealedRef, revealed, setRevealed] = useRefState(false);
    useFrame(() => {
        if (predicate(data)) {
            revealedRef.current || setRevealed(true);
        } else {
            revealedRef.current && setRevealed(false);
        }
    });
    return (
        <Fade when={revealed}>
            {children}
        </Fade>
    );
}

export function ApplySettings() {
    const { setPotreePointBudget } = useContext(ViewerContext);
    useEffect(() => {
        if (setPotreePointBudget) {
            setPotreePointBudget(1e4);
        }
    }, [setPotreePointBudget]);
    return null;
}

export function FadeFilter({ pages = 1, threshold = 1.2, children, onFullyOpaque = () => { }, onNotFullyOpaque = () => { } }: { pages?: number; threshold?: number; children: React.ReactNode; onFullyOpaque?: () => void; onNotFullyOpaque?: () => void; }) {
    const data = useScroll();
    const divRef = useRef(null);
    const fullyOpaque = useRef(false);
    useFrame(() => {
        if (divRef.current) {
            divRef.current.style.opacity = data.range(0, threshold / pages) ** 2;
            if (divRef.current) {
                if (divRef.current.style.opacity === '1') {
                    fullyOpaque.current = true;
                    onFullyOpaque();
                }
                if (fullyOpaque.current && divRef.current.style.opacity !== '1') {
                    fullyOpaque.current = false;
                    onNotFullyOpaque();
                }
            }
        }
    });
    return (
        <div className={`w-full`} style={{
            height: (pages * 100).toString() + "%"
        }}>
            <div ref={divRef} className={`bg-black opacity-0 w-full`} style={{
                height: (pages * 100).toString() + "%"
            }} />
            <div className={`absolute w-full h-full top-0 left-0`}>
                {children}
            </div>
        </div>
    );
}

export function useFadeOpacity3D(page, matRef) {
    const data = useScroll();
    useFrame(()=>{
        if (matRef.current !== null) {
            matRef.current.opacity = Math.min((data.offset * data.pages) / page, 1);
        }
    })
}

export function useHide3D(page) {
    const data = useScroll();
    // Similar to useFadeOpacity3D, but returns true or false instead of setting opacity
    const [hiddenRef, hidden, setHidden] = useRefState(false);
    // Don't update state if no change
    useFrame(()=>{
        const newHidden = Math.min((data.offset * data.pages) / page, 1) >= 1;
        if (newHidden !== hiddenRef.current) {
            setHidden(newHidden);
        }
    })
    return hidden;
}

export function FadeFilter3D({cameraOffset=20.5, planeScale=25, page=0.8, visible=true}) {
    const matRef = useRef<MeshBasicMaterial>(null);
    useFadeOpacity3D(page, matRef);
    return (
        <CameraStartGroup visible={visible}>
            <Plane scale={planeScale} rotation={[0,0,Math.PI/2]} position={[0, 0, -cameraOffset]}>
                <meshBasicMaterial ref={matRef} attach="material" color="black" opacity={1} transparent={true} />
            </Plane>
        </CameraStartGroup>
    )
}

export function PopGroup({factor=100, lambda=5, deltaPosition=[0,0,1], deltaRotation=[0,0,0], children, ...props}: {
    factor?: number,
    lambda?: number,
    deltaPosition?: [number, number, number],
    deltaRotation?: [number, number, number],
    children?: React.ReactNode,
    [key: string]: any
}) {
    const data = useScroll();
    const groupRef = useRef<Group>(null);
    useFrame((state, dt)=>{
        if (groupRef.current) {
            groupRef.current.position.x = MathUtils.damp(groupRef.current.position.x, data.delta * factor * deltaPosition[0], lambda, dt);
            groupRef.current.position.y = MathUtils.damp(groupRef.current.position.y, data.delta * factor * deltaPosition[1], lambda, dt);
            groupRef.current.position.z = MathUtils.damp(groupRef.current.position.z, data.delta * factor * deltaPosition[2], lambda, dt);
            groupRef.current.rotation.x = MathUtils.damp(groupRef.current.rotation.x, data.delta * factor * deltaRotation[0], lambda, dt);
            groupRef.current.rotation.y = MathUtils.damp(groupRef.current.rotation.y, data.delta * factor * deltaRotation[1], lambda, dt);
            groupRef.current.rotation.z = MathUtils.damp(groupRef.current.rotation.z, data.delta * factor * deltaRotation[2], lambda, dt);
        }
    })
    return (
        <group {...props}>
            <group ref={groupRef}>
                {children}
            </group>
        </group>
    )
}

export function FadeGroup({factor=0.1, children}) {
    const data = useScroll();
    const groupRef = useRef<Group>(null);
    useFrame(()=>{
        if (groupRef.current) {
            groupRef.current.scale.set(1 + data.range(0, factor) * data.offset, 1 + data.range(0, factor) * data.offset, 1 + data.range(0, factor) * data.offset);
        }
    })
    return (
        <group ref={groupRef}>
            {children}
        </group>
    )
}
 
export function HidingObject({page=1, children}) {
    const hidden = useHide3D(page)
    // Wrap children to add visible prop that is !hidden
    const newChildren = Children.map(children, child => {
        return cloneElement(child, {
            visible: !hidden
        });
    });
    return newChildren
}

export function CameraStartGroup({children, ...args}) {
    const {defaultCameraProps} = useContext(ViewerContext)
    return (
        <group position={defaultCameraProps.position} rotation={defaultCameraProps.rotation} {...args}>
            {children}
        </group>
    )
}

export const DisableRender = () => useFrame(() => null, 1000);

export function TitleScreen(props) {
    return (<div className='w-full h-full relative flex flex-col justify-center md:justify-start md:p-16'>
        {props.lang === "zh" ? <Fragment>
            <div className="translate-y-[30px] md:translate-y-[-44px] md:flex md:flex-row md:gap-4">
                <Fade bottom cascade duration={3000}>
                    <div className={"font-black text-[128px] text-center md:text-left"}>
                        {props.text["top-title"]}
                    </div>
                </Fade>
                <div className="grow hidden md:block" />
                <div className="font-black text-[50px] md:translate-y-[95px] hidden md:block">
                    <Fade delay={2000} duration={2000}>
                        <div>
                            {props.text["scroll"]}
                        </div>
                    </Fade>
                </div>
            </div>
            <div className="md:grow">
            </div>
            <div className="translate-y-[-30px] md:translate-y-[28px]">
                <Fade top cascade duration={3000}>
                    <div className="font-black text-[128px] text-center md:text-right">
                        {props.text["bottom-title"]}
                    </div>
                </Fade>
            </div>
            <div className="block md:hidden">
                <Fade delay={2000} duration={2000}>
                    <div className="font-black text-[30px] text-right px-8">
                        {props.text["scroll"]}
                    </div>
                </Fade>
            </div>
        </Fragment> : <Fragment>
            <div className="w-full h-full flex flex-col">
                <Fade delay={500} duration={1500} up>
                    <div className="text-5xl md:text-[60px] font-bold max-w-[500px] mr-auto">
                        {props.text["top-title"]}
                    </div>
                </Fade>
                <div className="grow" />
                <Fade delay={800} duration={2000} cascade down>
                    <div className="text-[64px] font-black text-right align-bottom max-w-[400px] ml-auto">
                        ↓
                    </div>
                </Fade>
            </div>
        </Fragment>}

    </div>);
}

export function Screen1(props) {
    const md = useMediaQuery("(min-width: 768px)");
    return (
        <Fragment>
            <MagicDiv className="flex flex-col gap-4 w-full h-full justify-center content-center items-start">
                <div className='md:h-64'/>
                <Fade delay={500}>
                    <div className="font-black text-center md:text-left px-8 pb-4 md:px-16 text-4xl md:text-5xl md:w-[70%]">
                        {props.text["subtitle"]}
                    </div>
                </Fade>
                <Fade delay={600}>
                    <div className="px-8 md:px-16 md:text-xl text-center md:text-left md:w-[70%]">
                        {props.text["p1"]}
                    </div>
                </Fade>
                {/* Fade in image carousel of related topics */}
            </MagicDiv>
        </Fragment>
    );
}

export function Screen2({children, ...props}) {
    return (
        <Fragment>
            <MagicDiv className="flex flex-col gap-4 w-full items-end">
                <Fade delay={500}>
                    <div className="font-black text-center md:text-left px-8 pb-4 md:px-16 text-4xl md:text-5xl md:w-[70%]">
                        {props.text["subtitle2"]}
                    </div>
                </Fade>
                <Fade delay={600}>
                    <div className="px-8 md:px-16 md:text-xl text-center md:text-left md:w-[70%]">
                        {props.text["p2"]}
                    </div>
                </Fade>
                {/* Fade in video / animation depicting preservation process */}
                <Fade delay={700}>
                    {/* Align all of the div's content center */}
                    <div className="w-full px-8 md:px-16 text-center pt-6 md:pt-16">
                        {
                            children
                        }
                    </div>
                </Fade>
            </MagicDiv>
        </Fragment>
    );
}

export function EndScreen({text, gotoBrowse}: {
    text: MultiLangObject,
    gotoBrowse: () => void
}) {
    return (
        <Fragment>
            <MagicButton className="text-2xl md:text-[50px] h-16 md:h-24 rounded-full px-7 md:px-48 font-black" onClick={gotoBrowse}>
                {/* <div className='flex flex-row gap-2'>
                    <MagicIcon fillCurrent invertColors IconComponent={SearchIcon}/>
                    <div></div>
                </div> */}
                {text["browseAction"]}
            </MagicButton>
        </Fragment>
    )
}

export function EndScreenB({text}) {
    return (
        <Fragment>
            <h2 className="text-xl md:text-4xl font-black text-center">{text["noContentPartA"]}<br/>{text["noContentPartB"] }</h2>
            <div className="inline">
                <MagicIcon fillCurrent IconComponent={InstagramIcon} className="h-8 w-8 cursor-pointer" onClick={()=>{
                    window.open("https://www.instagram.com/thelostmetropolishk/");
                }}/>
            </div>
        </Fragment>
    )
}