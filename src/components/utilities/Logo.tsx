import { ReactComponent as ChiLogo } from "../svgs/chilogo.svg";
import { ReactComponent as EngLogo } from "../svgs/englogo.svg";
import { ThemeContext } from "../App"
import { useContext, useRef } from 'react';
import { formatRGBCSS } from '../../utilities';
import { useNavigate } from "react-router-dom";

function Logo() {
    const {theme} = useContext(ThemeContext);
    const navigate = useNavigate()
    const clickCountRef = useRef(0);
    return (
        <div className="flex flex-row md:flex-col gap-4 pb-2 md:pr-3 justify-left" onClick={()=>{
            clickCountRef.current++;
            if (clickCountRef.current === 5) {
                clickCountRef.current = 0;
                navigate("/login");
            }
        }}>
            <ChiLogo className="h-12 md:h-auto md:w-36 fill-current relative" style={{
                fill: formatRGBCSS(theme.foregroundColor),
                transition: `fill ${theme.transitionDuration}s`
            }}/>
            <EngLogo className="h-12 md:h-auto md:w-36 fill-current relative" style={{
                fill: formatRGBCSS(theme.foregroundColor),
                transition: `fill ${theme.transitionDuration}s`
            }}/>
        </div>
    )
}

export default Logo