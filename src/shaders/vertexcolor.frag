precision mediump float;

@import ./fog;

varying vec3 fragColor;
varying vec4 fragPosition;
uniform vec3 albedo;

void main(void) {
  gl_FragColor = vec4(Fog(length(fragPosition), fragColor * albedo), 1.0);
}
