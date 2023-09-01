import { PotreeObject } from '../3d/PotreeObject'
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
            {/* Red box with mesh basic shading */}
            <PotreeObject
                objectID='potree'
                cloudName='metadata.json'
                baseUrl='https://192.168.0.153:8080/assets/hoi_kee_street/'
                position={[-51.804087330505155,-0.4042027022090835,69.38336126263323]}
                rotation={[-1.57079633,0,0]}
            />  
        </View>
    )
}

export default Exhibition