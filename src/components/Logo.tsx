import ChiLogo from "./svgs/chilogo.svg";
import EngLogo from "./svgs/englogo.svg";
import { ThemeContext } from "./App"
import { useContext } from 'react';
import { formatRGBCSS } from '../utilities';

function Logo() {
    const theme = useContext(ThemeContext);
    return (
        <div className="flex flex-row md:flex-col gap-4 pb-2 md:pr-3 justify-left">
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