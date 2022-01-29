import { useState, useEffect, useRef } from "react"

function formatRGBCSS(color: number[]): string {
    return "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
}

function useKeyPress(targetKey) {
    // State for keeping track of whether key is pressed
    const [keyPressed, setKeyPressed] = useState<boolean>(false);
    // If pressed key is our target key then set to true
    function downHandler({ key }) {
        if (key === targetKey) {
            setKeyPressed(true);
        }
    }
    // If released key is our target key then set to false
    const upHandler = ({ key }) => {
        if (key === targetKey) {
            setKeyPressed(false);
        }
    };
    // Add event listeners
    useEffect(() => {
        window.addEventListener("keydown", downHandler);
        window.addEventListener("keyup", upHandler);
        // Remove event listeners on cleanup
        return () => {
            window.removeEventListener("keydown", downHandler);
            window.removeEventListener("keyup", upHandler);
        };
        }, []); // Empty array ensures that effect is only run on mount and unmount
    return keyPressed;
}

function useAsyncKeyPress(targetKey, onKeyDownRef, onKeyUpRef) {
    // State for keeping track of whether key is pressed
    const [keyPressed, setKeyPressed] = useState<boolean>(false);
    // If pressed key is our target key then set to true
    function downHandler({ key }) {
        if (key === targetKey) {
            setKeyPressed(true);
            onKeyDownRef.current();
        }
    }
    // If released key is our target key then set to false
    const upHandler = ({ key }) => {
        if (key === targetKey) {
            setKeyPressed(false);
            onKeyUpRef.current();
        }
    };
    // Add event listeners
    useEffect(() => {
        window.addEventListener("keydown", downHandler);
        window.addEventListener("keyup", upHandler);
        // Remove event listeners on cleanup
        return () => {
            window.removeEventListener("keydown", downHandler);
            window.removeEventListener("keyup", upHandler);
        };
        }, []); // Empty array ensures that effect is only run on mount and unmount
    return keyPressed;
}

function useAsyncReference(value) {
    const ref = useRef(value);
    const [, forceRender] = useState(false);
  
    const updateState = (newState) => {
        ref.current = newState;
        forceRender(s => !s);
    }
  
    return [ref, updateState];
}

function KeyPressCallback({keyName, onDown=()=>{}, onUp=()=>{}}) {
    const onDownRef = useRef(null)
    const onUpRef = useRef(null)
    useEffect(()=>{
        onDownRef.current = onDown
        onUpRef.current = onUp
    }, [onDown, onUp])
    useAsyncKeyPress(keyName, onDownRef, onUpRef)
    return (null)
}

export { formatRGBCSS, useKeyPress, useAsyncKeyPress, useAsyncReference, KeyPressCallback };