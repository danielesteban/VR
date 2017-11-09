precision mediump float;

varying vec3 fragAlbedo;

void main(void) {
  gl_FragColor = vec4(fragAlbedo, 1.0);
}
