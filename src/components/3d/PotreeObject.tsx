import { useContext, useEffect, useRef, useState } from "react";
import { PotreeContext } from "./managers/PotreeManager";

type PotreeObjectProps = JSX.IntrinsicElements["group"] & {
    cloudName?: string
    baseUrl: string
    pointSize?: number
    pointSizeType?: number
    pointShape?: number
}

function PotreeObject({cloudName="cloud.js", baseUrl, pointSize=1, pointSizeType=1, pointShape=0, id, ...props}:PotreeObjectProps) {
    const {potree, setPointCloud: setManagerPointCloud} = useContext(PotreeContext)
    const [pointCloud, setPointCloud] = useState(null)
    const objectGroup = useRef(null)
    const isValid = useRef(true)

    // Use useEffect to update pointCloud variable on cloudName, baseUrl changes
    useEffect(()=>{
        // Request new point with new cloudName and baseUrl asynchronously, then update pointCloud. In the asynchrnous callback, check if isValid is true. If it is, set pointCloud to the new pointCloud.
        const loadNewPointCloud = async () => {
            try {
                const newPointCloud = await potree.loadPointCloud(cloudName, relativeUrl => `${baseUrl}${relativeUrl}`)
                if (isValid.current) {
                    // Update manager references
                    setManagerPointCloud(newPointCloud, id)
                    // Update self references
                    setPointCloud(newPointCloud)
                    // Clear old point cloud
                    objectGroup.current.remove(objectGroup.current.children[0])
                    // Add new point cloud
                    objectGroup.current.add(newPointCloud)
                }
            } catch (e) {
                console.warn("Failed to acquire cloud", e)
            }
        }
        loadNewPointCloud()
        return ()=>{
            setManagerPointCloud(null, id)
        }
    }, [cloudName, baseUrl])
    useEffect(() => {
        // Get last element in pointCloudBuffer
        if (pointCloud) {
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