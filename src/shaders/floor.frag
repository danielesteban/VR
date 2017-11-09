#extension GL_OES_standard_derivatives : enable

precision mediump float;

varying vec2 gridPosition;

void main(void) {
  vec2 grid = abs(fract(gridPosition - 0.5) - 0.5) / fwidth(gridPosition);
  float circle = length(gridPosition);
  circle = abs(fract(circle - 0.5) - 0.5) / fwidth(circle);

  float intensity = min(min(circle * 1.5, min(grid.x, grid.y)), 1.0);

  gl_FragColor = vec4(vec3(0, 0.094, 0.282) * (1.0 - intensity), 1.0);
}
