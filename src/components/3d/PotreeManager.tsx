import { Potree } from '@pnext/three-loader';
import { useFrame } from '@react-three/fiber';
import { createContext, useEffect, useRef, ReactNode } from 'react';
const PotreeContext = createContext(null)
const defaultPointBudget = 100000

type PotreeManagerProps = {
    pointBudget?: number
    children: ReactNode
}

function PotreeManager({pointBudget=defaultPointBudget, children}:PotreeManagerProps) {
    // Using useRef to maintain non-state variable across renders
    const {current: potree} = useRef(new Potree())
    const {current: pointClouds} = useRef([])
    window.pointclouds = pointClouds
    useFrame((state, delta) => {
        potree.updatePointClouds(pointClouds, state.camera, state.gl)
    })
    // Manually update potree properties when pointBudget prop changes
    useEffect(()=>{
        potree.pointBudget = pointBudget
    }, [potree, pointBudget])
    return (
        <PotreeContext.Provider value={{potree: potree, pointClouds: pointClouds}}>
            {children}
        </PotreeContext.Provider>
    );
}

export {PotreeManager, PotreeContext}