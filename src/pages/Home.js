import React from 'react'
import MagicDiv from '../components/MagicDiv'
import HighlightViewport from '../components/HighlightViewport'
import GenericPage from '../components/GenericPage'

function Home() {
    return (
        <GenericPage className="w-full h-full overflow-x-hidden flex flex-col gap-4">
            <MagicDiv autoColor={false} className="font-extrabold text-5xl md:text-6xl text-center" languageSpecificChildren={{
                en: "explore hong kong’s lost urban spaces",
                zh: "探索香港失落的城市空間"
            }}/>
            <HighlightViewport className="relative w-full overflow-hidden flex-grow"/>
        </GenericPage>
        // 3D model of the city with hover effect to shine light on buildings
    )
}

export default Home