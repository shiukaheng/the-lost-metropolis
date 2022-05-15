import MagicDiv from '../../utilities/MagicDiv';
import { useRefState } from '../../../utilities';
import { Fade } from "react-reveal";
import { useScroll, ScrollControlsState } from "@react-three/drei";
import { Fragment, useContext, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ViewerContext } from '../../viewer/ViewerContext';
import useMediaQuery from 'react-hook-media-query';
import MagicIcon from '../../utilities/MagicIcon';
import { ReactComponent as InstagramIcon } from "./svgs/instagram.svg";
import MagicButton from '../../utilities/MagicButton';
import { useNavigate } from 'react-router-dom';
import { MultiLangObject } from '../../../../api/types/MultiLangObject';

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
            <div className="w-full h-full flex flex-col px-8">
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
    return (
        <Fragment>
            <MagicDiv className="flex flex-col gap-4 w-full h-full">
                <Fade delay={500}>
                    <div className="font-black text-center md:text-left px-8 pb-4 md:px-16 text-4xl md:text-5xl">
                        {props.text["subtitle"]}
                    </div>
                </Fade>
                <Fade delay={700}>
                    <div className="px-8 md:px-16 md:text-xl">
                        {props.text["p1"]}
                    </div>
                </Fade>
                {/* Fade in image carousel of related topics */}
            </MagicDiv>
            <MagicDiv className="flex md:hidden flex-col gap-4 w-full h-full bg-teal-400">
                
            </MagicDiv>
        </Fragment>
    );
}

export function Screen2(props) {
    return (
        <Fragment>
            <MagicDiv className="flex flex-col gap-4 w-full h-full">
                <Fade delay={500}>
                    <div className="font-black text-center md:text-left px-8 pb-4 md:px-16 text-4xl md:text-5xl">
                        {props.text["subtitle2"]}
                    </div>
                </Fade>
                <Fade delay={700}>
                    <div className="px-8 md:px-16 md:text-xl">
                        {props.text["p2"]}
                    </div>
                </Fade>
                {/* Fade in video / animation depicting preservation process */}
            </MagicDiv>
            <MagicDiv className="flex md:hidden flex-col gap-4 w-full h-full bg-teal-400">
                
            </MagicDiv>
        </Fragment>
    );
}

export function EndScreen({text, gotoBrowse}: {
    text: MultiLangObject,
    gotoBrowse: () => void
}) {
    return (
        <MagicDiv className="w-full h-full flex flex-col justify-center items-center gap-4">
            <MagicButton solid className="text-3xl md:text-4xl h-16 md:h-18" onClick={gotoBrowse}>
                瀏覽內容
            </MagicButton>
        </MagicDiv>
    )
}

export function EndScreenB({text}) {
    return (
        <MagicDiv className="w-full h-full flex flex-col justify-center items-center gap-4">
            <h2 className="text-3xl md:text-4xl font-black text-center">暫未公布任何項目<br/>敬請留意社交媒體</h2>
            <div className="flex flex-row gap-2">
                <MagicIcon fillCurrent IconComponent={InstagramIcon} className="h-8 w-8 cursor-pointer" onClick={()=>{
                    window.open("https://www.instagram.com/thelostmetropolishk/");
                }}/>
            </div>
        </MagicDiv>
    )
}