import GenericPage from '../utilities/GenericPage'
import { PotreeObject } from '../3d/PotreeObject'
import { useMultiLangObject, useTheme } from '../../utilities'
import { ScrollControls, Scroll, Image, Plane } from "@react-three/drei"
import { Suspense, useCallback, useContext, useState } from 'react'
import { Viewer } from '../viewer/Viewer'
import { SettingsContext } from '../App'
import { FollowMouseGroup } from './Home/HighlightViewport'
import { ApplySettings, DisableRender, FadeFilter, TitleScreen, Screen1, Screen2, EndScreen, EndScreenB, FadeFilter3D, HidingObject, CameraStartGroup, PopGroup } from './Home/HomeSubcomponents'
import useMediaQuery from 'react-hook-media-query'
import { ContentContext } from '../providers/ContentProvider'
import { useNavigate } from 'react-router-dom'
import { MeshBasicMaterial } from 'three'
import imageUrl1 from "./Home/media/cat.jpg"
import imageUrl2 from "./Home/media/DSC09963s copy.jpg"

console.log(imageUrl1)

function Home() {
    const { settings } = useContext(SettingsContext) // Somehow the settings context is not being passed down to the children if its inside of Scroll
    const [opaque, setOpaque] = useState(false)
    const md = useMediaQuery('(min-width: 768px)')
    const posts = useContext(ContentContext)
    const navigate = useNavigate()
    const gotoBrowse = useCallback(()=>{
        navigate("/browse")
    }, [navigate])
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
            "zh": "建築不單盛載著歷史，更有一份情懷",
            "en": "historical places are quietly disappearing"
        },
        "p1": {
            "zh": "偶然發現某些定格於大半世紀前的建築物與老店，彷彿能從它們中窺看時代的變遷，圍繞著建築的人和事更是歷史的標記。可惜，在急速發展的社會中，舊建築已經完成它服務社區的歷史任務。久而久之，舊建築逐漸被人遺忘、丟空。令人婉惜的是，當年的人、事、和情懷都隨著建築的日久失修而消失。",
            "en": "the old districts of hong kong are a glimpse into a bygone era; but as society moves on, they already have their fate set in stone to either be redeveloped, or be gentrified into tourist destinations."
        },
        "subtitle2": {
            "zh": "元宇宙中重聚遺忘的故事",
            "en": "virtually reincarnating lost spaces"
        },
        "p2": {
            "zh": "也許我們急促的社會沒有空間再容納下這些時代遺物；甚至當有少數的可以原址保留，活化的過程亦很容易令失去它們本身蘊含的活歷史。《情迷香港》以一種沉浸式的載體，把即將面臨清拆重建的社區空間轉化為可供探索與互動的虛擬掃描複製品。在掃描的基礎上，場景裏更加入聲音景觀以及與該空間有關之人物採訪錄像，以豐富觀眾聽覺的感受與對人文歷史的認知。",
            "en": "we feel a sense of mission to preserve and document them, in a way faithful to its physical form and at the same time, documenting its story with its community. the lost metropolis virtually reincarnate these lost spaces through immersive installations, 3d scanning and oral history interviews."
        },
        "scroll": {
            "zh": "↓",
            "en": "↓"
        },
        "browseAction": {
            "zh": "瀏覽內容",
            "en": "browse content"
        },
        "noContentPartA": {
            "zh": "暫未公布任何項目",
            "en": "content coming soon"
        },
        "noContentPartB": {
            "zh": "敬請留意社交媒體",
            "en": "follow us on social media"
        },
    })

    // Set different amount of pages using mediaQuery since in mobile version, the Page1 and Page2 components will have double height
    const scrollPages = 4
    return (
        <GenericPage className="relative w-full h-full homepage">
            <ApplySettings />
            <Viewer className="absolute w-full h-full overflow-hidden flex-grow rounded-3xl" defaultCameraProps={{
                position: [-4, -7, 30],
                rotation: [0, 0, 0],
                fov: 30
            }}>
                {
                    opaque && <DisableRender />
                }
                <ScrollControls pages={scrollPages} damping={5}>
                    <HidingObject>
                        <PotreeScene/>
                        <FadeFilter3D/>
                    </HidingObject>
                    <CameraStartGroup>
                        <group position={[0,0,-20]}>
                        <Scroll>
                            <Suspense fallback={null}>
                                {/* <FollowMouseGroup> */}
                                    <group position={[0,-11,0]}>
                                        <PopGroup position={[3, 0, 1]} deltaPosition={[0, 0, 0]} deltaRotation={[0, -0.2, 0]} lambda={1}>
                                            <Image scale={[10,10,10]} url={imageUrl1} toneMapped={false}/>
                                        </PopGroup>
                                        <PopGroup position={[-3, -4, 3.5]} deltaPosition={[0, 0, 0]} deltaRotation={[0, 0.2, 0]} lambda={1}>
                                            <Image url={imageUrl2} scale={[9, 6, 10]} toneMapped={false}/>
                                        </PopGroup> 
                                    </group>
                                {/* </FollowMouseGroup> */}
                            </Suspense>
                        </Scroll>
                        </group>
                    </CameraStartGroup>
                    <Scroll html className="w-full h-full">
                        <TitleScreen lang={settings.lang} text={text}></TitleScreen>
                        <Screen1 text={text}></Screen1>
                        <Screen2 text={text}></Screen2>
                        {
                            (posts && posts?.length > 0) ? <EndScreen text={text} gotoBrowse={gotoBrowse}/> : <EndScreenB text={text}/>
                        }
                    </Scroll>
                </ScrollControls>
            </Viewer>
        </GenericPage>
    )
}

export default Home

function PotreeScene({visible=true}) {
    return <Scroll>
        <FollowMouseGroup>
            <PotreeObject objectID="homepageShowcase" pointShape={0} pointSize={1} pointSizeType={0} scale={[0.9, 0.9, 0.9]} rotation={[-.5, 0.3, 0.088]} position={[-10, -3, 12]} baseUrl={"https://static.thelostmetropolis.org/BigShotCleanV2/"} cloudName="metadata.json" visible={visible}/>
        </FollowMouseGroup>
    </Scroll>
}
