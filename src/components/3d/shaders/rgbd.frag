// highp float;

varying float visibility;

in vec4 color;

void main() {

    if ( visibility < 0.8 ) discard;
    gl_FragColor = color;
    
}