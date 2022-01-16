import { useLocation,Routes } from "react-router";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { FC } from "react";

const AnimatedSwitch:FC = ({...props}) => {
    const location = useLocation();
    var path = location.pathname
    // Prevent the animation from triggering when under navigating in the browse directory, since it already has a sliding animation
    if (path.split("/")[1]==="browse") {
        path = "browse"
    }
    return (
    <SwitchTransition component={null}>
      <CSSTransition key={location.pathname.split("/")[1]} classNames="page-transition" timeout={250}>
        <Routes location={location}>
          {props.children}
        </Routes>
      </CSSTransition>
    </SwitchTransition>
    );
  };

export default AnimatedSwitch;