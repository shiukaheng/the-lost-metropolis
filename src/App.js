import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import NavigationBar from "./components/NavigationBar"
import AppContainer from "./components/AppContainer"
import Home from "./components/Home"
import About from "./components/About"
import tw from "tailwind-styled-components"
import ShowcaseContentList from "./components/ShowcaseContentList";
import ShowcaseContent from "./components/ShowcaseContent";
// import MultilangDiv from "./components/MultilangDiv";
// import { CSSTransition, TransitionGroup } from "react-transition-group";
import { useState, createContext, useContext } from "react";

// Different views: map and list

const ThemeContext = createContext({
    background: "white",
    foreground: "black",
    backgroundVideo: null
})

const SettingsContext = createContext({
    lang: "en"
})

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

function MultiLangNavLink({...props }) {
    const Settings = useContext(SettingsContext)
    const { lang } = Settings
    const StyledNavLink = tw(NavLink)`nav-button`
    return (
        <StyledNavLink {...props}>
            {props.text[lang]}
        </StyledNavLink>
    )
}

function App() {
    const [theme, setTheme] = useState({
        background: "white",
        foreground: "black"
    })
    const [language, setLanguage] = useState("en")
    return (
        <SettingsContext.Provider value={{ lang: language }}>
            <ThemeContext.Provider value={theme}>
                <Router>
                    <AppContainer>
                    <NavigationBar>
                        <MultiLangNavLink text={{"en": "home", "zh": "首頁"}} to="/"/>
                        <MultiLangNavLink text={{"en": "browse", "zh": "瀏覽"}} to="/browse"/>
                        <MultiLangNavLink text={{"en": "list", "zh": "列表"}} to="/list"/>
                        <MultiLangNavLink text={{"en": "about", "zh": "關於"}} to="/about"/>
                        <button className="nav-button" onClick={()=>{setLanguage((language === "en") ? "zh" : "en")}}>中／eng</button>
                    </NavigationBar>
                        <Routes>
                            <Route path="/" element={<Home/>}/>
                            <Route path="/browse" element={<ShowcaseContent content_array={content_array}/>}/>
                            <Route path="/browse/:id" element={<ShowcaseContent content_array={content_array}/>}/>
                            <Route path="/list" element={<ShowcaseContentList content_array={content_array}/>}/>
                            <Route path="/about" element={<About/>}/>
                        </Routes>
                    </AppContainer>
                </Router>
            </ThemeContext.Provider>
        </SettingsContext.Provider>
  )
}

export { App, ThemeContext as ColorThemeContext, SettingsContext }