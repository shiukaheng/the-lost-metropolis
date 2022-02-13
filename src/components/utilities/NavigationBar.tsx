import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import { logOut } from '../../api';
import { AuthContext } from '../admin/AuthProvider';
import { SettingsContext } from '../App';
import Logo from "./Logo"
import MagicDiv from './MagicDiv';

function MultiLangNavLink({text, to, ...props}) {
    const navigate = useNavigate();
    return <MagicDiv mergeTransitions={true} className={"nav-button"} languageSpecificChildren={text} onClick={()=>{
        navigate(to)
    }}/>
}

// Everything horizontally centered using Tailwind
export default function NavigationBar(props) {
    const {currentUser} = useContext(AuthContext)
    const {setSettings} = useContext(SettingsContext)
    console.log(!!currentUser)
    return (
        // <div className="flex flex-col gap-2 pr-16"> DESKTOP
        <div className="flex flex-col gap-2 p-8 md:p-20 md:pr-8">
            <Logo />
            {/* <div className="flex justify-center flex-col"> DESKTOP*/} 
            <div className="flex justify-left flex-row md:flex-col">
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
                {
                    !!currentUser ?
                    <MagicDiv mergeTransitions={true} className="nav-button" onClick={()=>{
                        logOut()
                    }} text={{"en": "log out", "zh": "登出"}}/>
                    :
                    null
                }
            </div>
            
        </div>
    )
}