import { useLoader } from '@react-three/fiber';
import { PotreeObject } from '../3d/PotreeObject'
import { AnimatedScenesManager } from '../3d/managers/ScenesManager'
import View from './View'
import { FileLoader } from 'three';
import { usePost } from '../../utilities';

function Exhibition() {
    const [localPost, _] = usePost("web_exhibition", false) // Check if there is a local override
    // @ts-ignore - It works lol
    let post = undefined
    try {
        post = useLoader(FileLoader, "assets/web_exhibition.json", (loader) => {
            // @ts-ignore - Bad types! If I don't use this, it doesn't work
            loader.setResponseType("json");
        })
    } catch (e) {
        console.warn("Could not load exhibition file")
    }
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
                {/* <fog attach="fog" args={['red', 5, 10]} /> */}

        </View>
    )
}

export default Exhibition