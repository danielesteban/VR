precision highp float;

varying float fragAlpha;

void main(void) {
  gl_FragColor = vec4(vec3(fragAlpha), fragAlpha);
}
