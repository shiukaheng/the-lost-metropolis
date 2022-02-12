import { extend, useLoader, useThree, Vector3 } from "@react-three/fiber";
import { useContext, useEffect, useRef, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import * as THREE from "three";
import { ViewerContext } from "../viewer/ViewerContext";
import ErrorObject from "./subcomponents/ErrorObject";
import DepthKitMaterial from "./materials/DepthKitMaterial";

const VERTS_WIDE = 256;
const VERTS_TALL = 256;

extend({ DepthKitMaterial });

type DepthKitObjectProps = JSX.IntrinsicElements["mesh"] & {
  metaUrl: string;
  videoUrl: string;
  posterUrl?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  audioPositionOffset?: Vector3;
}

function DepthKitObject(props:DepthKitObjectProps) {
  return (
  <ErrorBoundary fallbackRender={({error, resetErrorBoundary}) => (
    <ErrorObject error={error} position={props.position} scale={props.scale} onClick={resetErrorBoundary} id={props.id}/>
  )}>
    <_DepthKitObject {...props} />
  </ErrorBoundary>);
}

function _DepthKitObject({ metaUrl="", videoUrl="", posterUrl="", autoplay=true, loop=true, muted=false, audioPositionOffset=[0,0,0], ...props }:DepthKitObjectProps) {
  const mesh = useRef(null);
  const audioGroupRef = useRef(null)
  const [positionalAudio, setPositionalAudio] = useState(null);

  useEffect(()=>{
    if (audioGroupRef.current && positionalAudio) {
      positionalAudio.removeFromParent()
      audioGroupRef.current.add(positionalAudio);
    }
    return (()=>{
      if (positionalAudio) {
        positionalAudio.removeFromParent()
      }
    })
  }, [positionalAudio])

  // Load meta info
  const metaInf = useLoader(THREE.FileLoader, metaUrl, (loader) => {
    loader.setResponseType("json");
  });

  return (
    <mesh ref={mesh} frustumCulled={false} {...props}>
      <DepthGeometry />
      <depthKitMaterial
        attach="material"
        {...{
          width: metaInf.textureWidth,
          height: metaInf.textureHeight,
          mindepth: metaInf.nearClip,
          maxdepth: metaInf.farClip,
          focalLength: [metaInf.depthFocalLength.x, metaInf.depthFocalLength.y],
          principalPoint: [
            metaInf.depthPrincipalPoint.x,
            metaInf.depthPrincipalPoint.y
          ],
          imageDimensions: [metaInf.depthImageSize.x, metaInf.depthImageSize.y],
          crop: [
            metaInf.crop.x,
            metaInf.crop.y,
            metaInf.crop.z,
            metaInf.crop.w
          ],
          extrinsics: metaInf.extrinsics
        }}
      >
        <AdvancedVideoTexture getPositionalAudio={setPositionalAudio} {...{videoUrl, posterUrl, autoplay, loop, muted}} />
      </depthKitMaterial>
      <group ref={audioGroupRef} position={audioPositionOffset}/>
    </mesh>
  );
}

// Wrapper for the cool videoTexture
function AdvancedVideoTexture({
  videoUrl = "",
  posterUrl = "",
  autoplay = true,
  loop = false,
  muted = true,
  getPositionalAudio = (audioSource: any) => {}
}) {
  const { audioListener } = useContext(ViewerContext)
  const [positionalAudio, setPositionalAudio] = useState(null);
  const [video] = useState(() => {
    const video = document.createElement("video");
    video.autoplay = true;
    video.crossOrigin = "anonymous";
    video.setAttribute("crossorigin", "anonymous");
    video.setAttribute("webkit-playsinline", "webkit-playsinline");
    video.setAttribute("playsinline", "playsinline");
    console.log(Date.now(), "Creating Video Element", video);
    const newPositionalAudio = new THREE.PositionalAudio(audioListener);
    // Override default source node with video element
    newPositionalAudio.setMediaElementSource(video);
    setPositionalAudio(newPositionalAudio);
    console.log(newPositionalAudio)
    return video;
  });
  useEffect(() => {
    if (positionalAudio) {
      getPositionalAudio(positionalAudio);
    }
  }, [positionalAudio]);
  // Clean up when we're done
  useEffect(() => {
    return () => {
      if (positionalAudio) {
        positionalAudio.disconnect();
        video.remove()
      }
    };
  }, []);
  // Change video source dynamically
  useEffect(() => {
    if (videoUrl) {
      video.src = videoUrl;
      video.load();
    }
  }, [video, videoUrl]);
  // Make poster url reactive
  useEffect(() => {
    if (video) {
      video.poster = posterUrl;
    }
  }, [video, posterUrl]);
  // Set autoplay, loop, muted
  useEffect(() => {
    if (video) {
      video.autoplay = autoplay;
      video.loop = loop;
      video.muted = muted;
    }
  }, [video, autoplay, loop, muted]);

  return (
    <videoTexture
      attach="videoTexture"
      args={[video]}
      minFilter={THREE.NearestFilter}
      magFilter={THREE.LinearFilter}
      format={THREE.RGBFormat}
      generateMipmaps={false}
    />
  );
}

// Wrapper for just the geo
function DepthGeometry() {
  const [geometry] = useState(() => buildGeometry());

  return <primitive object={geometry} attach="geometry" />;
}

function buildGeometry(verts_wide = VERTS_WIDE, verts_tall = VERTS_TALL) {
  var geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(verts_wide * verts_tall * 3);
  const uvs = new Float32Array(verts_wide * verts_tall * 2);
  const index = new Uint32Array(verts_wide * verts_tall * 6);
  let i = 0;
  let j = 0;
  for (let y = 0; y < verts_tall; y++) {
    for (let x = 0; x < verts_wide; x++) {
      positions[i + 0] = x;
      positions[i + 1] = y;
      positions[i + 2] = 0;
      uvs[j + 0] = x / (verts_wide - 1);
      uvs[j + 1] = y / (verts_tall - 1);
      i += 3;
      j += 2;
    }
  }
  i = 0;
  j = 0;
  for (let y = 0; y < verts_tall - 1; y++) {
    for (let x = 0; x < verts_wide - 1; x++) {
      index[i + 0] = x + y * verts_wide;
      index[i + 1] = x + (y + 1) * verts_wide;
      index[i + 2] = x + 1 + y * verts_wide;
      index[i + 3] = x + 1 + y * verts_wide;
      index[i + 4] = x + (y + 1) * verts_wide;
      index[i + 5] = x + 1 + (y + 1) * verts_wide;
      i += 6;
      j += 4;
    }
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(new THREE.BufferAttribute(index, 1));
  console.log(Date.now(), "Building Geometry from outside", geometry);
  return geometry;
}

// Thanks so much to https://github.com/DennisSmolek for fixing the loading issues!!!

export { DepthKitObject, VERTS_TALL, VERTS_WIDE, DepthKitObjectProps };
