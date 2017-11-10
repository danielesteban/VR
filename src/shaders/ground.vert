precision mediump float;

attribute vec3 position;
varying vec4 fragPosition;
varying vec2 gridPosition;
uniform mat4 projection;
uniform mat4 view;

void main(void) {
  gl_Position = projection * view * vec4(position, 1.0);
  fragPosition = view * vec4(position, 1.0);
  gridPosition = position.xy;
}
