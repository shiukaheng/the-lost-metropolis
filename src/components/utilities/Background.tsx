import { ThemeContext } from "../App";
import { useContext, useEffect, useRef, useState } from "react";
import { formatRGBCSS } from "../../utilities";
import { SwitchTransition, CSSTransition } from "react-transition-group";
import {isEqual} from "lodash"


function Background() {
    const {theme} = useContext(ThemeContext);
    // Animate background video changes when theme changes
    // const [key, setKey] = useState(0)
    // const oldThemeRef = useRef(null)
    // useEffect(() => {
    //     if (!isEqual(oldThemeRef.current, theme)) {
    //         setKey((key + 1)%2)
    //         oldThemeRef.current = theme
    //         console.log("changed")
    //     }
    // }, [theme])

    return ( 
        <div className="absolute w-full h-full overflow-clip" style={{
            backgroundColor: formatRGBCSS(theme.backgroundColor),
            transition: `background-color ${theme.transitionDuration}s`
        }}>
            <SwitchTransition>
                <CSSTransition key={theme.backgroundImage} classNames="background-transition" timeout={500}>
                    <div className="w-full h-full">
                        <div className="w-full h-full" style={{
                        opacity: theme.backgroundOpacity,
                        }}>
                            {
                                // If theme.backgroundVideo is not null, render it; otherwise if theme.backgroundImage is not null, render it, otherwise render nothing. Video and images use object cover.
                                theme.backgroundVideo ?
                                <video autoPlay loop muted className="w-full h-full object-cover" >
                                    <source src={theme.backgroundVideo} type="video/mp4" />
                                </video>
                                : theme.backgroundImage ?
                                <img src={theme.backgroundImage} className="w-full h-full object-cover" />
                                : null
                            }
                        </div>
                    </div>
                </CSSTransition>
            </SwitchTransition>
        </div>
    );
}

export default Background;