precision mediump float;

attribute vec3 position;
attribute vec3 color;
varying vec3 fragColor;
varying vec4 fragPosition;
uniform mat4 projection;
uniform mat4 view;

void main(void) {
  gl_Position = projection * view * vec4(position, 1.0);
  fragColor = color;
  fragPosition = view * vec4(position, 1.0);
}
