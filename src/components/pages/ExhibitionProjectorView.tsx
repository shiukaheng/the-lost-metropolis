import { useLoader } from '@react-three/fiber';
import View, { ProjectorView } from './View'
import { FileLoader } from 'three';
import { usePost } from '../../utilities';
import { useProjectorInfo } from '../viewer/ViewportCanvas';
import { useMemo } from 'react';

function ExhibitionProjectorView() {
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
        <div className="w-full h-full absolute">
            <ProjectorView defaultCameraProps={
                {
                    position: [0,0,0],
                    rotation: [0,0,0],
                    fov: 90
                }
            }
            post={localPost || post}
            >
                    {/* <fog attach="fog" args={['red', 5, 10]} /> */}

            </ProjectorView>
            {/* This needs to be a radial gradient mask (vignette) */}
            <div className="absolute top-0 left-0 w-full h-full" style={{
                background: 'radial-gradient(circle at center, transparent 40%, black 100%)'
            }}>
                
            </div>
        </div>
    )
}

export default ExhibitionProjectorView