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
	out vec4 vColor;
#else
	in vec3 color;
	out vec3 vColor;
#endif

out float vOpacity;

#if defined(paraboloid_point_shape)
	out vec3 vViewPosition;
	out float vRadius;
#endif

// out vec3 vNormal;

#include lod.vert;
#include getRGB.vert;
#include colorConversion.vert;
// #include snoise4d.glsl;
#include psrddnoise2.glsl;

float pointNoise1(vec3 position) {
	return (
		// psrddnoise(vec2(position.x * 10., position.y * 10.), vec2(0., 0.), time) * 0.1 +
		psrddnoise(vec2(position.x * 20., position.y * 20.), vec2(0., 0.), time) * 0.05 +
		psrddnoise(vec2(position.x * 100., position.y * 100.), vec2(0., 0.), time) * 0.025
	);
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
	
	// Disintegration factor: [0, 1], controls how much the point cloud is disintegrated.
	float disintegrationFactor = mod(time, 10.0) / 10.0;

	// DistortionModulator: [0, 1], calculates an individual point's distortion factor based on point indices, point color, noise, and disintegration factor.
	float distortionModulator = clamp(pow(disintegrationFactor - pcIndex * 0.001 + pointNoise1(position), 5.0) * pow(length(vec3(rgba.x, rgba.y, rgba.z)), 3.0) , 0.0, 1.0);
	
	// Calculate the new position of the point after applying distortion.
	vec3 finalPosition = mix(position, position + vec3(0.0, 0.0, 2.0), distortionModulator);


	// ---------------------
	// POSITION
	// ---------------------

	vec4 mvPosition = modelViewMatrix * vec4(finalPosition, 1.0);
	gl_Position = projectionMatrix * mvPosition;
	#if defined(paraboloid_point_shape)
		vViewPosition = mvPosition.xyz;
	#endif

	// vNormal = normalize(normalMatrix * normal);
	// vLogDepth = log2(-mvPosition.z);
	// float linearDepth = -mvPosition.z ;
	// float expDepth = (gl_Position.z / gl_Position.w) * 0.5 + 0.5;
	// vColor = vec3(linearDepth, expDepth, 0.0);

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

	gl_PointSize = pointSize;

	// ---------------------
	// OPACITY
	// ---------------------

	#ifdef attenuated_opacity
		vOpacity = opacity * exp(-length(-mvPosition.xyz) / opacityAttenuation);
	#else
		vOpacity = (1. - pow(distortionModulator, 3.0)) * (1.- (pow(disintegrationFactor, 3.0)));
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
	#elif defined color_type_rgb
		vColor = getRGB();
	#endif

	#if defined(output_color_encoding_sRGB) && defined(input_color_encoding_linear)
		vColor = toLinear(vColor);
	#endif

	#if defined(output_color_encoding_linear) && defined(input_color_encoding_sRGB)
		vColor = fromLinear(vColor);
	#endif
}
