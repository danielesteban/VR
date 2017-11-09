precision mediump float;

attribute vec3 position;
attribute vec3 albedo;
varying vec3 fragAlbedo;
uniform mat4 projection;
uniform mat4 view;

void main(void) {
  gl_Position = projection * view * vec4(position, 1.0);
  fragAlbedo = albedo;
}
