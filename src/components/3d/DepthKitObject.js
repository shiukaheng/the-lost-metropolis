import { useLoader } from "@react-three/fiber";
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import DepthKitMaterial from "./materials/DepthKitMaterial";

//For building the geomtery
const VERTS_WIDE = 256;
const VERTS_TALL = 256;

var geometry = undefined

function DepthKitObject({videoUrl, metaUrl, posterUrl, autoplay=true, loop=false, muted=true, ...props}) {
    const mesh = useRef(null);
    const [video, setVideo] = useState(null);
    // Create video element
    useLayoutEffect(() => {
        setVideo(document.createElement("video"));
        video.crossOrigin = "anonymous"
        video.setAttribute('crossorigin', 'anonymous');
        video.setAttribute('webkit-playsinline', 'webkit-playsinline');
        video.setAttribute('playsinline', 'playsinline');
        video.src = videoUrl
        video.load()
    }, [videoUrl])
    // Make poster url reactive 
    useEffect(() => {
        if (video) {
            video.poster = posterUrl
        }
    }, [video, posterUrl])
    // Set autoplay, loop, muted
    useEffect(() => {
        if (video) {
            video.autoplay = autoplay
            video.loop = loop
            video.muted = muted
        }
    }, [video, autoplay, loop, muted])
    // Load props
    const props = useLoader(THREE.FileLoader, metaUrl, (loader)=>{
        loader.setResponseType('json')
    })
    const [geometry] = useState(()=>{
        if (!geometry) {
            buildGeomtery()
        }
        return geometry
    })
    return (
        <mesh ref={mesh} geometry={geometry}>
            <depthKitMaterial {...{
                width: props.textureWidth,
                height: props.textureHeight,
                mindepth: props.nearClip,
                maxdepth: props.farClip,
                focalLength: props.depthFocalLength,
                principalPoint: props.depthPrincipalPoint,
                imageDimensions: props.depthImageSize,
                crop: props.crop
            }}>
                <videoTexture attach="videoTexture" args={[video]} minFilter={THREE.NearestFilter} magFilter={THREE.LinearFilter} format={THREE.RGBFormat} generateMipmaps={false}/>
            </depthKitMaterial>
        </mesh>
    );
}

function buildGeomtery() {

    geometry = new THREE.Geometry();

    for (let y = 0; y < VERTS_TALL; y++) {
        for (let x = 0; x < VERTS_WIDE; x++) {
            geometry.vertices.push(new THREE.Vector3(x, y, 0));
        }
    }
    for (let y = 0; y < VERTS_TALL - 1; y++) {
        for (let x = 0; x < VERTS_WIDE - 1; x++) {
            geometry.faces.push(
                new THREE.Face3(
                    x + y * VERTS_WIDE,
                    x + (y + 1) * VERTS_WIDE,
                    (x + 1) + y * (VERTS_WIDE)
                ));
            geometry.faces.push(
                new THREE.Face3(
                    x + 1 + y * VERTS_WIDE,
                    x + (y + 1) * VERTS_WIDE,
                    (x + 1) + (y + 1) * (VERTS_WIDE)
                ));
        }
    }
}

export default DepthKitObject;