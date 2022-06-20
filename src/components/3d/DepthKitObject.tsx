import { extend, useLoader, useThree, Vector3 } from "@react-three/fiber";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import * as THREE from "three";
import { ViewerContext } from "../viewer/ViewerContext";
import ErrorObject from "./subcomponents/ErrorObject";
import DepthKitMaterial from "./materials/DepthKitMaterial";
import { VaporComponent, VaporComponentProps } from "../viewer/ComponentDeclarations";
import { genericInputs } from "../viewer/genericInputs"
import { BooleanType, NumberType, URLType, Vector3Type } from "../viewer/ArgumentTypes";
import { useThreeEventListener } from "../../utilities";

const VERTS_WIDE = 256;
const VERTS_TALL = 256;

extend({ DepthKitMaterial });

type DepthKitObjectProps = VaporComponentProps & {
  metaUrl: string;
  videoUrl: string;
  posterUrl?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  audioPositionOffset?: Vector3;
  volume?: number;
}

export const DepthKitObject: VaporComponent = (props:DepthKitObjectProps) => {
  return (
  <ErrorBoundary fallbackRender={({error, resetErrorBoundary}) => (
    <ErrorObject error={error} position={props.position} scale={props.scale} onClick={resetErrorBoundary} objectID={props.objectID}/>
  )}>
    <_DepthKitObject {...props} />
  </ErrorBoundary>);
}

function _DepthKitObject({ metaUrl="", videoUrl="", posterUrl="", autoplay=true, loop=true, muted=false, audioPositionOffset=[0,0,0], volume=1, ...props }:DepthKitObjectProps) {
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

type metaInfType = {
  width: number;
  height: number;
  nearClip: number;
  farClip: number;
  depthFocalLength: { x: number; y: number };
  depthPrincipalPoint: { x: number; y: number };
  depthImageSize: { x: number; y: number };
  crop: { x: number; y: number; z: number; w: number };
  extrinsics: {
    e00: number;
    e01: number;
    e02: number;
    e03: number;
    e10: number;
    e11: number;
    e12: number;
    e13: number;
    e20: number;
    e21: number;
    e22: number;
    e23: number;
    e30: number;
    e31: number;
    e32: number;
    e33: number;
  };
}

// Wrapper for the cool videoTexture
function AdvancedVideoTexture({
  videoUrl = "",
  posterUrl = "",
  autoplay = true,
  loop = false,
  muted = true,
  volume = 1,
  getPositionalAudio = (audioSource: any) => {}
}) {
  const { audioListener, xrMode, eventDispatcher } = useContext(ViewerContext)
  const gl = useThree((state)=>state.gl)
  const [positionalAudio, setPositionalAudio] = useState(null);
  const [video] = useState(() => {
    const video = document.createElement("video");
    video.autoplay = true;
    video.crossOrigin = "anonymous";
    video.setAttribute("crossorigin", "anonymous");
    video.setAttribute("webkit-playsinline", "webkit-playsinline");
    video.setAttribute("playsinline", "playsinline");
    // console.log(Date.now(), "Creating Video Element", video);
    const newPositionalAudio = new THREE.PositionalAudio(audioListener);
    // Override default source node with video element
    newPositionalAudio.setMediaElementSource(video);
    setPositionalAudio(newPositionalAudio);
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
      video.loop = loop;
      video.autoplay = autoplay; // For videos with sound, autoplay will only start when user first interacts with the page
      video.muted = muted;
      video.volume = volume;
    }
  }, [video, loop, autoplay, muted, volume]);
  // Make video autoplay on first interaction
  const playVideo = useCallback(() => {
    if (video) {
      video.play();
    }
  }, [video]);
  useThreeEventListener("audio-start", playVideo, eventDispatcher);
  
  // Trigger play if audio context is resumed, 
  return (
    <videoTexture
      attach="videoTexture"
      args={[video]}
      minFilter={THREE.NearestFilter}
      magFilter={THREE.LinearFilter}
      format={THREE.RGBAFormat}
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
  // console.log(Date.now(), "Building Geometry from outside", geometry);
  return geometry;
}

DepthKitObject.displayName = "DepthKit Object";
DepthKitObject.componentType = "DepthKitObject";
DepthKitObject.inputs = {
  ...genericInputs,
  metaUrl: {
      type: URLType,
      default: "http://localhost/depthkit.json"
  },
  videoUrl: {
      type: URLType,
      default: "http://localhost/depthkit.mp4"
  },
  posterUrl: {
      type: URLType,
      default: "http://localhost/depthkit.jpg"
  },
  autoplay: {
      type: BooleanType,
      default: true
  },
  loop: {
      type: BooleanType,
      default: true
  },
  volume: {
      type: NumberType,
      default: 1
  },
  muted: {
      type: BooleanType,
      default: false
  },
  audioPositionOffset: {
      type: Vector3Type,
      default: [0, 0, 0]
  }
}

// Thanks so much to https://github.com/DennisSmolek for fixing the loading issues!!!

export { VERTS_TALL, VERTS_WIDE, DepthKitObjectProps };