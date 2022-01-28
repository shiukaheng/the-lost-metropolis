import { useFrame } from "@react-three/fiber";
import { useContext, useEffect, useRef, useLayoutEffect, useState } from "react";
import { PotreeContext } from "./PotreeManager";

type PotreeObjectProps = JSX.IntrinsicElements["group"] & {
    cloudName?: string
    baseUrl: string
    pointSize?: number
    pointSizeType?: number
    pointShape?: number
}

function PotreeObject({cloudName="cloud.js", baseUrl, pointSize=1, pointSizeType=1, pointShape=0, ...props}:PotreeObjectProps) {
    const {potree, pointClouds} = useContext(PotreeContext)
    const [pointCloud, setPointCloud] = useState(null)
    const objectGroup = useRef(null)
    useEffect(() => {
        // remove current cloud from pointClouds (if existing)
        const removeCurrentPointCloud = () => {
            if (pointCloud !== null) { // If a cloud exists already, remove it.
                const oldCloud = pointCloud
                oldCloud.removeFromParent()
                const index = pointClouds.indexOf(oldCloud)
                if (index !== -1) {
                    pointClouds.splice(index)
                }
            }
        }
        const loadNewPointCloud = async () => {
            const newCloud = await potree.loadPointCloud(cloudName, relativeUrl => `${baseUrl}${relativeUrl}`)
            setPointCloud(newCloud)
            pointClouds.push(newCloud)
            objectGroup.current.add(newCloud)
        }
        loadNewPointCloud()
        // return function that removes current pointClouds on unmount
        return () => {
            removeCurrentPointCloud() // POTENTIAL BUG: If loadNewPointCloud was invoked and not completed and the component was unmounted, object may not be removed from pointClouds array
        }
    }, [cloudName, baseUrl, potree, pointClouds])
    useEffect(() => {
        if (pointCloud !== null) {
            pointCloud.material.size = pointSize
            pointCloud.material.pointSizeType = pointSizeType
            pointCloud.material.shape = pointShape
        }
    }, [pointSize, pointSizeType, pointShape, pointCloud])
    //
    return ( 
        <group ref={objectGroup} {...props}></group>
    );
}

export default PotreeObject;