import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import NavigationBar from "./components/NavigationBar"
import AppContainer from "./components/AppContainer"
import Home from "./components/Home"
import Spaces from "./components/Spaces"
import About from "./components/About"
import tw from "tailwind-styled-components"

const StyledNavLink = tw(NavLink)`text-m px-3 font-serif`

// Different views: map and list



export default function App() {
  return (
      <Router>
          <AppContainer>
          <NavigationBar>
              <StyledNavLink to="/">home</StyledNavLink>
              <StyledNavLink to="/spaces">spaces</StyledNavLink>
              <StyledNavLink to="/about">about</StyledNavLink>
          </NavigationBar>
          <Routes>
              <Route path="/" element={<Home/>}/>
              <Route path="/spaces" element={<Spaces/>}/>
              <Route path="/about" element={<About/>}/>
          </Routes>
          </AppContainer>
      </Router>
  )
}