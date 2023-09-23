import { useLoader } from "@react-three/fiber";
import { useCallback, useContext, useEffect, useRef } from "react";
import { AudioLoader } from "three";
import { ViewerContext } from "../viewer/ViewerContext";

function useAudioContext() {
    const { audioListener } = useContext(ViewerContext)
    return audioListener?.context
}

function usePlayAudio(buffer, discardTime=120) {
    const context = useAudioContext()
    return useCallback((volume) => {
        if (buffer && context) {
            const source = context.createBufferSource()
            const gainNode = context.createGain()
            source.buffer = buffer
            gainNode.gain.value = volume
            source.connect(gainNode)
            gainNode.connect(context.destination)
            source.start()
            // Use discardTime (seconds) to set a timeout before culling the nodes from the WebAudio API to free resources
            setTimeout(() => {
                try {
                    source.stop()
                    source.disconnect()
                    gainNode.disconnect()
                } catch (e) {
                    console.warn(e)
                }
            }, discardTime * 1000)
            return source
        } else {
            console.warn("Buffer or context not ready", buffer, context)
        }
    }, [buffer, context, discardTime])
}

function useExperienceStart(callback) {
    const lastScenesHasIdle = useRef(true)
    const { scenes } = useContext(ViewerContext)
    useEffect(()=>{
        try {
            if (scenes) {
                const scenesHasIdle = scenes.includes("idle")
                if (lastScenesHasIdle.current && !scenesHasIdle) {
                    callback()
                    console.log("Experience start triggered")
                }
                lastScenesHasIdle.current = scenesHasIdle
            }
        } catch (e) {
            console.warn(e)
        }
    }, [scenes, callback])
}

export function TransitionalSoundObject({url, volume}: {url: string, volume: number}) {
    // This is a R3F component. On mount, we load the URL into a buffer.
    const audio = useLoader(AudioLoader, url)
    // Let's get the Three.js context
    const play = usePlayAudio(audio)
    // Trigger audio play on scene 
    useExperienceStart(()=>{
        play(volume)
    })
}