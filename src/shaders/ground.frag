#extension GL_OES_standard_derivatives : enable

precision mediump float;

@import ./fog;
@import ./lighting;

varying vec3 fragNormal;
varying vec4 fragPosition;
varying vec2 gridPosition;

const vec3 color = vec3(0.282, 0.11, 0);

void main(void) {
  vec2 grid = abs(fract(gridPosition - 0.5) - 0.5) / fwidth(gridPosition);
  float circle = length(gridPosition);
  circle = abs(fract(circle - 0.5) - 0.5) / fwidth(circle);

  float intensity = min(min(circle * 1.5, min(grid.x, grid.y)), 1.0);

  gl_FragColor = vec4(Fog(length(fragPosition), (color * 0.5 + color * (1.0 - intensity)) * lighting(fragNormal)), 1.0);
}
