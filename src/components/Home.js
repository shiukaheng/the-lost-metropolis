import React from 'react'
import MagicDiv from './MagicDiv'

function Home() {
    return (
        <MagicDiv className="page-margins">
            <MagicDiv autoColor={false} className="font-extrabold text-5xl md:text-6xl text-center" languageSpecificChildren={{
                en: "explore hong kong’s lost urban spaces",
                zh: "探索香港失落的城市空間"
            }}/>
        </MagicDiv>
        // 3D model of the city with hover effect to shine light on buildings
    )
}

export default Home