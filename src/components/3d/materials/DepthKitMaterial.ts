import { extend, Object3DNode } from "@react-three/fiber";
import * as THREE from "three";
import rgbdVert from "../shaders/rgbd.vert";
import rgbdFrag from "../shaders/rgbd.frag";
import { VERTS_TALL, VERTS_WIDE } from "../DepthKitObject";

window.materials = []

class DepthKitMaterial extends THREE.ShaderMaterial {
    constructor() {
        super({
            uniforms: {
                "map": {
                    type: "t",
                    value: undefined
                },
                "time": {
                    type: "f",
                    value: 0.0
                },
                "mindepth": {
                    type: "f",
                    value: 0.0
                },
                "maxdepth": {
                    type: "f",
                    value: 0.0
                },
                "meshDensity": {
                    value: new THREE.Vector2(VERTS_WIDE, VERTS_TALL)
                },
                "focalLength": {
                    value: new THREE.Vector2(1,1)
                },
                "principalPoint": {
                    value: new THREE.Vector2(1,1)
                },
                "imageDimensions": {
                    value: new THREE.Vector2(512,828)
                },
                "extrinsics": {
                    value: new THREE.Matrix4()
                },
                "crop": {
                    value: new THREE.Vector4(0,0,1,1)
                },
                "width": {
                    type: "f",
                    value: 0
                },
                "height": {
                    type: "f",
                    value: 0
                },
                "opacity": {
                    type: "f",
                    value: 1.0
                },
                "isPoints": {
                    type: "b",
                    value: false
                },
                "pointSize": {
                    type: "f",
                    value: 3.0
                }
            },
            vertexShader: rgbdVert, // TODO
            fragmentShader: rgbdFrag, // TODO
            transparent: true
        })
        this.side = THREE.DoubleSide
        window.materials.push(this)
    }
    get videoTexture() {
        return this.uniforms.map.value
    }
    set videoTexture(videoTexture) {
        this.uniforms.map.value = videoTexture
    }
    // expose width, height, mindepth, maxdepth, focalLength, principalPoint, imageDimensions, crop, isPoints
    get width() {
        return this.uniforms.width.value
    }
    set width(width) {
        this.uniforms.width.value = width
    }
    get height() {
        return this.uniforms.height.value
    }
    set height(height) {
        this.uniforms.height.value = height
    }
    get mindepth() {
        return this.uniforms.mindepth.value
    }
    set mindepth(mindepth) {
        this.uniforms.mindepth.value = mindepth
    }
    get maxdepth() {
        return this.uniforms.maxdepth.value
    }
    set maxdepth(maxdepth) {
        this.uniforms.maxdepth.value = maxdepth
    }
    get focalLength() {
        return this.uniforms.focalLength.value
    }
    set focalLength(focalLength) {
        this.uniforms.focalLength.value = focalLength
    }
    get principalPoint() {
        return this.uniforms.principalPoint.value
    }
    set principalPoint(principalPoint) {
        this.uniforms.principalPoint.value = principalPoint
    }
    get imageDimensions() {
        return this.uniforms.imageDimensions.value
    }
    set imageDimensions(imageDimensions) {
        this.uniforms.imageDimensions.value = imageDimensions
    }
    get crop() {
        return this.uniforms.crop.value
    }
    set crop(crop) {
        this.uniforms.crop.value = crop
    }
    get isPoints() {
        return this.uniforms.isPoints.value
    }
    set isPoints(isPoints) {
        this.uniforms.isPoints.value = isPoints
    }
    // expose extrinsics, but get / set as an object that represents a THREE.Matrix4 using keys "e<column><row>"
    get extrinsics() {
        return {
            e00: this.uniforms.extrinsics.value.elements[0],
            e10: this.uniforms.extrinsics.value.elements[1],
            e20: this.uniforms.extrinsics.value.elements[2],
            e30: this.uniforms.extrinsics.value.elements[3],
            e01: this.uniforms.extrinsics.value.elements[4],
            e11: this.uniforms.extrinsics.value.elements[5],
            e21: this.uniforms.extrinsics.value.elements[6],
            e31: this.uniforms.extrinsics.value.elements[7],
            e02: this.uniforms.extrinsics.value.elements[8],
            e12: this.uniforms.extrinsics.value.elements[9],
            e22: this.uniforms.extrinsics.value.elements[10],
            e32: this.uniforms.extrinsics.value.elements[11],
            e03: this.uniforms.extrinsics.value.elements[12],
            e13: this.uniforms.extrinsics.value.elements[13],
            e23: this.uniforms.extrinsics.value.elements[14],
            e33: this.uniforms.extrinsics.value.elements[15]
        }
    }
    set extrinsics(extrinsics) {
        this.uniforms.extrinsics.value.set(
            extrinsics.e00, extrinsics.e10, extrinsics.e20, extrinsics.e30,
            extrinsics.e01, extrinsics.e11, extrinsics.e21, extrinsics.e31,
            extrinsics.e02, extrinsics.e12, extrinsics.e22, extrinsics.e32,
            extrinsics.e03, extrinsics.e13, extrinsics.e23, extrinsics.e33
        )
    }
}

extend({DepthKitMaterial})

declare global {
    namespace JSX {
        interface IntrinsicElements {
            depthKitMaterial: Object3DNode<DepthKitMaterial, typeof DepthKitMaterial>
        }
    }
}

export default DepthKitMaterial