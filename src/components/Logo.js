import { ReactComponent as ChiLogo } from '../chilogo.svg';
import { ReactComponent as EngLogo } from '../englogo.svg';
import { ThemeContext } from "../App"
import { useContext } from 'react';

function Logo() {
    const theme = useContext(ThemeContext);
    return (
        <div className="flex flex-row md:flex-col gap-4 pb-2 md:pr-3 justify-left">
            <ChiLogo className="h-12 md:h-auto md:w-36 fill-current relative" style={{
                fill: theme.foreground,
                transition: `fill ${theme.transitionDuration}s`
            }}/>
            <EngLogo className="h-12 md:h-auto md:w-36 fill-current relative" style={{
                fill: theme.foreground,
                transition: `fill ${theme.transitionDuration}s`
            }}/>
        </div>
    )
}

export default Logo