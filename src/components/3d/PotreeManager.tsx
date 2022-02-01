import { Potree } from '@pnext/three-loader';
import { useFrame } from '@react-three/fiber';
import { createContext, useEffect, useRef, ReactNode, useState } from 'react';
const PotreeContext = createContext(null)
const defaultPointBudget = 100000

type PotreeManagerProps = {
    pointBudget?: number
    children: ReactNode
}

function PotreeManager({pointBudget=defaultPointBudget, children}:PotreeManagerProps) {
    // Using useRef to maintain non-state variable across renders
    const {current: potree} = useRef(new Potree())
    const [pointClouds, setPointClouds] = useState({})
    const setPointCloud = (cloud, childID) => {setPointClouds((oldPointClouds)=>{oldPointClouds[childID] = cloud; return oldPointClouds})}
    useFrame((state, delta) => {
        potree.updatePointClouds(Object.values(pointClouds).filter(x => (x !== null && x !== undefined)), state.camera, state.gl)
    })
    // Manually update potree properties when pointBudget prop changes
    useEffect(()=>{
        potree.pointBudget = pointBudget
    }, [potree, pointBudget])
    return (
        <PotreeContext.Provider value={{potree, pointClouds, setPointClouds, setPointCloud}}>
            {children}
        </PotreeContext.Provider>
    );
}

export {PotreeManager, PotreeContext}