import { useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../admin/AuthProvider';
import { SettingsContext, ThemeContext } from '../App';
import Logo from "./Logo"
import MagicDiv from './MagicDiv';
import { Condition, logOut } from '../../utilities';

function MultiLangNavLink({text, to, className="", ...props}) {
    const navigate = useNavigate();
    return <MagicDiv mergeTransitions={true} className={"nav-button"} languageSpecificChildren={text} onClick={()=>{
        navigate(to)
    }}/>
}

function LoggedInFilter({children}) {
    const {currentUser} = useContext(AuthContext);
    if (!!currentUser) {
        return children;
    }
    return null;
}

// Everything horizontally centered using Tailwind
export default function NavigationBar(props) {
    const {currentUser} = useContext(AuthContext)
    const {setSettings} = useContext(SettingsContext)
    const {setTheme} = useContext(ThemeContext)
    const navigate = useNavigate()
    return (
        // <div className="flex flex-col gap-2 pr-16"> DESKTOP
        <div className="flex flex-col gap-2 p-8 md:p-20 md:pr-8">
            <Logo />
            {/* <div className="flex justify-center flex-col"> DESKTOP*/} 
            <div className="flex justify-left flex-row md:flex-col">
                <LoggedInFilter>
                    <MultiLangNavLink text={{"en": "dashboard", "zh": "管理"}} to="/dashboard"/>
                </LoggedInFilter>
                <Condition condition={currentUser===null}>
                    <MultiLangNavLink text={{"en": "home", "zh": "首頁"}} to="/"/>
                    <MultiLangNavLink text={{"en": "browse", "zh": "瀏覽"}} to="/browse"/>
                    <MultiLangNavLink text={{"en": "list", "zh": "列表"}} to="/list"/>
                    <MultiLangNavLink text={{"en": "about", "zh": "關於"}} to="/about"/>
                </Condition>
                <LoggedInFilter>
                    <MagicDiv mergeTransitions={true} className="nav-button" onClick={()=>{
                        logOut()
                        navigate("/")
                    }} languageSpecificChildren={{"en": "log out", "zh": "登出"}}/>
                </LoggedInFilter>
                <MagicDiv mergeTransitions={true} className="nav-button" onClick={()=>{setSettings(
                    oldSettings => ({
                        ...oldSettings,
                        lang: oldSettings.lang === "en" ? "zh" : "en"
                    })
                )}}>中／eng</MagicDiv>
            </div>
            
        </div>
    )
}