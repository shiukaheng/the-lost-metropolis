import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavigationBar from "./components/NavigationBar"
import AppContainer from "./components/AppContainer"
import Home from "./components/Home"
import About from "./components/About"
import ListView from "./components/ListView";
import ShowcaseView from "./components/ShowcaseView";
import { useNavigate } from 'react-router-dom';
// import { CSSTransition, TransitionGroup } from "react-transition-group";
import { useState, createContext } from "react";
import MagicDiv from "./components/MagicDiv";
import Background from "./components/Background";

// Different views: map and list

const defaultTheme = {
    backgroundColor: [0, 0, 0],
    foregroundColor: [255, 255, 255],
    backgroundVideo: null,
    transitionDuration: 0.5
}

const defaultSettings = {
    lang: "en"
}

const ThemeContext = createContext(defaultTheme)

const SettingsContext = createContext(defaultSettings)

const content_array = [
    {
        "title": {
            "en": "The State Theatre Reborn",
            "zh": "皇都再世",
        },
        "description": {
            "en": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Quasi, quisquam.",
            "zh": "meow meow",
        },
        "time_posted": "2020-05-01",
        "id": "state_theatre"
            },
    {
        "title": {
            "en": "The Salon",
            "zh": "皇都再世 2",
        },
        "description": {
            "en": " 2 Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Quasi, quisquam. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Quasi, quisquam. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Quasi, quisquam. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Quasi, quisquam. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Quasi, quisquam. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Quasi, quisquam. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Quasi, quisquam.",
            "zh": "meow meow",
        },
        "time_posted": "2020-05-02",
        "id": "salon"
    }
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
    return (
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
                                        foregroundColor: [0, 0, 0],
                                        backgroundColor: [255, 255, 255]
                                    })
                                )}}>?!</MagicDiv>
                            </NavigationBar>
                            <Routes>
                                <Route path="/" element={<Home/>}/>
                                <Route path="/browse" element={<ShowcaseView content_array={content_array}/>}/>
                                <Route path="/browse/:id" element={<ShowcaseView content_array={content_array}/>}/>
                                <Route path="/list" element={<ListView content_array={content_array}/>}/>
                                <Route path="/about" element={<About/>}/>
                            </Routes>
                        </AppContainer>
                    </div>
                </Router>
            </ThemeContext.Provider>
        </SettingsContext.Provider>
  )
}

export { App, ThemeContext, SettingsContext }