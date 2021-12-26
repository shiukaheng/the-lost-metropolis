import { useContext, useEffect, useRef } from "react";
import { PotreeContext } from "./PotreeManager";

function PotreeObject({cloudName="cloud.js", baseUrl, ...props}) {
    const {potree, pointClouds} = useContext(PotreeContext)
    const pointCloudRef = useRef(null)
    const objectGroup = useRef(null)
    useEffect(() => {
        // remove current cloud from pointClouds (if existing)
        const removeCurrentPointCloud = () => {
            if (pointCloudRef.current !== null) { // If a cloud exists already, remove it.
                const oldCloud = pointCloudRef.current
                oldCloud.removeFromParent()
                const index = pointClouds.indexOf(oldCloud)
                if (index !== -1) {
                    pointClouds.splice(index)
                }
            }
        }
        const loadNewPointCloud = async () => {
            const newCloud = await potree.loadPointCloud(cloudName, relativeUrl => `${baseUrl}${relativeUrl}`)
            pointCloudRef.current = newCloud
            pointClouds.push(newCloud)
            objectGroup.current.add(newCloud)
        }
        loadNewPointCloud()
        // return function that removes current pointClouds on unmount
        return () => {
            removeCurrentPointCloud() // POTENTIAL BUG: If loadNewPointCloud was invoked and not completed and the component was unmounted, object may not be removed from pointClouds array
        }
    }, [cloudName, baseUrl, potree, pointClouds])
    return ( 
        <group ref={objectGroup} {...props}></group>
    );
}

export default PotreeObject;