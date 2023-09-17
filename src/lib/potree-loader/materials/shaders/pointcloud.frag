precision highp float;
precision highp int;
uniform mat4 viewMatrix;
uniform vec3 cameraPosition;
uniform mat4 projectionMatrix;
uniform float opacity;
uniform float blendHardness;
uniform float blendDepthSupplement;
uniform float fov;
uniform float spacing;
uniform float pcIndex;
uniform float screenWidth;
uniform float screenHeight;
uniform sampler2D depthMap;

out vec4 fragColor;
in float vOpacity;

#ifdef new_format
    in vec4 vColor;
#else
    in vec3 vColor;
#endif

#if defined(paraboloid_point_shape)
    in vec3 vViewPosition;
    in float vRadius;  // Moved this inside the paraboloid_point_shape check to ensure proper use.
#endif

void main() {

    vec3 actualColor;

    #ifdef new_format
        actualColor = vColor.xyz;
    #else
        actualColor = vColor;
    #endif

    vec3 color = actualColor;
    float depth = gl_FragCoord.z;

    #if defined(circle_point_shape) || defined(paraboloid_point_shape) || defined(weighted_splats)
        float u = 2.0 * gl_PointCoord.x - 1.0;
        float v = 2.0 * gl_PointCoord.y - 1.0;
    #endif

    fragColor = vec4(color, vOpacity);

    #if defined paraboloid_point_shape
        float wi = 0.0 - (u*u + v*v);
        vec4 pos = vec4(vViewPosition, 1.0);
        pos.z += wi * vRadius;
        float linearDepth = -pos.z;
        pos = projectionMatrix * pos;
        pos = pos / pos.w;
        float expDepth = pos.z;
        depth = (pos.z + 1.0) / 2.0;
        gl_FragDepth = depth;

        #if defined(color_type_depth)
            fragColor.r = linearDepth;
            fragColor.g = expDepth;
        #endif

        #if defined(use_edl)
            fragColor.a = log2(linearDepth);
        #endif
    #endif

}
