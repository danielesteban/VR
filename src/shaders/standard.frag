precision highp float;

@import ./fog;
@import ./lighting;

varying vec3 fragNormal;
varying vec4 fragPosition;
uniform vec3 albedo;

void main(void) {
  gl_FragColor = vec4(Fog(length(fragPosition), albedo * lighting(fragNormal)), 1.0);
}
