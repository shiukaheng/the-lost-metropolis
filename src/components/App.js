import { BrowserRouter as Router, Route } from "react-router-dom";
import NavigationBar from "./components/NavigationBar"
import AppContainer from "./components/AppContainer"
import { useNavigate } from 'react-router-dom';
import { useState, createContext, useEffect } from "react";
import MagicDiv from "./components/MagicDiv";
import Background from "./components/Background";
import AnimatedSwitch from "./components/AnimatedSwitch";

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
    },
    // {
    //     "title": {
    //         "en": "Hong Kong City Hall",
    //         "zh": "香港大會堂",
    //     },
    //     "description": {
    //         "en": `Hong Kong City Hall (Chinese: 香港大會堂) is a building located at Edinburgh Place, Central, Hong Kong Island, Hong Kong.

    //         Since Hong Kong is a "Special Administrative Region" and not a normal Chinese city, there is no mayor or city council; therefore, the City Hall does not hold the offices of a city government, unlike most city halls around the world. Instead, it is a complex providing municipal services, including performing venues and libraries.
            
    //         The City Hall is managed by the Government's Leisure and Cultural Services Department. The Urban Council (UrbCo) managed the City Hall (through the Urban Services Department) and held its meetings there prior to its dissolution in December 1999. Prior to its dissolution the UrbCo served as the municipal council for Hong Kong Island and Kowloon (including New Kowloon). The UrbCo had its meeting chamber in the Low Block of the City Hall.`,
    //         "zh": "香港大會堂跟同樣位於愛丁堡廣場的第四代郵政總局、昔日第三代的中環天星碼頭及其停車場、和已拆卸的皇后碼頭屬同一時期的建築，並形成一個大眾市民的公共空間。昔日的市政局總部大樓即在香港大會堂旁的展城館。",
    //     },
    //     "time_posted": "2020-05-02",
    //     "id": "city_hall"
    // },
    // {
    //     "title": {
    //         "en": "Hong Kong Disneyland",
    //         "zh": "香港迪士尼",
    //     },
    //     "description": {
    //         "en": `Hong Kong Disneyland is a theme park located in the district of Kowloon. It is the largest theme park in the world, with a total of over 10,000 rides and over 30,000 guest capacity. It is one of the most popular theme parks in Asia, with a total of over 3,000,000 visitors annually.
    //         The Hong Kong Disneyland is a member of the Hong Kong Disneyland Group, which is the largest theme park group in Asia. It is the largest theme park in Hong Kong, with a total of 10,000 rides and over 30,000 guest capacity. It is one of the most popular theme parks in Asia, with a total of over 3,000,000 visitors annually.`,
    //         "zh": `香港迪士尼是一個位於香港山莊的主題公園，它是世界上最大的主題公園，共有10,000個主題角色，共有超過30,000人的嘉賓容量。它是大陸最受歡迎的主題公園之一，共有3,000,000位訪客每年。香港迪士尼是香港迪士尼集團的一個成員，是大陸最大的主題公園集團之一。它是香港最大的主題公園，共有10,000個主題角色，共有超過30,000人的嘉賓容量。它是大陸最受歡迎的主題公園之一，共有3,000,000位訪客每年。`
    //     },
    //     "time_posted": "2020-05-03",
    //     "id": "disneyland"
    // }
]

function MultiLangNavLink({text, to, ...props}) {
    const navigate = useNavigate();
    return <MagicDiv mergeTransitions={true} className={"nav-button"} languageSpecificChildren={text} onClick={()=>{
        navigate(to)
    }}/>
}

function App() {
    // Theme defines the background color and foreground color, as well as the background video. It is not persistent between sessions and is defined by what content the user is viewing.
    const [theme, setTheme] = useState(defaultTheme)
    // Settings defines user preferences persistent between sessions.
    const [settings, setSettings] = useState(defaultSettings)
    const [cursorData, setCursorData] = useState(defaultCursorData)
    // set cursorData with listener on body element
    useEffect(() => {
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
    return (
        <CursorDataContext.Provider value={cursorData}>
            <SettingsContext.Provider value={settings}>
                <ThemeContext.Provider value={theme}>
                    <Router>
                        <div className="absolute w-full h-full">
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
                                <AnimatedSwitch>
                                    <Route path="/" element={<Home/>}/>
                                    <Route path="/browse" element={<ShowcaseView content_array={content_array}/>}/>
                                    <Route path="/browse/:id" element={<ShowcaseView content_array={content_array}/>}/>
                                    <Route path="/list" element={<ListView content_array={content_array}/>}/>
                                    <Route path="/about" element={<About/>}/>
                                </AnimatedSwitch>
                            </AppContainer>
                        </div>
                    </Router>
                </ThemeContext.Provider>
            </SettingsContext.Provider>
        </CursorDataContext.Provider>
  )
}

export { App, ThemeContext, SettingsContext, CursorDataContext }