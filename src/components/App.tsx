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
import { Post } from '../../api/types/Post';
import VaporAPI from '../api_client/api';
import { Instance } from '../../api/utility_types';
import Debug3D from './development/Debug3D';
import { CompatabilityWrapper } from './utilities/CompatabilityWrapper';

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
                {/* <CompatabilityWrapper> */}
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
                {/* </CompatabilityWrapper> */}
            </div>
        </LoadingScreen>
    </Router>;
}

function inferTheme(postInstance: Instance<Post>) {
    // First, we determine the URLs for possible background images / videos
    var backgroundImage: string | null = null;
    var backgroundVideo: string | null = null;
    // If there is a background image url specified in the theme object, use that; otherwise, find the first asset that is a image, and marked with a "background-image" tag.
    if (postInstance.data.theme.backgroundImage) {
        backgroundImage = postInstance.data.theme.backgroundImage;
    } else {
        const asset = postInstance.data.assets.find((asset) => asset.data.metadata.tags.includes("background-image") && asset.data.metadata.targetAssetType === "Image");
        if (asset) {
            if (asset?.data?.data?.fileName === undefined || asset?.data?.data?.fileName === null) {
                console.warn("Unreadable Image asset", asset);
            } else {
                backgroundImage = VaporAPI.resolveAsset(postInstance.id, asset.id)+asset.data.data.fileName;
            }
        }
    }
    // Same principle for background video.
    if (postInstance.data.theme.backgroundVideo) {
        backgroundVideo = postInstance.data.theme.backgroundVideo;
    } else {
        const asset = postInstance.data.assets.find((asset) => asset.data.metadata.tags.includes("background-video") && asset.data.metadata.targetAssetType === "Video"); // TODO: Create video asset
        if (asset) {
            if (asset?.data?.data?.fileName === undefined || asset?.data?.data?.fileName === null) {
                console.warn("Unreadable Video asset", asset);
            } else {
                backgroundVideo = VaporAPI.resolveAsset(postInstance.id, asset.id)+asset.data.data.fileName;
            }
        }
    }
    return {
        ...mergeThemes(defaultTheme, postInstance.data.theme),
        backgroundImage,
        backgroundVideo
    }
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
            // If a post is detected in the url, use that post's theme
            const post = posts.find(p => p.id === id)
            if (post?.data.theme) {
                if (changesRef.current <= 1) {
                    setTheme(removeThemeTransition(inferTheme(post)))
                } else {
                    setTheme(inferTheme(post))
                }
            }
        } else if (splitPath[1] === "browse" && splitPath[2] === undefined && posts && posts.length > 0) {
            // If we are in the browse directory without an id, use the first post's theme
            setTheme(inferTheme(posts[0]))
        } else {
            // Otherwise, use the default theme
            setTheme(defaultTheme)
        }
    }, [location.pathname, posts])
    return null
}