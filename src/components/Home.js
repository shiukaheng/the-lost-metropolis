import React from 'react'
import MultilangDiv from './MultilangDiv'

function Home() {
    return (
        <div className="page-margins">
            <MultilangDiv className="font-extrabold text-6xl text-center" languageSpecificChild={{
                en: "explore hong kong’s lost urban spaces",
                zh: "探索香港失落的城市空間"
            }}/>
        </div>
    )
}

export default Home