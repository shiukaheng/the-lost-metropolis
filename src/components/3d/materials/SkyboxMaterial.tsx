import { DoubleSide, LinearEncoding, RawShaderMaterial, ShaderMaterial, sRGBEncoding } from "three";
import skyboxVert from "../shaders/skybox.vert?raw";
import skyboxFrag from "../shaders/skybox.frag?raw";
import { extend, Object3DNode } from "@react-three/fiber";

export class SkyboxMaterial extends ShaderMaterial {
    // Exposes a map property for the CubeTexture used for the skybox.
    _map: THREE.CubeTexture;
    constructor(map: THREE.CubeTexture) {
        super();
        this._map = map;
        this.uniforms = {
            u_map: { value: map }
        };
        this.vertexShader = skyboxVert
        this.fragmentShader = skyboxFrag
        this.side = DoubleSide
    }
    // Getters and setters for the map property.
    set map(map: THREE.CubeTexture) {
        this._map = map;
        this.uniforms.u_map.value = map;
    }
    get map(): THREE.CubeTexture {
        return this._map;
    }
}

extend({SkyboxMaterial})

declare global {
    namespace JSX {
        interface IntrinsicElements {
            skyboxMaterial: Object3DNode<SkyboxMaterial, typeof SkyboxMaterial>
        }
    }
}
