import { ThemeContext } from "../App";
import { useContext } from "react";


function Background() {
    const theme = useContext(ThemeContext);
    return ( 
        <div className="absolute w-full h-full" style={{
            backgroundColor: theme.background,
            transition: `background-color ${theme.transitionDuration}s`
        }}></div>
    );
}

export default Background;