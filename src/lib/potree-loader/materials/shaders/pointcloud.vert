precision highp float;
precision highp int;

in vec3 position;
in vec3 normal;

uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;

uniform float pcIndex;
uniform float screenWidth;
uniform float screenHeight;
uniform float fov;
uniform float spacing;

#if defined use_clip_box
    uniform mat4 clipBoxes[max_clip_boxes];
#endif

uniform float heightMin;
uniform float heightMax;
uniform float size; // pixel size factor
uniform float minSize; // minimum pixel size
uniform float maxSize; // maximum pixel size
uniform float octreeSize;
uniform vec3 bbSize; // bounding box size?
uniform vec3 uColor;
uniform float opacity;
uniform float level;
uniform float time;
uniform vec3 distortionVector;
uniform float transitionAlpha;

uniform float filterByNormalThreshold;
uniform float opacityAttenuation;

// LOD calculation
uniform float vnStart;
uniform bool isLeafNode;
uniform sampler2D visibleNodes;

// Passed to fragment shader
uniform sampler2D depthMap;

#ifdef new_format
    in vec4 rgba;
#else
    in vec3 color;
#endif

out vec4 vColor; // Always vec4 for consistency
out float vOpacity;

#if defined(paraboloid_point_shape)
    out vec3 vViewPosition;
    out float vRadius;
#endif

#include lod.vert;
#include getRGB.vert;
#include colorConversion.vert;
#include psrddnoise2.glsl;

float pointNoise1(vec3 position) {
    return mix(0., (
        pow((psrddnoise(vec2(position.x * 5. + time, position.z * 5. + time), vec2(0., 0.), time * 0.2) * 0.05 -
		psrddnoise(vec2(position.x * 5. + time - 0.5, position.z * 5. + time - 0.5), vec2(0., 0.), time * 0.2) * 0.05) * 5., 3.0) * 0.5 +
        psrddnoise(vec2(position.x * 500., position.z * 500.), vec2(0., 0.), time * 20.) * 0.025
    ), 1. / level * 2.);
}

void main() {
	/**

	Notes:
	- "position" is position of the point in model space
	- "modelViewMatrix" transforms from model to view space (position relative to camera), a.k.a. extrinsic matrix
	- "projectionMatrix" transforms from view to clip space (position relative to the screen), a.k.a. intrinsic matrix

	*/

	// ---------------------
	// EFFECT CALCULATIONS
	// ---------------------

	vec4 worldPosition4 = modelMatrix * vec4(position, 1.0);
	vec3 worldPosition = worldPosition4.xyz / worldPosition4.w;
	vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);

	// DistortionModulator: [0, 1], calculates an individual point's distortion factor based on point indices, point color, noise, and disintegration factor.
	float distortionModulator = clamp(pow(abs(transitionAlpha), 5.0) * pow(length(vec3(rgba.x, rgba.y, rgba.z)), 3.0) , 0.0, 1.0);
	
	// Negative if alpha is negative, positive if alpha is positive or zero.
	float signAlpha = sign(transitionAlpha);

	// Calculate the new position of the point after applying distortion.
	vec3 finalPosition = mix(position, position + distortionVector * signAlpha, distortionModulator) + pointNoise1(worldPosition) * vec3(0.0, 0.0, 5.0) * pcIndex / 1000.0;

	// Calculate fade factor on distortion
	float fadeFactor = (1. - pow(distortionModulator, 3.0)) * (1.- (pow(abs(transitionAlpha), 3.0)));


	// ---------------------
	// POSITION
	// ---------------------

	vec4 mvPosition = modelViewMatrix * vec4(finalPosition, 1.0);
	gl_Position = projectionMatrix * mvPosition;

	#if defined(paraboloid_point_shape)
		vViewPosition = mvPosition.xyz;
	#endif

	// ---------------------
	// POINT SIZE
	// ---------------------

	float pointSize = 1.0;
	float slope = tan(fov / 2.0);
	float projFactor =  -0.5 * screenHeight / (slope * mvPosition.z);

	#if defined fixed_point_size
		pointSize = size;
	#elif defined attenuated_point_size
		pointSize = size * spacing * projFactor;
	#elif defined adaptive_point_size
		float worldSpaceSize = 2.0 * size * spacing / getPointSizeAttenuation();
		pointSize = worldSpaceSize * projFactor;
	#endif

	pointSize = max(minSize, pointSize);
	pointSize = min(maxSize, pointSize);

	#if defined(paraboloid_point_shape)
		vRadius = pointSize / projFactor;
	#endif

	gl_PointSize = pointSize * fadeFactor;

	// ---------------------
	// OPACITY
	// ---------------------

	#ifdef attenuated_opacity
		vOpacity = opacity * exp(-length(-mvPosition.xyz) / opacityAttenuation) * fadeFactor;
	#else
		vOpacity = opacity * fadeFactor;
	#endif

	// ---------------------
	// FILTERING
	// ---------------------

	#ifdef use_filter_by_normal
		if(abs((modelViewMatrix * vec4(normal, 0.0)).z) > filterByNormalThreshold) {
			// Move point outside clip space space to discard it.
			gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
		}
	#endif

	// ---------------------
	// POINT COLOR
	// ---------------------	

	#ifdef new_format
        vColor = rgba;
    #else
        vColor = vec4(color, 1.0); // Assign a default alpha of 1.0 for the old format
    #endif

    #if defined(output_color_encoding_sRGB) && defined(input_color_encoding_linear)
        vColor = toLinear(vColor);
    #endif

    #if defined(output_color_encoding_linear) && defined(input_color_encoding_sRGB)
        vColor = fromLinear(vColor);
    #endif

	// float lod = getLOD();
	// vColor = vec4(lod/10., 1.-lod/10., 1.-lod/10., 1.);
}
