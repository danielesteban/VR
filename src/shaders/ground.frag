#extension GL_OES_standard_derivatives : enable

precision mediump float;

@import ./fog;

varying vec4 fragPosition;
varying vec2 gridPosition;

void main(void) {
  vec2 grid = abs(fract(gridPosition - 0.5) - 0.5) / fwidth(gridPosition);
  float circle = length(gridPosition);
  circle = abs(fract(circle - 0.5) - 0.5) / fwidth(circle);

  float intensity = min(min(circle * 1.5, min(grid.x, grid.y)), 1.0);
  vec3 color = vec3(0.3, 0, 0.1) * (1.0 - intensity);

  gl_FragColor = vec4(Fog(length(fragPosition), color), 1.0);
}
