import { MainRouter } from './MainRouter';

// import React from "react" // Not sure why this is required but ok
import { BrowserRouter as Router, Route, useLocation, useParams } from "react-router-dom";
import NavigationBar from "./utilities/NavigationBar"
import AppContainer from "./utilities/AppContainer"
import { useNavigate } from 'react-router-dom';
import { useState, createContext, useLayoutEffect, useContext, MutableRefObject, useRef, useEffect } from "react";
import MagicDiv from "./utilities/MagicDiv";
import Background from "./utilities/Background";
import AnimatedSwitch from "./utilities/AnimatedSwitch";
import { FC } from "react";
import View from "./pages/View";
import { formatRGBCSS, KeyPressCallback, mergeThemes, removeThemeTransition, useStickyState } from "../utilities";
import Login from "./admin/Login";

// All pages
import Home from "./pages/Home"
import ShowcaseView from "./pages/ShowcaseView";
import ListView from "./pages/ListView";
import About from "./pages/About"
import { AuthContext, AuthProvider } from "./admin/AuthProvider";
import Dashboard from "./admin/Dashboard";
import { ContentContext, ContentProvider } from "./providers/ContentProvider";
import { EditPost } from "./admin/EditPost";
import LoadingScreen from "./utilities/LoadingScreen";
import { preloadFont } from "troika-three-text";
import UploadAssetPage from "./development/UploadAssetTest";
import { LanguageLiteral } from '../../api/types/LanguageLiteral';
import { Theme } from '../../api/types/Theme';
import { PointCloudOctreeGeometryNode } from '@pnext/three-loader';

export const defaultSettings = {
    lang: "en" as LanguageLiteral
}

export const languages = ["en", "zh"]

const defaultSettingsContext = {
    settings: defaultSettings,
    setSettings: (newSettings) => {},
}

// export type Theme = {
//     backgroundColor: [number, number, number],
//     foregroundColor: [number, number, number],
//     backgroundVideo: string | null,
//     backgroundImage: string | null,
//     backgroundOpacity: number,
//     transitionDuration: number
// }

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

// const SensorDataContext = createContext(defaultSensorData)

// const options = { frequency: 60, referenceFrame: 'device' };
// const sensor = new RelativeOrientationSensor(options);

preloadFont(
    {
        font: "https://fonts.gstatic.com/s/notoseriftc/v20/XLYgIZb5bJNDGYxLBibeHZ0BhnQ.woff"
    },
    () => {
    }
)

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
        <AuthProvider>
            <ContentProvider>
                <SettingsContext.Provider value={{settings, setSettings}}>
                    <ThemeContext.Provider value={{theme, setTheme, changesRef}}>
                        <SiteRouter/>
                    </ThemeContext.Provider>
                </SettingsContext.Provider>
            </ContentProvider>
        </AuthProvider>
    )
}

function SiteRouter() {
    const posts = useContext(ContentContext)
    return <Router>
        <ThemeSetter/>
        <LoadingScreen ready={posts !== null}>
            <div className="absolute w-full h-full">
                <AnimatedSwitch pathPreprocessor={(path) => {
                    if (path.split("/")[1] !== "view") {
                        path = "";
                    }
                    return path;
                } }>
                    <Route path="/view/:id" element={<View />} /> 
                    <Route path="*" element={<div className="w-full h-full">
                        <Background />
                        <AppContainer>
                            <NavigationBar />
                            <AnimatedSwitch pathPreprocessor={
                                // Prevent the animation from triggering when under navigating in the browse directory, since it already has a sliding animation
                                (path) => {
                                    if (path.split("/")[1] === "browse") {
                                        path = "browse";
                                    }
                                    return path;
                                } }>
                                <Route path="/" element={<Home />} />
                                <Route path="/browse" element={<ShowcaseView/>} />
                                <Route path="/browse/:id" element={<ShowcaseView/>} />
                                <Route path="/list" element={<ListView />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/edit/:id" element={<EditPost/>} />
                                <Route path="/uploadTest" element={<UploadAssetPage/>} />
                            </AnimatedSwitch>
                        </AppContainer>
                    </div>} />
                </AnimatedSwitch>
            </div>
        </LoadingScreen>
    </Router>;
}

function ThemeSetter() {
    const { theme, setTheme, changesRef } = useContext(ThemeContext)
    const posts = useContext(ContentContext)

    // Detect theme from url (perhaps better than using component logic)
    // Whenever URL changes or post list changes, update theme
    // Url rules: /browse/<id> : Get theme with post with id
    //            /edit/<id> : Get theme with post with id
    //            /view/<id> : Get theme with post with id
    //            Anything else: Use default theme

    const location = useLocation()
    const splitPath = location.pathname.split("/")
    useEffect(()=>{
        const id = splitPath[2]
        if (id && posts) {
            const post = posts.find(p => p.id === id)
            if (post?.data.theme) {
                if (changesRef.current <= 1) {
                    setTheme(removeThemeTransition(mergeThemes(defaultTheme, post.data.theme)))
                } else {
                    setTheme(mergeThemes(defaultTheme, post.data.theme))
                }
            }
        } else if (splitPath[1] === "browse" && splitPath[2] === undefined && posts && posts.length > 0) {
            setTheme(posts[0].data.theme)
        } else {
            setTheme(defaultTheme)
        }
    }, [location.pathname, posts])
    return null
}