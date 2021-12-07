import { ThemeContext } from "../App";
import { useContext } from "react";
import { formatRGBCSS } from "../utilities";


function Background() {
    const theme = useContext(ThemeContext);
    return ( 
        <div className="absolute w-full h-full" style={{
            backgroundColor: formatRGBCSS(theme.backgroundColor),
            transition: `background-color ${theme.transitionDuration}s`
        }}></div>
    );
}

export default Background;