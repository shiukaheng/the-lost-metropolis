import { Transition } from 'react-transition-group';

export const ConditionalFade = ({ in: inProp, duration=200 }) => {
    const defaultStyle = {
        transition: `opacity ${duration}ms ease-in-out`,
        opacity: 0,
    }
    
    const transitionStyles = {
        entering: { opacity: 1 },
        entered:  { opacity: 1 },
        exiting:  { opacity: 0 },
        exited:  { opacity: 0 },
    };
    
    return(
        <Transition in={inProp} timeout={duration}>
        {state => (
            <div style={{
            ...defaultStyle,
            ...transitionStyles[state]
            }}>
            I'm a fade Transition!
            </div>
        )}
        </Transition>
    )
    
};