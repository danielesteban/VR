precision mediump float;

attribute vec3 position;
varying vec2 gridPosition;
uniform mat4 projection;
uniform mat4 view;

void main(void) {
  gl_Position = projection * view * vec4(position, 1.0);
  gridPosition = vec2(position.x, position.y);
}
