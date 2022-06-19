import { Fragment, useEffect, useRef, useState } from "react";
import { useEventListener } from "../../../utilities";

function useBasicKeypress(keyName="", onDown=()=>{}, onUp=()=>{}) {
    const downRef = useRef(false);
    const [isDown, setIsDown] = useState(false);
    useEventListener("keydown", (e)=>{
        if (e.key.toLowerCase() === keyName.toLowerCase()) {
            if (!downRef.current) {
                downRef.current = true;
                setIsDown(true);
                onDown();
            }
        }
    });
    useEventListener("keyup", (e)=>{
        if (e.key.toLowerCase() === keyName.toLowerCase()) {
            if (downRef.current) {
                downRef.current = false;
                setIsDown(false);
                onUp();
            }
        }
    });
    return isDown;
}

function BasicKeypress({keyName, onDown, onUp}) {
    useBasicKeypress(keyName, onDown, onUp);
    return null
}

export function Keypress({keyName, onDown=()=>{}, onUp=()=>{}, requiredKeys=[]}:
    {keyName: string, onDown?: ()=>void, onUp?: ()=>void, requiredKeys?: string[]}) {
    const requiredKeysState = useRef({}) 
    useEffect(()=>{
        // initiate any undefined keys in the requiredKeysState object.
        requiredKeys.forEach(key=>{
            if (!requiredKeysState.current[key]) {
                requiredKeysState.current[key] = false;
            }
        });
        // clear any keys that are no longer required.
        Object.keys(requiredKeysState.current).forEach(key=>{
            if (!requiredKeys.includes(key)) {
                delete requiredKeysState.current[key];
            }
        });
    }, [requiredKeys])
    const down = useRef(false)
    useBasicKeypress(keyName,
        // Trigger onDown if all required keys are down.
        ()=>{
            // Use every method
            if (Object.values(requiredKeysState.current).every(v=>v)) {
                onDown();
                down.current = true;
            }
        },
        // Trigger onUp anyway.
        ()=>{
            onUp();
            down.current = false;
        }
    );
    // Use BasicKeypress to dynamically create handlers for required keys.
    return (
        <Fragment>
            {requiredKeys.map((keyName, i)=>(
                <BasicKeypress key={i} keyName={keyName} onDown={()=>{
                    requiredKeysState.current[keyName] = true;
                }} onUp={()=>{
                    requiredKeysState.current[keyName] = false;
                }}/>
            ))}
        </Fragment>
    )
}