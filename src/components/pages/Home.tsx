import MagicDiv from '../utilities/MagicDiv'
import GenericPage from '../utilities/GenericPage'
import { PotreeObject } from '../3d/PotreeObject'
import { useMultiLangObject, useRefState, useTheme } from '../../utilities'
import { Fade } from "react-reveal"
import { useGLTF, ScrollControls, Scroll, useCursor, useIntersect, useScroll, ScrollControlsState } from "@react-three/drei"
import { Fragment, useContext, useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Viewer } from '../viewer/Viewer'
import { SettingsContext } from '../App'
import { PotreeContext } from '../3d/managers/PotreeManager'
import { EditorContext } from '../editor/EditorContext'
import { ViewerContext } from '../viewer/ViewerContext'
import { FollowMouseGroup } from './Home/HighlightViewport'

function RevealDiv({predicate, children}: {predicate: (data: ScrollControlsState) => boolean, children: React.ReactNode}) {
    const data = useScroll()
    const [revealedRef, revealed, setRevealed] = useRefState(false)
    useFrame(()=>{
        if (predicate(data)) {
            revealedRef.current || setRevealed(true)
        } else {
            revealedRef.current && setRevealed(false)
        }
    })
    return (
        <Fade when={revealed}>
            {children}
        </Fade>
    )
}

function ApplySettings() {
    const {setPotreePointBudget} = useContext(ViewerContext)
    useEffect(()=>{
        if (setPotreePointBudget) {
            setPotreePointBudget(1e4)
        }
    }, [setPotreePointBudget])
    return null
}

function FadeFilter({pages=1, threshold=1.6, children, onFullyOpaque=()=>{}, onNotFullyOpaque=()=>{}}: {pages?: number, threshold?: number, children: React.ReactNode, onFullyOpaque?: ()=>void, onNotFullyOpaque?: ()=>void}) {
    const data = useScroll()
    const divRef = useRef(null)
    const fullyOpaque = useRef(false)
    useFrame(()=>{
        if (divRef.current) {
            divRef.current.style.opacity = data.range(0, threshold/pages)**2
            if (divRef.current) {
                if (divRef.current.style.opacity === '1') {
                    fullyOpaque.current = true
                    onFullyOpaque()
                }
                if (fullyOpaque.current && divRef.current.style.opacity !== '1') {
                    fullyOpaque.current = false
                    onNotFullyOpaque()
                }
            }
        }
    })
    return (
        <div className={`w-full`} style={{
            height: (pages*100).toString()+"%"
        }}>
            <div ref={divRef} className={`bg-black opacity-0 w-full`} style={
            {
                height: (pages*100).toString()+"%"
            }}/>
            <div className={`absolute w-full h-full top-0 left-0`}>
                {children}
            </div>
        </div>
    )
}

const DisableRender = () => useFrame(() => null, 1000)

function Home() {
    const {settings} = useContext(SettingsContext) // Somehow the settings context is not being passed down to the children if its inside of Scroll
    const [opaque, setOpaque] = useState(false)
    const text = useMultiLangObject({
        "top-title": {
            "zh": "時空",
            "en": "stumble through lost time."
        },
        "bottom-title": {
            "zh": "幻遊",
            "en": "scroll to explore ↓"
        },
        "subtitle": {
            "zh": "挽救日常中的社區歷史",
            "en": "x number of heritage sites have been demolished in the past decade" 
        },
        "p1": {
            "zh": "偶然發現某些定格於幾十年前的建築物與老店，彷彿能管窺時代的變遷。儘管我這代年輕人並沒有在老一輩的香港活過，喜愛舊日文化的年輕人為數亦不少。我有幸生於這個時代仍能見證這地方的舊文化，但每當想起在不久的將來它將被重建清拆，便會發現社會上「新」與「舊」的二元對立日趨嚴重。",
            "en": "the old districts of hong kong are a glimpse into a bygone era; but as society moves on, they already have their fate set in stone to either be redeveloped, or be gentrified into tourist destinations."
        },
        "subtitle2": {
            "zh": "",
            "en": "virtually reincarnating lost spaces"
        },
        "p2":{
            "zh": "也許我們急促的社會沒有空間再容納下這些時代遺物；甚至當有少數的可以原址保留，活化的過程亦很容易令失去它們本身蘊含的活歷史。《情迷香港》以一種沉浸式的載體，把即將面臨清拆重建的社區空間轉化為可供探索與互動的虛擬掃描複製品。在掃描的基礎上，場景裏更加入聲音景觀以及與該空間有關之人物採訪錄像，以豐富觀眾聽覺的感受與對人文歷史的認知。",
            "en": "we feel a sense of mission to preserve and document them, in a way faithful to its physical form and at the same time, documenting its story with its community. the lost metropolis virtually reincarnate these lost spaces through immersive installations, 3d scanning and oral history interviews."
        },
        "scroll":{
            "zh": "↓",
            "en": "↓"
        }
    })
    return (
        <GenericPage className="relative w-full h-full homepage">
            <ApplySettings/>
            <Viewer className="absolute w-full h-full overflow-hidden flex-grow rounded-3xl" defaultCameraProps={{
                position: [-4,-7,30],
                rotation: [0,0,0],
                fov: 30
            }}>
                {
                    opaque && <DisableRender/>
                }
                
                <ScrollControls pages={3} >
                    <Scroll>
                        <FollowMouseGroup>
                            <PotreeObject objectID="homepageShowcase" pointShape={0} pointSize={1} pointSizeType={0} scale={[0.9, 0.9, 0.9]} rotation={[-.5, 0.3, 0.088]} position={[-10, -3 , 12]} baseUrl={"https://static.thelostmetropolis.org/BigShotCleanV2/"} cloudName="metadata.json"/>   
                        </FollowMouseGroup>
                    </Scroll>
                    <Scroll html className="w-full h-full">
                        <FadeFilter pages={3} onFullyOpaque={()=>{
                            setOpaque(true)
                        }} onNotFullyOpaque={()=>{
                            setOpaque(false)
                        }}>
                            <div className='w-full h-full relative flex flex-col justify-center md:justify-start'>
                                {
                                    (settings.lang === "zh") ? (
                                        <Fragment>
                                            <div className="translate-y-[30px] md:translate-y-[-44px] md:flex md:flex-row md:gap-4">
                                                <Fade bottom cascade duration={3000}>
                                                    <div className={"font-black text-[128px] text-center md:text-left"}>
                                                    {text["top-title"]}
                                                    </div>
                                                </Fade>
                                                <div className="grow hidden md:block"/>
                                                <div className="font-black text-[50px] md:translate-y-[95px] hidden md:block">
                                                    <Fade delay={4000} duration={2000}>
                                                        <div>
                                                            {text["scroll"]}
                                                        </div>
                                                    </Fade>
                                                </div>
                                            </div>
                                            <div className="md:grow">
                                            </div>
                                            <div className="translate-y-[-30px] md:translate-y-[28px]">
                                                <Fade top cascade duration={3000}>
                                                    <div className="font-black text-[128px] text-center md:text-right">
                                                    {text["bottom-title"]}
                                                    </div>
                                                </Fade>
                                            </div>
                                            <div className="block md:hidden">
                                                <Fade delay={3000} duration={2000}>
                                                    <div className="font-black text-[30px] text-right px-8">
                                                        {text["scroll"]}
                                                    </div>
                                                </Fade>
                                            </div>
                                        </Fragment>
                                    ) : (
                                        <Fragment>
                                            <div className="w-full h-full flex flex-col px-8">
                                                <Fade delay={500} duration={1500} up>
                                                    <div className="text-5xl md:text-[60px] font-bold max-w-[500px] mr-auto">
                                                        {text["top-title"]}
                                                    </div>
                                                </Fade>
                                                <div className="grow"/>
                                                <Fade delay={800} duration={2000} cascade down>
                                                    <div className="text-[64px] font-black text-right align-bottom max-w-[400px] ml-auto">
                                                        ↓
                                                    </div>
                                                </Fade>
                                            </div>
                                        </Fragment>
                                    )
                                }
                                
                            </div>
                            <div className="w-full md:h-16"/>
                            {/* Page 1 */}
                            <MagicDiv className="flex flex-col gap-4 w-full h-full">
                                <Fade delay={500}>
                                    <div className="font-black px-8 pb-4 md:px-16 text-4xl md:text-5xl">
                                        {text["subtitle"]}
                                    </div>
                                </Fade>
                                <Fade delay={700}>
                                    <div className="px-8 md:px-16 md:text-xl">
                                    {text["p1"]}
                                    </div>
                                </Fade>
                            </MagicDiv>   
                            {/* Page 2 */}
                            <MagicDiv className="flex flex-col gap-4 w-full h-full">
                                <Fade delay={700}>
                                    <div className="px-8 md:px-16 md:text-xl">
                                    {text["p2"]}
                                    </div>
                                </Fade>
                            </MagicDiv>
                        </FadeFilter>                     
                    </Scroll>
                </ScrollControls>
            </Viewer>
        </GenericPage>
        // 3D model of the city with hover effect to shine light on buildings
    )
}

export default Home