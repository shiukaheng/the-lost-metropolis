import { useLocation,Routes } from "react-router";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { FC } from "react";

const AnimatedSwitch:FC = ({pathPreprocessor=(path)=>{return path}, ...props}) => {
    const location = useLocation();
    var path = pathPreprocessor(location.pathname)
    return (
    <SwitchTransition component={null}>
      <CSSTransition key={path} classNames="page-transition" timeout={250}>
        <Routes location={location}>
          {props.children}
        </Routes>
      </CSSTransition>
    </SwitchTransition>
    );
  };

export default AnimatedSwitch;