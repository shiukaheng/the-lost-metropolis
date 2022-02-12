import { Potree } from '@pnext/three-loader';
import { useFrame } from '@react-three/fiber';
import { createContext, useEffect, useRef, ReactNode, useState, useContext } from 'react';
import { ViewerContext } from '../../viewer/ViewerContext';
const PotreeContext = createContext(null)

type PotreeManagerProps = {
    children: ReactNode
}

function PotreeManager({children}:PotreeManagerProps) {
    // Using useRef to maintain non-state variable across renders
    const {current: potree} = useRef(new Potree())
    const {potreePointBudget} = useContext(ViewerContext)
    const [pointClouds, setPointClouds] = useState({})
    const setPointCloud = (cloud, childID) => {setPointClouds((oldPointClouds)=>{oldPointClouds[childID] = cloud; return oldPointClouds})}
    useFrame((state, delta) => {
        potree.updatePointClouds(Object.values(pointClouds).filter(x => (x !== null && x !== undefined)), state.camera, state.gl)
    })
    // Manually update potree properties when pointBudget prop changes
    useEffect(()=>{
        potree.pointBudget = potreePointBudget
    }, [potree, potreePointBudget])
    return (
        <PotreeContext.Provider value={{potree, pointClouds, setPointClouds, setPointCloud}}>
            {children}
        </PotreeContext.Provider>
    );
}

export {PotreeManager, PotreeContext}