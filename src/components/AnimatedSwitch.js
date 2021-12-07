import { useLocation,Routes } from "react-router";
import { CSSTransition, SwitchTransition } from "react-transition-group";

const AnimatedSwitch = ({...props}) => {
    const location = useLocation();
    return (
    <SwitchTransition component={null}>
      <CSSTransition key={location.key} classNames="page-transition" timeout={500}>
        <Routes location={location}>
          {props.children}
        </Routes>
      </CSSTransition>
    </SwitchTransition>
    );
  };

export default AnimatedSwitch;