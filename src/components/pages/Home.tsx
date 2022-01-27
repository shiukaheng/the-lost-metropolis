import React, { Suspense } from 'react'
import MagicDiv from '../MagicDiv'
import HighlightViewport from '../HighlightViewport'
import GenericPage from '../GenericPage'
import PotreeObject from '../3d/PotreeObject'
import { DepthKitObject } from "../3d/DepthKitObject"
import TestObject from '../3d/TestObject'

function Home() {
    return (
        <GenericPage className="relative w-full h-full overflow-x-hidden flex flex-col gap-4">
            <HighlightViewport className="absolute w-full h-full overflow-hidden flex-grow rounded-3xl">
                <PotreeObject pointSizeType={0} pointSize={1} scale={[0.9, 0.9, 0.9]} rotation={[0, 0, 0]} position={[-10, -3 , 12]} baseUrl={"http://tlmhk.synology.me/data/BigShot/"}/>   
            </HighlightViewport>
            <MagicDiv autoColor={false} className="absolute w-full h-full font-extrabold text-5xl md:text-6xl text-center pointer-events-none" languageSpecificChildren={{
                en: "explore hong kong’s lost urban spaces",
                zh: "探索香港失落的城市空間"
            }}/>
            
        </GenericPage>
        // 3D model of the city with hover effect to shine light on buildings
    )
}

export default Home