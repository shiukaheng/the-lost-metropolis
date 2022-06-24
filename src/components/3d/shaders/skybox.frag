#version 300 es

precision highp float;
precision highp int;

// varying vec3 vReflect;
in vec3 viewRay;
out vec4 fragColor;

uniform samplerCube u_map;

void main() {
    vec4 cubeColor = texture( u_map, vec3( viewRay.x, viewRay.y, viewRay.z ) );
    cubeColor.w = 1.;
    fragColor = cubeColor;
}