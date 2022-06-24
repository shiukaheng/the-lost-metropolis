#version 300 es

precision highp float;
precision highp int;

uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
// uniform mat3 normalMatrix;
uniform vec3 cameraPosition;

in vec3 position;
out vec3 viewRay;

void main() {
    vec3 worldPosition = ( modelMatrix * vec4( position, 1.0 )).xyz; // Represents the position of the vertex in world space
    vec3 cameraToVertex = normalize( worldPosition - cameraPosition ); // Represents the vector from the camera to the vertex
    viewRay = normalize( ( inverse(modelMatrix) * vec4( cameraToVertex, 0.0 )).xyz );
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}