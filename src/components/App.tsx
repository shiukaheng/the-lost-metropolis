import { BrowserRouter as Router, Route } from "react-router-dom";
import NavigationBar from "./NavigationBar"
import AppContainer from "./AppContainer"
import { useNavigate } from 'react-router-dom';
import { useState, createContext, useLayoutEffect } from "react";
import MagicDiv from "./MagicDiv";
import Background from "./Background";
import AnimatedSwitch from "./AnimatedSwitch";
import { FC } from "react";
import Experience from "./Experience";
import { formatRGBCSS } from "../utilities";

// All pages
import Home from "./pages/Home"
import ShowcaseView from "./pages/ShowcaseView";
import ListView from "./pages/ListView";
import About from "./pages/About"

const defaultTheme = {
    backgroundColor: [0, 0, 0],
    foregroundColor: [255, 255, 255],
    backgroundVideo: null,
    transitionDuration: 0.5
}

const defaultSettings = {
    lang: "en"
}

// const defaultSensorData = {
//     relativeOrientationAvailable: false,
//     relativeOrientationMatrix: null
// }

const defaultCursorData = {
    x: 0,
    y: 0
}

const ThemeContext = createContext(defaultTheme)

const SettingsContext = createContext(defaultSettings)

// const SensorDataContext = createContext(defaultSensorData)

// const options = { frequency: 60, referenceFrame: 'device' };
// const sensor = new RelativeOrientationSensor(options);

const CursorDataContext = createContext(defaultCursorData)

const content_array = [
    {
        "title": {
            "en": "The State Theatre",
            "zh": "皇都戲院",
        },
        "description": {
            "en": `The design of the State Theatre was overseen by architects George W. Grey and Liu Sun-fo. The cinema opened in December 1952 as the Empire Theatre. It closed in 1957, and reopened in 1959 as the State Theatre, following extensive renovations. The State Theatre closed in 1997. Since July 2015 has been progressively buying out the numerous shops on the ground floor of the former theatre, with a view of demolishing the building for redevelopment. In response has included the building on its 'Heritage in danger' list since 23 March 2016, in particular citing its unique "parabola-like" concrete arches above its roof.`,
            "zh": `皇都戲院的前身為1952年12月建成的璇宮戲院（Empire Theatre），該建築物由建築師劉新科及1950年的香港測量師學會主席 George. W. Grey 設計。璇宮戲院於1957年底結業後與毗鄰的地段重新發展成住宅及商用建築物，而地下停車場則改建成三層商場。1959年2月8日，易了手的璇宮戲院重開，改名皇都戲院，到1997年2月28日結業，後於2000年改裝為桌球會，而該娛樂場所一直營業至今。            早年的璇宮戲院佔地三萬平方尺，座位逾1300個，而皇都戲院座位也逾千，並劃分為前座、中座、超等和特等。璇宮戲院開幕時曾賣廣告有標語謂「地底車場」、「遠東僅有」、「藝術浮雕」、「高尚名貴」。多年來國際級音樂會及海外歌舞團如日本、台灣等亦在此處表演。`,
        },
        "time_posted": "2020-05-01",
        "id": "state_theatre",
        "link": "http://tlmhk.synology.me/state/",
    }
]

function MultiLangNavLink({text, to, ...props}) {
    const navigate = useNavigate();
    return <MagicDiv mergeTransitions={true} className={"nav-button"} languageSpecificChildren={text} onClick={()=>{
        navigate(to)
    }}/>
}

function App():FC {
    // Theme defines the background color and foreground color, as well as the background video. It is not persistent between sessions and is defined by what content the user is viewing.
    const [theme, setTheme] = useState(defaultTheme)
    // Settings defines user preferences persistent between sessions.
    const [settings, setSettings] = useState(defaultSettings)
    const [cursorData, setCursorData] = useState(defaultCursorData)
    // set cursorData with listener on body element
    useLayoutEffect(() => {
        const body = document.querySelector("body")
        const mouseMoveHandler = (e) => {
            const newData = {
                x: (e.clientX/(window.innerWidth)-0.5)*2,
                y: -(e.clientY/(window.innerHeight)-0.5)*2
            }
            setCursorData(newData)
        }
        body.addEventListener("mousemove", mouseMoveHandler)
        return () => {
            body.removeEventListener("mousemove", mouseMoveHandler)
        }
    }, [])
    // set background color on body element
    useLayoutEffect(() => {
        const body = document.querySelector("body")
        body.style.backgroundColor = formatRGBCSS(theme.backgroundColor)
    }, [theme.backgroundColor])
    return (
        <CursorDataContext.Provider value={cursorData}>
            <SettingsContext.Provider value={settings}>
                <ThemeContext.Provider value={theme}>
                    <Router>
                        <div className="absolute w-full h-full">
                            <AnimatedSwitch pathPreprocessor={
                                (path) => {
                                    if (path.split("/")[1] !== "experience") {
                                        path = ""
                                    }
                                    return path
                                }
                            }>
                                <Route path="/experience/:id" element={<Experience content_array={content_array}/>}/>
                                <Route path="*" element={
                                    <div className="w-full h-full">
                                        <Background/>
                                        <AppContainer>
                                            <NavigationBar>
                                                <MultiLangNavLink text={{"en": "home", "zh": "首頁"}} to="/"/>
                                                <MultiLangNavLink text={{"en": "browse", "zh": "瀏覽"}} to="/browse"/>
                                                <MultiLangNavLink text={{"en": "list", "zh": "列表"}} to="/list"/>
                                                <MultiLangNavLink text={{"en": "about", "zh": "關於"}} to="/about"/>
                                                <MagicDiv mergeTransitions={true} className="nav-button" onClick={()=>{setSettings(
                                                    oldSettings => ({
                                                        ...oldSettings,
                                                        lang: oldSettings.lang === "en" ? "zh" : "en"
                                                    })
                                                )}}>中／eng</MagicDiv>
                                                <MagicDiv mergeTransitions={true} className="nav-button" onClick={()=>{setTheme(
                                                    oldTheme => ({
                                                        ...oldTheme,
                                                        foregroundColor: oldTheme.backgroundColor,
                                                        backgroundColor: oldTheme.foregroundColor
                                                    })
                                                )}}>?!</MagicDiv>
                                            </NavigationBar>
                                            <AnimatedSwitch pathPreprocessor={
                                                // Prevent the animation from triggering when under navigating in the browse directory, since it already has a sliding animation
                                                (path) => {
                                                    if (path.split("/")[1]==="browse") {
                                                        path = "browse"
                                                    }
                                                    return path
                                                }
                                            }>
                                                <Route path="/" element={<Home/>}/>
                                                <Route path="/browse" element={<ShowcaseView content_array={content_array}/>}/>
                                                <Route path="/browse/:id" element={<ShowcaseView content_array={content_array}/>}/>
                                                <Route path="/list" element={<ListView content_array={content_array}/>}/>
                                                <Route path="/about" element={<About/>}/>
                                            </AnimatedSwitch>
                                        </AppContainer>
                                    </div>
                                }/>
                            </AnimatedSwitch>
                        </div>
                    </Router>
                </ThemeContext.Provider>
            </SettingsContext.Provider>
        </CursorDataContext.Provider>
  )
}

export { App, ThemeContext, SettingsContext, CursorDataContext }