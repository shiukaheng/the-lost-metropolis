// import { Potree } from '@pnext/three-loader';
import { Potree } from "potree-loader"
import { useFrame } from '@react-three/fiber';
import { createContext, useEffect, useRef, ReactNode, useState, useContext } from 'react';
import { ViewerContext } from '../../viewer/ViewerContext';
import { Object3D } from "three"
const PotreeContext = createContext(null)

type PotreeManagerProps = {
    children: ReactNode
}

function PotreeManager({children}:PotreeManagerProps) {
    // Using useRef to maintain non-state variable across renders
    const {current: potree} = useRef(new Potree())
    const {potreePointBudget, potreeOptimisePointBudget} = useContext(ViewerContext)
    const [pointClouds, setPointClouds] = useState({})
    const frameTimeRef = useRef([])
    // Set target framerate at 60fps
    const [targetFrameRate, setTargetFrameRate] = useState(60)
    const setPointCloud = (cloud: Object3D, childID:string) => {setPointClouds((oldPointClouds)=>{oldPointClouds[childID] = cloud; return oldPointClouds})}
    useFrame((state, delta) => {
        potree.updatePointClouds(Object.values(pointClouds).filter(x => (x !== null && x !== undefined)), state.camera, state.gl)
    })
    // Manually update potree properties when pointBudget prop changes
    useEffect(()=>{
        potree.pointBudget = potreePointBudget
    }, [potree, potreePointBudget])
    // Automatically increase or decrease pointBudget depending on frame rate
    // Keep a running average of the last 10 frames, and use that to determine if we should increase or decrease the point budget
    useFrame(({gl}) => {
        // Todo: add viewer potreeOptimisePointBudget
        if (!potreeOptimisePointBudget) return
        const frameTime = gl.getFrameTime() // This is not actually available. Stupid Github Copilot.
        frameTimeRef.current.push(frameTime)
        if (frameTimeRef.current.length > 10) {
            frameTimeRef.current.shift()
        }
        const avgFrameTime = frameTimeRef.current.reduce((a,b)=>a+b)/frameTimeRef.current.length
        if (1/avgFrameTime < targetFrameRate) {
            potree.pointBudget += 100
        } else {
            potree.pointBudget -= 100
        }
    })
    return (
        <PotreeContext.Provider value={{potree, pointClouds, setPointClouds, setPointCloud}}>
            {children}
        </PotreeContext.Provider>
    );
}

export {PotreeManager, PotreeContext}