import MagicDiv from '../utilities/MagicDiv'
import HighlightViewport from './Home/HighlightViewport'
import GenericPage from '../utilities/GenericPage'
import { PotreeObject } from '../3d/PotreeObject'
import { useTheme } from '../../utilities'

function Home() {
    return (
        <GenericPage className="relative w-full h-full">
            <div className="relative w-full h-full">
                <HighlightViewport className="absolute w-full h-full overflow-hidden flex-grow rounded-3xl">
                    <PotreeObject objectID="homepageShowcase" pointSize={1} pointSizeType={0} scale={[0.9, 0.9, 0.9]} rotation={[0, 0, 0]} position={[-10, -3 , 12]} baseUrl={"https://static.thelostmetropolis.org/BigShotCleanV2/"} cloudName="metadata.json"/>   
                </HighlightViewport>
                <MagicDiv autoColor={false} className="absolute w-full h-full font-extrabold text-5xl md:text-6xl text-center pointer-events-none" languageSpecificChildren={{
                    en: "explore hong kong’s lost urban spaces",
                    zh: "穿越時空探索香港舊貌"
                }}/>
            </div>
            {/* <div className='flex flex-col gap-8 mt-8'>
                <MagicDiv autoColor={false} className="static w-full h-full font-extrabold text-4xl md:text-5xl pointer-events-none" languageSpecificChildren={{
                    en: "mission",
                    zh: "任務"
                }}/>
            </div> */}
        </GenericPage>
        // 3D model of the city with hover effect to shine light on buildings
    )
}

export default Home