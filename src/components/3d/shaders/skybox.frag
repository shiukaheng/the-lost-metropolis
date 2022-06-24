precision highp float;
precision highp int;

// in vec3 viewRay;
// out vec4 fragColor;

varying vec3 viewRay;
uniform samplerCube u_map;

vec4 sRGBToLinear( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}

vec4 LinearToSRGB( in vec4 value ) {
    return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}

void main() {
    vec4 cubeColor = textureCube( u_map, vec3( viewRay.x, viewRay.y, viewRay.z ) );
    cubeColor.w = 1.;
    gl_FragColor = cubeColor;
    #include <tonemapping_fragment>
    #include <encodings_fragment>
}

