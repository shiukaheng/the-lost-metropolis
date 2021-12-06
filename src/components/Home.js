import { Canvas } from '@react-three/fiber'
import React from 'react'
import MagicDiv from './MagicDiv'
import { ThemeContext } from "../App"
function Home() {
    const theme = React.useContext(ThemeContext)
    return (
        <MagicDiv className="page-margins">
            <MagicDiv autoColor={false} className="font-extrabold text-5xl md:text-6xl text-center" languageSpecificChildren={{
                en: "explore hong kong’s lost urban spaces",
                zh: "探索香港失落的城市空間"
            }}/>
            <Canvas>
                <mesh rotation={[0,0,0]}>
                    <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
                    <meshBasicMaterial attach="material" color={theme.foreground} wireframe={true}/>
                </mesh>
            </Canvas>
        </MagicDiv>
        // 3D model of the city with hover effect to shine light on buildings
    )
}

export default Home