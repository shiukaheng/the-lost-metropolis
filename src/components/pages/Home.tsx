import MagicDiv from '../utilities/MagicDiv'
import HighlightViewport from './Home/HighlightViewport'
import GenericPage from '../utilities/GenericPage'
import { PotreeObject } from '../3d/PotreeObject'
import { useRefState, useTheme } from '../../utilities'
import { Fade } from "react-reveal"
import { useGLTF, ScrollControls, Scroll, useCursor, useIntersect, useScroll, ScrollControlsState } from "@react-three/drei"
import { useContext, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Viewer } from '../viewer/Viewer'
import { SettingsContext } from '../App'

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


function Home() {
    const {settings} = useContext(SettingsContext) // Somehow the settings context is not being passed down to the children if its inside of Scroll
    return (
        <GenericPage className="relative w-full h-full">
            <Viewer className="absolute w-full h-full overflow-hidden flex-grow rounded-3xl" defaultCameraProps={{
                position: [0,0,5],
                rotation: [0,0,0],
                fov: 90
            }}>
                <ScrollControls pages={5}>
                    <Scroll>
                    <PotreeObject objectID="homepageShowcase" pointShape={0} pointSize={1} pointSizeType={0} scale={[0.9, 0.9, 0.9]} rotation={[0, 0, 0]} position={[-10, -3 , 12]} baseUrl={"https://static.thelostmetropolis.org/BigShotCleanV2/"} cloudName="metadata.json"/>   
                    </Scroll>
                    <Scroll html className="w-full">
                        <div className="w-full h-full fixed bg-black"></div>
                        <div className="flex flex-col w-full">
                            <div className="h-8"></div>
                            <MagicDiv autoColor={false} className="w-full font-extrabold text-5xl md:text-7xl text-center pointer-events-none" languageSpecificChildren={{
                                en: "archiving hong kong’s lost urban spaces",
                                zh: "保存香港遺失的城市空間"
                            }} languageOverride={settings.lang}/>
                            <div className="h-8"></div>
                            <Fade top>
                                <MagicDiv autoColor={false} className="w-full font-extrabold md:text-xl text-center pointer-events-none" languageSpecificChildren={{
                                    en: "scroll ↓",
                                    zh: "滾動 ↓"
                                }} languageOverride={settings.lang}/>
                            </Fade>
                            <div className="h-[500px]"></div>
                            <RevealDiv predicate={(data) => data.offset > 0.1}>
                                <MagicDiv autoColor={false} className="w-full font-extrabold md:text-xl text-center pointer-events-none" languageSpecificChildren={{
                                    en: "click to explore",
                                    zh: "點擊探索"
                                }} languageOverride={settings.lang}/>
                            </RevealDiv>
                        </div>
                    </Scroll>
                </ScrollControls>
            </Viewer>
        </GenericPage>
        // 3D model of the city with hover effect to shine light on buildings
    )
}

export default Home