precision mediump float;

@import ./fog;

varying vec3 fragNormal;
varying vec4 fragPosition;
uniform vec3 albedo;

const vec3 light = vec3(-0.3, 0.6, 0.3);

void main(void) {
  vec3 normal = normalize(fragNormal);
  float diffuse = max(dot(normal, light), 0.6);
  gl_FragColor = vec4(Fog(length(fragPosition), albedo * diffuse), 1.0);
}
