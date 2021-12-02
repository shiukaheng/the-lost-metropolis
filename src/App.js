import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import NavigationBar from "./components/NavigationBar"
import AppContainer from "./components/AppContainer"
import Home from "./components/Home"
import About from "./components/About"
import tw from "tailwind-styled-components"
import ShowcaseContentList from "./components/ShowcaseContentList";
import ShowcaseContent from "./components/ShowcaseContent";
// import { useState } from "react";

// Different views: map and list

const content_array = [
    {
        "title_english": "The State Theatre Reborn",
        "title_chinese": "皇都再世",
        "description_english": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Quasi, quisquam.",
        "description_chinese": "",
        "time_posted": "2020-05-01",
        "id": "state_theatre"
    },
    {
        "title_english": "The Salon",
        "title_chinese": "皇都再世 2",
        "description_english": " 2 Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Quasi, quisquam. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Quasi, quisquam. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Quasi, quisquam. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Quasi, quisquam. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Quasi, quisquam. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem. Quasi, quisquam.",
        "description_chinese": "",
        "time_posted": "2020-05-02",
        "id": "salon"
    }
]

export default function App() {
    const StyledNavLink = tw(NavLink)`text-m mr-3 md:mr-0 font-serif font-bold md:hover:opacity-50 transition-opacity duration-500 `
    return (
        <Router>
            <AppContainer>
            <NavigationBar>
                <StyledNavLink to="/">home</StyledNavLink>
                <StyledNavLink to="/browse">browse</StyledNavLink>
                <StyledNavLink to="/list">list</StyledNavLink>
                <StyledNavLink to="/about">about</StyledNavLink>
                {/* <button className="text-m mr-3 md:mr-0 font-serif font-bold md:hover:opacity-50 duration-500 text-left" onClick={()=>{setAnim(!anim)}}>test-anim</button> */}
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
  )
}