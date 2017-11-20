precision highp float;

attribute vec3 position;
attribute float alpha;
varying float fragAlpha;
uniform mat4 projection;
uniform mat4 view;

void main(void) {
  gl_Position = projection * view * vec4(position, 1.0);
  gl_PointSize = 1.0;
  fragAlpha = alpha;
}
