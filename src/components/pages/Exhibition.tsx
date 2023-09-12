import { PotreeObject } from '../3d/PotreeObject'
import { AnimatedScenesManager } from '../3d/managers/ScenesManager'
import View from './View'

function Exhibition() {
    return (
        <View defaultCameraProps={
            {
                position: [0,0,0],
                rotation: [0,0,0],
                fov: 90
            }
        }>
            <ambientLight intensity={1} />
            <AnimatedScenesManager scenes={["A", "B"]} interval={20000}>
                <PotreeObject
                    objectID='potree'
                    cloudName='metadata.json'
                    baseUrl='https://192.168.0.153:8080/assets/hoi_kee_street/'
                    position={[-51.804087330505155,-0.4042027022090835,69.38336126263323]}
                    rotation={[-1.57079633,0,0]}
                    sceneID="A" 
                />  
                <PotreeObject
                    objectID='potree2'
                    cloudName='metadata.json'
                    baseUrl='https://192.168.0.153:8080/assets/cha_kwo_ling_night/'
                    position={[13.5,24.6,-7]}
                    rotation={[-1.57079633,0,0]}
                    sceneID="B"
                />  
            </AnimatedScenesManager>
        </View>
    )
}

export default Exhibition