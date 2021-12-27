import { useLoader } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";

//For building the geomtery
const VERTS_WIDE = 256;
const VERTS_TALL = 256;

var geometry = undefined

function DepthKitObject({videoUrl="", metaUrl="", posterUrl="", autoplay=true, loop=false, muted=true, ...props}) {
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
    // Load meta info
    const metaInf = useLoader(THREE.FileLoader, metaUrl, (loader)=>{
        loader.setResponseType('json')
    })
    const [geometry] = useState(()=>{
        if (!geometry) {
            buildGeometry()
        }
        return geometry
    })
    return (
        <mesh ref={mesh} geometry={geometry} {...props}>
            <depthKitMaterial {...{
                width: metaInf.textureWidth,
                height: metaInf.textureHeight,
                mindepth: metaInf.nearClip,
                maxdepth: metaInf.farClip,
                focalLength: metaInf.depthFocalLength,
                principalPoint: metaInf.depthPrincipalPoint,
                imageDimensions: metaInf.depthImageSize,
                crop: metaInf.crop
            }}>
                <videoTexture attach="videoTexture" args={[video]} minFilter={THREE.NearestFilter} magFilter={THREE.LinearFilter} format={THREE.RGBFormat} generateMipmaps={false}/>
            </depthKitMaterial>
        </mesh>
    );
}

// function buildGeometry() {
//     geometry = new THREE.Geometry();

//     for (let y = 0; y < VERTS_TALL; y++) {
//         for (let x = 0; x < VERTS_WIDE; x++) {
//             geometry.vertices.push(new THREE.Vector3(x, y, 0));
//         }
//     }
//     for (let y = 0; y < VERTS_TALL - 1; y++) {
//         for (let x = 0; x < VERTS_WIDE - 1; x++) {
//             geometry.faces.push(
//                 new THREE.Face3(
//                     x + y * VERTS_WIDE,
//                     x + (y + 1) * VERTS_WIDE,
//                     (x + 1) + y * (VERTS_WIDE)
//                 ));
//             geometry.faces.push(
//                 new THREE.Face3(
//                     x + 1 + y * VERTS_WIDE,
//                     x + (y + 1) * VERTS_WIDE,
//                     (x + 1) + (y + 1) * (VERTS_WIDE)
//                 ));
//         }
//     }
// }

// TODO: Update to use BufferGeometry instead of Geometry
function buildGeometry() {
    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(VERTS_WIDE * VERTS_TALL * 3);
    const uvs = new Float32Array(VERTS_WIDE * VERTS_TALL * 2);
    const index = new Uint32Array(VERTS_WIDE * VERTS_TALL * 6);
    let i = 0;
    let j = 0;
    for (let y = 0; y < VERTS_TALL; y++) {
        for (let x = 0; x < VERTS_WIDE; x++) {
            positions[i + 0] = x;
            positions[i + 1] = y;
            positions[i + 2] = 0;
            uvs[j + 0] = x / (VERTS_WIDE - 1);
            uvs[j + 1] = y / (VERTS_TALL - 1);
            i += 3;
            j += 2;
        }
    }
    i = 0;
    j = 0;
    for (let y = 0; y < VERTS_TALL - 1; y++) {
        for (let x = 0; x < VERTS_WIDE - 1; x++) {
            index[i + 0] = x + y * VERTS_WIDE;
            index[i + 1] = x + (y + 1) * VERTS_WIDE;
            index[i + 2] = (x + 1) + y * VERTS_WIDE;
            index[i + 3] = (x + 1) + y * VERTS_WIDE;
            index[i + 4] = x + (y + 1) * VERTS_WIDE;
            index[i + 5] = (x + 1) + (y + 1) * VERTS_WIDE;
            i += 6;
            j += 4;
        }
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.setIndex(new THREE.BufferAttribute(index, 1));
}

export {DepthKitObject, VERTS_TALL, VERTS_WIDE};