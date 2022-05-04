import MagicDiv from '../utilities/MagicDiv'
import HighlightViewport from './Home/HighlightViewport'
import GenericPage from '../utilities/GenericPage'
import { PotreeObject } from '../3d/PotreeObject'
import { useRefState, useTheme } from '../../utilities'
import { Fade } from "react-reveal"
import { useGLTF, ScrollControls, Scroll, useCursor, useIntersect, useScroll, ScrollControlsState } from "@react-three/drei"
import { useContext, useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Viewer } from '../viewer/Viewer'
import { SettingsContext } from '../App'
import { PotreeContext } from '../3d/managers/PotreeManager'
import { EditorContext } from '../editor/EditorContext'
import { ViewerContext } from '../viewer/ViewerContext'

function PointCloud() {
    const ref = useRef()
    const data = useScroll()
    useFrame(() => {
        ref.current.position.z = (data.range(0, 1/2) * 5) ** 2.5
        ref.current.position.y = (data.range(0, 1/2) * 5) ** 2.5
    })
    return (
        <group ref={ref}>
            <PotreeObject objectID="homepageShowcase" pointSize={1} pointSizeType={0} scale={[0.9, 0.9, 0.9]} rotation={[0, 0, 0]} position={[-10, -3 , 12]} baseUrl={"https://static.thelostmetropolis.org/BigShotCleanV2/"} cloudName="metadata.json"/>   
        </group>
    )
}

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
            setPotreePointBudget(1e5)
        }
    }, [setPotreePointBudget])
    return null
}

function FadeFilter() {
    const data = useScroll
    const divRef = useRef(null)
    useFrame(()=>{
        
    })
    return (
        <div ref={divRef}>

        </div>
    )
}

function Home() {
    const {settings} = useContext(SettingsContext) // Somehow the settings context is not being passed down to the children if its inside of Scroll
    return (
        <GenericPage className="relative w-full h-full homepage">
            <ApplySettings/>
            <Viewer className="absolute w-full h-full overflow-hidden flex-grow rounded-3xl" defaultCameraProps={{
                position: [-4,-7,30],
                rotation: [0,0,0],
                fov: 30
            }}>
                <ScrollControls pages={5} >
                    <Scroll>
                    <PotreeObject objectID="homepageShowcase" pointShape={0} pointSize={1} pointSizeType={0} scale={[0.9, 0.9, 0.9]} rotation={[-.5, 0.3, 0.088]} position={[-10, -3 , 12]} baseUrl={"https://static.thelostmetropolis.org/BigShotCleanV2/"} cloudName="metadata.json"/>   
                    </Scroll>
                    <Scroll html className="w-full h-full">
                        <div className='w-full h-full relative flex flex-col justify-center md:justify-start'>
                            <div className="translate-y-[30px] md:translate-y-[-44px]">
                                <Fade bottom cascade duration={3000}>
                                    <div className="font-black text-[128px] text-center md:text-left md:px-16 md:pt-16">
                                    時空
                                    </div>
                                </Fade>
                            </div>
                            <div className="md:grow">
                            </div>
                            <div className="translate-y-[-30px] md:translate-y-[28px]">
                                <Fade top cascade duration={3000}>
                                    <div className="font-black text-[128px] text-center md:text-right md:px-16 md:pb-16">
                                    幻遊
                                    </div>
                                </Fade>
                            </div>
                        </div>
                            <MagicDiv className="py-16">
                                <Fade>
                                    <div className="md:w-[600px] px-16">
                                        偶然發現某些定格於幾十年前的建築物與老店，彷彿能管窺時代的變遷。儘管我這代年輕人並沒有在老一輩的香港活過，但奇怪地，喜愛舊日文化的年輕人為數亦不少。懷舊或許能讓人更了解自己的根源與身份，我有幸生於這個時代仍能見證這地方的舊文化，但每當想起舊建築即將因為配合市區重建而清拆，或以活化的名義將它們虛有其表地高檔化時，便會發現社會上「新」與「舊」的二元對立日趨嚴重。
                                    </div>
                                </Fade>
                            </MagicDiv>
                        
                    </Scroll>
                </ScrollControls>
            </Viewer>
        </GenericPage>
        // 3D model of the city with hover effect to shine light on buildings
    )
}

export default Home