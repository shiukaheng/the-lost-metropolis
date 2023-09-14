import { useLoader } from '@react-three/fiber';
import { PotreeObject } from '../3d/PotreeObject'
import { AnimatedScenesManager } from '../3d/managers/ScenesManager'
import View from './View'
import { FileLoader } from 'three';
import { usePost } from '../../utilities';

function Exhibition() {
    console.log("Exhibition")
    const [localPost, _] = usePost("web_exhibition", false)
    const post = useLoader(FileLoader, "https://192.168.0.153:8080/assets/web_exhibition.json", (loader) => {
        loader.setResponseType("json");
    })
    console.log(localPost || post)
    return (
        <View defaultCameraProps={
            {
                position: [0,0,0],
                rotation: [0,0,0],
                fov: 90
            }
        }
        post={localPost || post}
        >
        </View>
    )
}

export default Exhibition