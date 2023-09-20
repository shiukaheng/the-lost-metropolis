// import React from "react" // Not sure why this is required but ok
import { BrowserRouter as Router, Route, useLocation, useParams } from "react-router-dom";
import { useState, createContext, useLayoutEffect, useContext, MutableRefObject, useRef, useEffect, useMemo } from "react";
import AnimatedSwitch from "./utilities/AnimatedSwitch";
import { formatRGBCSS, useStickyState } from "../utilities";
// All pages
import Exhibition from './pages/Exhibition';
import { LanguageLiteral } from '../../api/types/LanguageLiteral';
import { Theme } from '../../api/types/Theme';
import ExhibitionEditor from "./pages/ExhibitionEditor";
import { TestPage } from "./pages/Test";
import ExhibitionProjectorView from "./pages/ExhibitionProjectorView";

function getDefaultLang(): LanguageLiteral {
    // Check if the browser has a language preference, if it is anything chinese, then use "zh", otherwise use "en"
    const lang = navigator.language.split("-")[0];
    if (lang === "zh") {
        return "zh";
    }
    return "en";
}

export const defaultSettings = {
    lang: getDefaultLang()
}

export const languages = ["en", "zh"]

const defaultSettingsContext = {
    settings: defaultSettings,
    setSettings: (newSettings) => {},
}

export const defaultTheme: Theme = {
    backgroundColor: [0, 0, 0],
    foregroundColor: [255, 255, 255],
    backgroundVideo: null,
    backgroundImage: null,
    backgroundOpacity: 1,
    transitionDuration: 0.5
}

export type ThemeContextType = {
    theme: Theme,
    setTheme: (newTheme: Theme) => void,
    // changes ref provide reference to a number that tracks how many times the theme has changed
    changesRef: MutableRefObject<number>,
}

const defaultThemeContext: ThemeContextType = {
    theme: defaultTheme,
    setTheme: (newTheme: Theme) => {},
    changesRef: { current: 0 },
}

export const ThemeContext = createContext<ThemeContextType>(defaultThemeContext)
export const SettingsContext = createContext(defaultSettingsContext)

export function App() {
    // Theme defines the background color and foreground color, as well as the background video. It is not persistent between sessions and is defined by what content the user is viewing.
    
    const [theme, _setTheme] = useState(defaultTheme)
    const changesRef = useRef(0)
    const setTheme = (newTheme: Theme) => {
        _setTheme(newTheme)
        changesRef.current++
    }

    // Settings defines user preferences persistent between sessions.

    const [settings, setSettings] = useStickyState(defaultSettings, "settings")

    // Set background color on body element

    useLayoutEffect(() => {
        const body = document.querySelector("body")
        body.style.backgroundColor = formatRGBCSS(theme.backgroundColor)
    }, [theme.backgroundColor])

    return (
        <SettingsContext.Provider value={{settings, setSettings}}>
            <ThemeContext.Provider value={{theme, setTheme, changesRef}}>
                <SiteRouter/>
                
            </ThemeContext.Provider>
        </SettingsContext.Provider>
    )
}

function SiteRouter() {
    return <Router>
            <div className="absolute w-full h-full">
                <AnimatedSwitch pathPreprocessor={(path) => {
                    if (path.split("/")[1] !== "view") {
                        path = "";
                    }
                    return path;
                } }>
                    <Route path="/" element={<Exhibition />} /> 
                    <Route path="/test" element={<TestPage/>} />
                    <Route path="/edit" element={<ExhibitionEditor />} />
                    <Route path="/projector/:id" element={<ExhibitionProjectorView/>}/>
                </AnimatedSwitch>
            </div>
    </Router>;
}