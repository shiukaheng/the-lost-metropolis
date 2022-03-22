import MagicDiv from '../utilities/MagicDiv'
import HighlightViewport from './Home/HighlightViewport'
import GenericPage from '../utilities/GenericPage'
import { PotreeObject } from '../3d/PotreeObject'
import { useTheme } from '../../utilities'
import { Fade } from "react-reveal"
import { useGLTF, ScrollControls, Scroll, useCursor, useIntersect, useScroll } from "@react-three/drei"
import { useContext, useRef } from 'react'
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

function ScrollReveal(language) {
    // const data = useScroll()
    return (
        <MagicDiv autoColor={false} className="w-full font-extrabold md:text-xl text-center pointer-events-none" languageSpecificChildren={{
            en: "scroll ↓",
            zh: "滾動 ↓"
        }} languageOverride={language}/>
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
                    <PointCloud/>
                    <Scroll html>
                        <div className="flex flex-col">
                            <MagicDiv autoColor={false} className="w-full font-extrabold text-5xl md:text-7xl text-center pointer-events-none" languageSpecificChildren={{
                                en: "explore hong kong’s lost urban spaces",
                                zh: "穿越時空探索香港舊貌"
                            }} languageOverride={settings.lang}/>
                            <MagicDiv autoColor={false} className="w-full font-extrabold md:text-xl text-center pointer-events-none mt-8" languageSpecificChildren={{
                                en: "scroll ↓",
                                zh: "滾動 ↓"
                            }} languageOverride={settings.lang}/>
                            <ScrollReveal language={settings.lang}/>
                        </div>
                    </Scroll>
                </ScrollControls>
            </Viewer>
        </GenericPage>
        // 3D model of the city with hover effect to shine light on buildings
    )
}

export default Home