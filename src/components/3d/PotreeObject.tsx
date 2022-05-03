import { useContext, useEffect, useRef, useState } from "react";
import { NumberType, StringType, URLType } from "../viewer/ArgumentTypes";
import { VaporComponent, VaporComponentProps } from "../viewer/ComponentDeclarations";
import { genericInputs } from "../viewer/genericInputs"
import { PotreeContext } from "./managers/PotreeManager";
import { v4 } from "uuid"

type PotreeObjectProps = VaporComponentProps & {
    cloudName?: string
    baseUrl: string
    pointSize?: number
    pointSizeType?: number
    pointShape?: number
    getUrl?: (string) => string
}

export const PotreeObject: VaporComponent = ({cloudName="cloud.js", baseUrl, pointSize=1, pointSizeType=2, pointShape=2, getUrl, ...props}:PotreeObjectProps) => {
    const {potree, setPointCloud: setManagerPointCloud} = useContext(PotreeContext)
    const [pointCloud, setPointCloud] = useState(null)
    const objectGroup = useRef(null)
    const isValid = useRef(true)
    const cloudIDRef = useRef<string>(null)
    const defaultGetUrl = (relativeUrl) => {
        return `${baseUrl}${relativeUrl}`
    }
    console.log(potree)

    // Use useEffect to update pointCloud variable on cloudName, baseUrl changes
    useEffect(()=>{
        cloudIDRef.current = v4()
        // Request new point with new cloudName and baseUrl asynchronously, then update pointCloud. In the asynchrnous callback, check if isValid is true. If it is, set pointCloud to the new pointCloud.
        const loadNewPointCloud = async () => {
            try {
                const newPointCloud = await potree.loadPointCloud(cloudName, getUrl || defaultGetUrl)
                if (isValid.current) {
                    // Update manager references
                    setManagerPointCloud(newPointCloud, cloudIDRef.current)
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
            setManagerPointCloud(null, cloudIDRef.current)
        }
    }, [cloudName, baseUrl])
    useEffect(() => {
        // Get last element in pointCloudBuffer
        // window.pco = pointCloud
        if (pointCloud) {
            pointCloud.material.size = pointSize
            pointCloud.pointSizeType = pointSizeType
            pointCloud.material.shape = pointShape
        }
    }, [pointSize, pointSizeType, pointShape, pointCloud])
    //
    return ( 
        <group ref={objectGroup} {...props}></group>
    );
}

PotreeObject.displayName = "Potree object"
PotreeObject.componentType = "PotreeObject"
PotreeObject.inputs = {
    ...genericInputs,
    cloudName: {
        type: StringType,
        default: "cloud.js"
    },
    baseUrl: {
        type: URLType,
        default: "http://localhost/"
    },
    pointSize: {
        type: NumberType,
        default: 1
    }
}