precision mediump float;

@import ./fog;

varying vec4 fragPosition;
uniform vec3 albedo;

void main(void) {
  gl_FragColor = vec4(Fog(length(fragPosition), albedo), 1.0);
}
