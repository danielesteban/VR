precision mediump float;

attribute vec3 position;
attribute vec3 normal;
varying vec3 fragNormal;
varying vec4 fragPosition;
uniform mat3 normalView;
uniform mat4 projection;
uniform mat4 view;

void main(void) {
  gl_Position = projection * view * vec4(position, 1.0);
  fragNormal = normalView * normal;
  fragPosition = view * vec4(position, 1.0);
}
